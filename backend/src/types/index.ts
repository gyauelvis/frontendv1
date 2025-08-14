// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  bvn: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  paystackCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  avatar?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  bvn: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Payment Types
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
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferRequest {
  recipientId: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
}

export interface Recipient {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  paystackRecipientId?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
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

// Fraud Detection Types
export interface FraudAlert {
  id: string;
  userId: string;
  transactionId?: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alertType: 'velocity' | 'amount' | 'geographic' | 'pattern';
  description: string;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface RiskScore {
  userId: string;
  score: number;
  factors: string[];
  lastUpdated: Date;
}

// Paystack Types
export interface PaystackCustomer {
  id: string;
  customer_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  metadata: Record<string, any>;
  risk_action: string;
  international_format_phone: string;
}

export interface PaystackTransfer {
  id: string;
  domain: string;
  amount: number;
  currency: string;
  source: string;
  reason: string;
  recipient: number;
  status: string;
  transfer_code: string;
  created_at: string;
  updated_at: string;
}

export interface PaystackWebhook {
  event: string;
  data: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Environment Configuration
export interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  rabbitmq: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  paystack: {
    secretKey: string;
    publicKey: string;
    webhookSecret: string;
  };
  security: {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}
