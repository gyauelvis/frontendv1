import axios from 'axios';
import crypto from 'crypto';
import { Request, Response, Router } from 'express';
import { loadConfig } from '../config/config';
import prisma from '../config/database';
import { ApiResponse } from '../types';

const router = Router();
const config = loadConfig();

// Paystack configuration
const PAYSTACK_SECRET_KEY = config.paystack.secretKey;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Create payment request
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { payerId, amount, currency, description } = req.body;
    
    if (!payerId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: payerId, amount, currency',
        timestamp: new Date()
      });
    }

    // Get the payer user
    const payerUser = await prisma.users.findUnique({
      where: { id: payerId }
    });

    if (!payerUser) {
      return res.status(400).json({
        success: false,
        message: 'Payer user not found',
        timestamp: new Date()
      });
    }

    console.log('Using payer user ID:', payerUser.id);

    // Create payment request in database
    const paymentRequest = await prisma.payment_requests.create({
      data: {
        requester_id: payerId, // For demo, same user requests and pays
        payer_id: payerId,
        amount: parseFloat(amount),
        currency,
        description,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    // Initialize Paystack payment
    console.log('🚀 Initializing Paystack payment for amount:', amount);
    console.log('🔑 Paystack Secret Key available:', !!PAYSTACK_SECRET_KEY);
    console.log('🌐 Paystack Base URL:', PAYSTACK_BASE_URL);
    
    try {
      const paystackResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          amount: Math.round(parseFloat(amount) * 100), // Convert to kobo
          email: payerUser.email, // Use actual payer email
          reference: paymentRequest.id,
          callback_url: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/callback`,
          metadata: {
            payment_request_id: paymentRequest.id,
            requester_id: paymentRequest.requester_id,
            payer_id: paymentRequest.payer_id
          }
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Paystack payment initialized:', paystackResponse.data.data.authorization_url);

      // Update payment request with Paystack data
      const updatedRequest = await prisma.payment_requests.update({
        where: { id: paymentRequest.id },
        data: {
          paystack_payment_url: paystackResponse.data.data.authorization_url,
          paystack_reference: paystackResponse.data.data.reference,
          paystack_amount: paystackResponse.data.data.amount
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Payment request created successfully',
        data: updatedRequest,
        timestamp: new Date()
      };

      return res.status(201).json(response);
    } catch (paystackError: any) {
      console.error('❌ Paystack integration failed:', paystackError);
      console.error('❌ Paystack error details:', paystackError.response?.data);
      
      // Create payment request without Paystack for now
      const response: ApiResponse = {
        success: true,
        message: 'Payment request created (Paystack integration failed)',
        data: paymentRequest,
        timestamp: new Date()
      };

      return res.status(201).json(response);
    }
  } catch (error) {
    console.error('Error creating payment request:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to create payment request',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// Get user's payment requests
router.get('/requests/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const whereClause: any = {
      OR: [
        { requester_id: userId },
        { payer_id: userId }
      ]
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const paymentRequests = await prisma.payment_requests.findMany({
      where: whereClause,
      include: {
        users_requester: {
          select: { first_name: true, last_name: true, email: true }
        },
        users_payer: {
          select: { first_name: true, last_name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Payment requests retrieved successfully',
      data: paymentRequests,
      timestamp: new Date()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch payment requests',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

// Get payment request details
router.get('/requests/detail/:requestId', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const paymentRequest = await prisma.payment_requests.findUnique({
      where: { id: requestId },
      include: {
        users_requester: {
          select: { first_name: true, last_name: true, email: true }
        },
        users_payer: {
          select: { first_name: true, last_name: true, email: true }
        }
      }
    });

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found',
        timestamp: new Date()
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Payment request retrieved successfully',
      data: paymentRequest,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching payment request:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch payment request',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// Cancel payment request
router.put('/requests/:requestId/cancel', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const paymentRequest = await prisma.payment_requests.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Payment request cancelled successfully',
      data: paymentRequest,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error cancelling payment request:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to cancel payment request',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// Mark payment request as paid
router.put('/requests/:requestId/paid', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { paystack_reference } = req.body;

    const paymentRequest = await prisma.payment_requests.update({
      where: { id: requestId },
      data: { 
        status: 'PAID',
        paid_at: new Date(),
        paystack_reference: paystack_reference || undefined
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Payment request marked as paid',
      data: paymentRequest,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to mark payment as paid',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// Get payment status from Paystack
router.get('/status/:paystack_reference', async (req: Request, res: Response) => {
  try {
    const { paystack_reference } = req.params;

    const paystackResponse = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${paystack_reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const response: ApiResponse = {
      success: true,
      message: 'Payment status retrieved successfully',
      data: paystackResponse.data,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch payment status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// Transfer money between accounts
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const { senderAccountId, recipientAccountId, amount, currency, description } = req.body;

    // Validate required fields
    if (!senderAccountId || !recipientAccountId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: senderAccountId, recipientAccountId, amount, currency',
        timestamp: new Date()
      });
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
        timestamp: new Date()
      });
    }

    // Get sender account and check balance
    const senderAccount = await prisma.accounts.findUnique({
      where: { id: senderAccountId },
      include: { users: true }
    });

    if (!senderAccount) {
      return res.status(404).json({
        success: false,
        message: 'Sender account not found',
        timestamp: new Date()
      });
    }

    if (Number(senderAccount.available_balance) < transferAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds',
        timestamp: new Date()
      });
    }

    // Get recipient account
    const recipientAccount = await prisma.accounts.findUnique({
      where: { id: recipientAccountId },
      include: { users: true }
    });

    if (!recipientAccount) {
      return res.status(404).json({
        success: false,
        message: 'Recipient account not found',
        timestamp: new Date()
      });
    }

    // Create transaction record
    const transaction = await prisma.transactions.create({
      data: {
        id: crypto.randomUUID(),
        idempotency_key: `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender_account_id: senderAccountId,
        recipient_account_id: recipientAccountId,
        amount: transferAmount,
        currency,
        category: 'OTHER',
        description: description || 'Money transfer',
        status: 'COMPLETED',
        reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date(),
        completed_at: new Date(),
        updated_at: new Date()
      }
    });

    // Update sender account balance
    await prisma.accounts.update({
      where: { id: senderAccountId },
      data: {
        balance: Number(senderAccount.balance) - transferAmount,
        available_balance: Number(senderAccount.available_balance) - transferAmount
      }
    });

    // Update recipient account balance
    await prisma.accounts.update({
      where: { id: recipientAccountId },
      data: {
        balance: Number(recipientAccount.balance) + transferAmount,
        available_balance: Number(recipientAccount.available_balance) + transferAmount
      }
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: transferAmount,
        currency,
        senderAccount: {
          id: senderAccount.id,
          accountNumber: senderAccount.account_number,
          newBalance: Number(senderAccount.balance) - transferAmount
        },
        recipientAccount: {
          id: recipientAccount.id,
          accountNumber: recipientAccount.account_number,
          newBalance: Number(recipientAccount.balance) + transferAmount
        },
        timestamp: transaction.created_at
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Transfer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Transfer failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// Look up account by phone number or email
router.get('/lookup/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    console.log('🔍 Looking up user with identifier:', identifier);

    // Find user by phone number or email
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { phone_number: identifier },
          { phone_number: identifier.replace(/\D/g, '') }, // Remove non-digits
          { phone_number: identifier.replace(/^\+/, '') }, // Remove leading +
          { email: identifier }
        ]
      },
      include: {
        accounts: true
      }
    });

    console.log('🔍 User lookup result:', user ? 'Found' : 'Not found');
    if (user) {
      console.log('🔍 User details:', {
        id: user.id,
        email: user.email,
        phone: user.phone_number,
        name: `${user.first_name} ${user.last_name}`,
        accountsCount: user.accounts.length
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date()
      });
    }

    // Return user and account info (without sensitive data)
    return res.status(200).json({
      success: true,
      message: 'User found',
      data: {
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        email: user.email,
        accounts: user.accounts.map(account => ({
          id: account.id,
          accountNumber: account.account_number,
          accountType: account.account_type,
          currency: account.currency
        }))
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Account lookup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Account lookup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// Get user's own accounts
router.get('/accounts/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const accounts = await prisma.accounts.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        account_number: true,
        balance: true,
        available_balance: true,
        currency: true,
        account_type: true,
        status: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Accounts retrieved successfully',
      data: accounts.map(account => ({
        id: account.id,
        accountNumber: account.account_number,
        balance: account.balance,
        availableBalance: account.available_balance,
        currency: account.currency,
        accountType: account.account_type,
        status: account.status
      })),
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve accounts',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// Get user's transaction history
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    
    // For demo purposes, get transactions for the test user
    // In production, this would come from authentication middleware
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const actualUserId = (userId as string) || testUserId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get transactions where user is either sender or recipient
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [
          {
            accounts_transactions_sender_account_idToaccounts: {
              user_id: actualUserId
            }
          },
          {
            accounts_transactions_recipient_account_idToaccounts: {
              user_id: actualUserId
            }
          }
        ]
      },
      include: {
        accounts_transactions_sender_account_idToaccounts: {
          include: {
            users: true
          }
        },
        accounts_transactions_recipient_account_idToaccounts: {
          include: {
            users: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: offset,
      take: limitNum
    });

    // Get total count for pagination
    const totalTransactions = await prisma.transactions.count({
      where: {
        OR: [
          {
            accounts_transactions_sender_account_idToaccounts: {
              user_id: actualUserId
            }
          },
          {
            accounts_transactions_recipient_account_idToaccounts: {
              user_id: actualUserId
            }
          }
        ]
      }
    });

    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.accounts_transactions_sender_account_idToaccounts.user_id === actualUserId ? 'SENT' : 'RECEIVED',
      amount: Number(tx.amount),
      currency: tx.currency,
      category: tx.category,
      description: tx.description,
      status: tx.status,
      reference: tx.reference,
      createdAt: tx.created_at,
      counterparty: tx.accounts_transactions_sender_account_idToaccounts.user_id === actualUserId 
        ? `${tx.accounts_transactions_recipient_account_idToaccounts.users.first_name} ${tx.accounts_transactions_recipient_account_idToaccounts.users.last_name}`
        : `${tx.accounts_transactions_sender_account_idToaccounts.users.first_name} ${tx.accounts_transactions_sender_account_idToaccounts.users.last_name}`,
      counterpartyEmail: tx.accounts_transactions_sender_account_idToaccounts.user_id === actualUserId 
        ? tx.accounts_transactions_recipient_account_idToaccounts.users.email
        : tx.accounts_transactions_sender_account_idToaccounts.users.email
    }));

    return res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions: formattedTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / limitNum)
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

export default router;
