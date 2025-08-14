import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Request, Response, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Paystack webhook secret
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || 'your_webhook_secret';

// Verify Paystack webhook signature
const verifyPaystackWebhook = (req: Request, res: Response, next: any): void => {
  const signature = req.headers['x-paystack-signature'] as string;
  const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!signature || !PAYSTACK_WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Missing signature or secret' });
    return;
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
};

// Paystack webhook endpoint
router.post('/paystack', verifyPaystackWebhook, async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    console.log('📨 Paystack webhook received:', event, data.reference);

    if (event === 'charge.success') {
      // Payment was successful
      const { reference, amount, status, metadata } = data;
      
      // Find the payment request by reference
      const paymentRequest = await prisma.payment_requests.findFirst({
        where: { paystack_reference: reference }
      });

      if (paymentRequest) {
        // Update payment request status
        await prisma.payment_requests.update({
          where: { id: paymentRequest.id },
          data: {
            status: 'PAID',
            paid_at: new Date()
          }
        });

        // Create a transaction record
        await prisma.transactions.create({
          data: {
            sender_account_id: paymentRequest.payer_id, // This should be the actual payer's account
            recipient_account_id: paymentRequest.requester_id, // This should be the actual recipient's account
            amount: paymentRequest.amount,
            currency: paymentRequest.currency,
            category: 'OTHER',
            status: 'COMPLETED',
            description: paymentRequest.description || 'Payment request completed',
            reference: reference,
            idempotency_key: `webhook_${reference}`,
            updated_at: new Date(),
            metadata: {
              paymentRequestId: paymentRequest.id,
              paystackReference: reference,
              paystackAmount: amount
            }
          }
        });

        console.log('✅ Payment request marked as paid:', paymentRequest.id);
      } else {
        console.log('⚠️ Payment request not found for reference:', reference);
      }
    } else if (event === 'charge.failed') {
      // Payment failed
      const { reference } = data;
      
      const paymentRequest = await prisma.payment_requests.findFirst({
        where: { paystack_reference: reference }
      });

      if (paymentRequest) {
        await prisma.payment_requests.update({
          where: { id: paymentRequest.id },
          data: { status: 'EXPIRED' }
        });
        
        console.log('❌ Payment request marked as expired:', paymentRequest.id);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Test webhook endpoint
router.post('/test', (req: Request, res: Response) => {
  console.log('🧪 Test webhook received:', req.body);
  res.status(200).json({ 
    message: 'Test webhook received',
    timestamp: new Date(),
    data: req.body
  });
});

export default router;
