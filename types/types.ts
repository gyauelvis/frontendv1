// Enums
export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum AccountType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum TransactionCategory {
  FOOD = 'FOOD',
  SHOPPING = 'SHOPPING',
  TRANSPORT = 'TRANSPORT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  UTILITIES = 'UTILITIES',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  SAVINGS = 'SAVINGS',
  OTHER = 'OTHER'
}

export enum MfaMethod {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL'
}

export enum NotificationType {
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BALANCE_LOW = 'BALANCE_LOW',
  SECURITY_ALERT = 'SECURITY_ALERT',
  MFA_CODE = 'MFA_CODE',
  ANALYTICS_READY = 'ANALYTICS_READY'
}

// Base Types (without relations)
export interface UserBase {
  id?: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  kyc_status: KycStatus;
  kyc_verified_at: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AccountBase {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  accountType: AccountType;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionBase {
  id: string;
  idempotencyKey: string;
  senderAccountId: string;
  recipientAccountId: string;
  amount: number;
  currency: string;
  category: TransactionCategory;
  description: string | null;
  status: TransactionStatus;
  reference: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface UserMfaBase {
  id: string;
  userId: string;
  method: MfaMethod;
  secret: string | null;
  isEnabled: boolean;
  backupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBiometricBase {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: bigint;
  deviceName: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export interface UserSessionBase {
  id: string;
  userId: string;
  deviceFingerprint: string | null;
  refreshTokenHash: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isTrusted: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}

export interface ContactBase {
  id: string;
  userId: string;
  contactUserId: string;
  nickname: string | null;
  isFavorite: boolean;
  transactionCount: number;
  totalSent: number;
  lastTransactionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyAnalyticsBase {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalSpent: number;
  totalReceived: number;
  transactionCount: number;
  topRecipients: Record<string, any> | null;
  topCategories: Record<string, any> | null;
  generatedAt: Date;
}

export interface NotificationBase {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any> | null;
  isRead: boolean;
  isSent: boolean;
  sentAt: Date | null;
  createdAt: Date;
  readAt: Date | null;
}

export interface BalanceHistoryBase {
  id: string;
  accountId: string;
  previousBalance: number;
  newBalance: number;
  changeAmount: number;
  reason: string;
  referenceId: string | null;
  createdAt: Date;
}

export interface FundReservationBase {
  id: string;
  accountId: string;
  transactionId: string;
  amount: number;
  reservedAt: Date;
  expiresAt: Date;
  isReleased: boolean;
  releasedAt: Date | null;
}

export interface TransactionStatusHistoryBase {
  id: string;
  transactionId: string;
  previousStatus: TransactionStatus | null;
  newStatus: TransactionStatus;
  reason: string | null;
  createdAt: Date;
}

export interface UserRiskScoreBase {
  id: string;
  userId: string;
  currentScore: number;
  lastUpdated: Date;
  flags: Record<string, any> | null;
  createdAt: Date;
}

export interface FraudEventBase {
  id: string;
  userId: string;
  transactionId: string | null;
  eventType: string;
  riskScore: number;
  details: Record<string, any> | null;
  actionTaken: string | null;
  createdAt: Date;
}

export interface AuditLogBase {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// Types with Relations
export interface User extends UserBase {
  accounts: Account[];
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
  contacts: Contact[];
  contactOf: Contact[];
  mfaSettings: UserMfa[];
  biometricAuth: UserBiometric[];
  sessions: UserSession[];
  notifications: Notification[];
  riskScore: UserRiskScore | null;
  fraudEvents: FraudEvent[];
  monthlyAnalytics: MonthlyAnalytics[];
  auditLogs: AuditLog[];
}

export interface Account extends AccountBase {
  user: User;
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
  balanceHistory: BalanceHistory[];
  fundReservations: FundReservation[];
}

export interface Transaction extends TransactionBase {
  senderAccount: Account;
  recipientAccount: Account;
  sender: User;
  recipient: User;
  statusHistory: TransactionStatusHistory[];
  fundReservations: FundReservation[];
  fraudEvents: FraudEvent[];
}

export interface UserMfa extends UserMfaBase {
  user: User;
}

export interface UserBiometric extends UserBiometricBase {
  user: User;
}

export interface UserSession extends UserSessionBase {
  user: User;
}

export interface Contact extends ContactBase {
  user: User;
  contactUser: User;
}

export interface MonthlyAnalytics extends MonthlyAnalyticsBase {
  user: User;
}

export interface Notification extends NotificationBase {
  user: User;
}

export interface BalanceHistory extends BalanceHistoryBase {
  account: Account;
}

export interface FundReservation extends FundReservationBase {
  account: Account;
  transaction: Transaction;
}

export interface TransactionStatusHistory extends TransactionStatusHistoryBase {
  transaction: Transaction;
}

export interface UserRiskScore extends UserRiskScoreBase {
  user: User;
}

export interface FraudEvent extends FraudEventBase {
  user: User;
  transaction: Transaction | null;
}

export interface AuditLog extends AuditLogBase {
  user: User | null;
}

// Utility Types for Create/Update Operations
export type UserCreate = Omit<UserBase, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdate = Partial<Omit<UserBase, 'id' | 'createdAt' | 'updatedAt'>>;

export type AccountCreate = Omit<AccountBase, 'id' | 'createdAt' | 'updatedAt'>;
export type AccountUpdate = Partial<Omit<AccountBase, 'id' | 'createdAt' | 'updatedAt'>>;

export type TransactionCreate = Omit<TransactionBase, 'id' | 'createdAt' | 'updatedAt'>;
export type TransactionUpdate = Partial<Omit<TransactionBase, 'id' | 'createdAt' | 'updatedAt'>>;

export type NotificationCreate = Omit<NotificationBase, 'id' | 'createdAt'>;
export type NotificationUpdate = Partial<Omit<NotificationBase, 'id' | 'createdAt'>>;

// Query Helper Types
export type UserWithAccounts = User & { accounts: Account[] };
export type UserWithTransactions = User & { 
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
};

export type AccountWithTransactions = Account & {
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
};

export type TransactionWithUsers = Transaction & {
  sender: User;
  recipient: User;
};

// Database Query Result Types
export type DatabaseUser = UserBase;
export type DatabaseAccount = AccountBase;
export type DatabaseTransaction = TransactionBase;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type UserResponse = ApiResponse<User>;
export type UsersResponse = ApiResponse<PaginatedResponse<User>>;
export type AccountResponse = ApiResponse<Account>;
export type TransactionResponse = ApiResponse<Transaction>;
export type TransactionsResponse = ApiResponse<PaginatedResponse<Transaction>>;

// Filter and Sort Types
export interface UserFilters {
  kycStatus?: KycStatus;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  email?: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  category?: TransactionCategory;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
}

export interface AccountFilters {
  accountType?: AccountType;
  status?: AccountStatus;
  userId?: string;
  minBalance?: number;
  maxBalance?: number;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}