import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_KEY || '';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  accounts?: Array<{
    id: string;
    account_number: string;
    available_balance: string;
    currency: string;
    account_type: string;
  }>;
  bvn?: string;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  paystackCustomerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Transaction {
  id: string;
  userId: string;
  recipientId: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paystackTransferId?: string;
  paystackReference?: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  topRecipients: TopRecipient[];
  topSenders: TopSender[];
  topCategories: TopCategory[];
  transactionTrends: TransactionTrend[];
  totalSent: number;
  totalReceived: number;
  totalTransactions: number;
}

export interface TopRecipient {
  recipientId: string;
  recipientName: string;
  totalAmount: number;
  transactionCount: number;
  period: 'weekly' | 'monthly';
}

export interface TopSender {
  senderId: string;
  senderName: string;
  totalAmount: number;
  transactionCount: number;
  period: 'weekly' | 'monthly';
}

export interface TopCategory {
  category: string;
  totalAmount: number;
  transactionCount: number;
  period: 'weekly' | 'monthly';
}

export interface TransactionTrend {
  date: string;
  totalAmount: number;
  transactionCount: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface FraudAlert {
  id: string;
  userId: string;
  transactionId?: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alertType: 'velocity' | 'amount' | 'geographic' | 'pattern';
  description: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
  }

  // Get headers for requests
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    bvn: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // User Methods
  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  async updateUserProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Payment Methods
  async initiateTransfer(transferData: {
    recipientId: string;
    amount: number;
    currency: string;
    category: string;
    description?: string;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async lookupAccount(identifier: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/payments/lookup/${identifier}`);
  }

  async getUserAccounts(userId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/payments/accounts/${userId}`);
  }

  async transferMoney(
    senderAccountId: string,
    recipientAccountId: string,
    amount: number,
    currency: string = 'USD',
    description?: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({
        senderAccountId,
        recipientAccountId,
        amount,
        currency,
        description
      }),
    });
  }

  async getTransactionHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> {
    return this.request<{ transactions: Transaction[]; total: number }>(
      `/payments/transactions?page=${page}&limit=${limit}`
    );
  }

  async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/payments/transactions/${id}`);
  }

  // Analytics Methods
  async getAnalytics(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'weekly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AnalyticsData>> {
    let url = `/analytics?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return this.request<AnalyticsData>(url);
  }

  async getInsights(): Promise<ApiResponse<{
    spendingPatterns: string[];
    recommendations: string[];
    anomalies: string[];
  }>> {
    return this.request('/analytics/insights');
  }

  // Fraud Detection Methods
  async getFraudAlerts(): Promise<ApiResponse<FraudAlert[]>> {
    return this.request<FraudAlert[]>('/fraud/alerts');
  }

  async getRiskScore(): Promise<ApiResponse<{ score: number; factors: string[] }>> {
    return this.request<{ score: number; factors: string[] }>('/fraud/risk-score');
  }

  // Paystack Integration
  async createPaystackCustomer(userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<any> {
    // This would typically be handled by the backend
    // For now, we'll return a mock response
    return Promise.resolve({
      success: true,
      data: {
        customer_code: 'CUS_' + Math.random().toString(36).substr(2, 9),
        id: Math.random().toString(36).substr(2, 9),
      },
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Token management utilities
export const tokenManager = {
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
      apiClient.setToken(token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        apiClient.setToken(token);
      }
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      apiClient.clearToken();
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};

export default apiClient;
