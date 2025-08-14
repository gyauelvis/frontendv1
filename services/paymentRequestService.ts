import { apiClient } from './api';

export interface PaymentRequest {
  id: string;
  requester_id: string; // User B (wants money)
  payer_id: string;     // User A (has money to send)
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  qr_code_url: string;
  paystack_payment_url: string;
  paystack_reference?: string;
  created_at: string;
  expires_at: string;
  paid_at?: string;
}

export interface CreatePaymentRequestData {
  payerId: string;     // Who will pay (User A)
  amount: number;
  currency: string;
  description?: string;
}

export interface PaymentRequestResponse {
  success: boolean;
  data?: PaymentRequest;
  message: string;
}

class PaymentRequestService {
  // Create a new payment request
  async createPaymentRequest(data: CreatePaymentRequestData): Promise<PaymentRequestResponse> {
    try {
      const response = await apiClient.request<PaymentRequest>('/payments/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Payment request created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create payment request'
      };
    }
  }

  // Get payment requests for a user
  async getUserPaymentRequests(userId: string, status?: string): Promise<PaymentRequest[]> {
    try {
      const response = await apiClient.request<PaymentRequest[]>(`/payments/requests/${userId}?status=${status || 'all'}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      return [];
    }
  }

  // Get a specific payment request by ID
  async getPaymentRequest(requestId: string): Promise<PaymentRequest | null> {
    try {
      const response = await apiClient.request<PaymentRequest>(`/payments/requests/detail/${requestId}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching payment request:', error);
      return null;
    }
  }

  // Cancel a payment request
  async cancelPaymentRequest(requestId: string): Promise<boolean> {
    try {
      await apiClient.request(`/payments/requests/${requestId}/cancel`, {
        method: 'PUT'
      });
      return true;
    } catch (error) {
      console.error('Error cancelling payment request:', error);
      return false;
    }
  }

  // Mark payment request as paid (after Paystack payment)
  async markAsPaid(requestId: string, paystackReference: string): Promise<boolean> {
    try {
      await apiClient.request(`/payments/requests/${requestId}/paid`, {
        method: 'PUT',
        body: JSON.stringify({ paystackReference })
      });
      return true;
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      return false;
    }
  }

  // Generate QR code for payment request
  generateQRCode(paymentRequest: PaymentRequest): string {
    // This would typically call a QR code generation service
    // For now, we'll return the payment URL that can be converted to QR code
    return paymentRequest.paystack_payment_url;
  }

  // Get payment status from Paystack
  async getPaymentStatus(paystackReference: string): Promise<any> {
    try {
      const response = await apiClient.request(`/payments/status/${paystackReference}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }
}

export const paymentRequestService = new PaymentRequestService();
export default paymentRequestService;
