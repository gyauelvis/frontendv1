import prisma from '../config/database';

// Define the transaction category enum locally since Prisma client isn't generated yet
enum TransactionCategory {
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

export interface AnalyticsData {
  topRecipients: RecipientAnalytics[];
  topSenders: SenderAnalytics[];
  topCategories: CategoryAnalytics[];
  transactionTrends: TrendAnalytics[];
  summary: SummaryAnalytics;
}

export interface RecipientAnalytics {
  name: string;
  amount: number;
  count: number;
}

export interface SenderAnalytics {
  name: string;
  amount: number;
  count: number;
}

export interface CategoryAnalytics {
  category: string;
  amount: number;
  percentage: number;
}

export interface TrendAnalytics {
  date: string;
  amount: number;
  count: number;
}

export interface SummaryAnalytics {
  totalSent: number;
  totalReceived: number;
  totalTransactions: number;
  averageAmount: number;
}

export interface TransactionTrend {
  date: string;
  amount: number;
  count: number;
}

export interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
}

export class AnalyticsService {
  /**
   * Check if database is connected and accessible
   */
  async isDatabaseConnected(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.warn('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * Get comprehensive analytics data for a user
   */
  async getUserAnalytics(
    userId: string, 
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsData> {
    try {
      // First check if database is connected
      const isConnected = await this.isDatabaseConnected();
      if (!isConnected) {
        throw new Error('Database not connected');
      }

      // Calculate date range based on period
      const { start, end } = this.calculateDateRange(period, startDate, endDate);
      
      // Get user's account
      const userAccount = await prisma.accounts.findFirst({
        where: { user_id: userId }
      });

      if (!userAccount) {
        throw new Error('User account not found');
      }

      // Get basic analytics
      const availableBalance = Number(userAccount.available_balance);
      
      // Get transaction analytics
      const transactions = await prisma.transactions.findMany({
        where: {
          OR: [
            {
              accounts_transactions_sender_account_idToaccounts: {
                user_id: userId
              }
            },
            {
              accounts_transactions_recipient_account_idToaccounts: {
                user_id: userId
              }
            }
          ],
          created_at: {
            gte: start,
            lte: end
          }
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
        }
      });

      // Calculate analytics from transactions
      const sentTransactions = transactions.filter(t => t.accounts_transactions_sender_account_idToaccounts?.user_id === userId);
      const receivedTransactions = transactions.filter(t => t.accounts_transactions_recipient_account_idToaccounts?.user_id === userId);
      
      const totalSent = sentTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalReceived = receivedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Calculate spending by category
      const spendingByCategory = this.calculateSpendingByCategory(transactions, userId);
      
      // Get detailed analytics
      const topRecipients = await this.getTopRecipients(userId, start, end);
      const topSenders = await this.getTopSenders(userId, start, end);
      const topCategories = await this.getTopCategories(userId, start, end);

      // Create analytics data
      const analyticsData: AnalyticsData = {
        topRecipients,
        topSenders,
        topCategories,
        transactionTrends: this.generateTrends(transactions, period),
        summary: {
          totalSent,
          totalReceived,
          totalTransactions: transactions.length,
          averageAmount: transactions.length > 0 ? (totalSent + totalReceived) / transactions.length : 0
        }
      };

      return analyticsData;

    } catch (error) {
      console.error('Error getting user analytics:', error);
      // If database is not connected, return empty analytics
      return {
        topRecipients: [],
        topSenders: [],
        topCategories: [],
        transactionTrends: [],
        summary: {
          totalSent: 0,
          totalReceived: 0,
          totalTransactions: 0,
          averageAmount: 0
        }
      };
    }
  }

  /**
   * Get top recipients by amount sent
   */
  private async getTopRecipients(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<RecipientAnalytics[]> {
    const recipients = await prisma.transactions.groupBy({
      by: ['recipient_account_id'],
      where: {
        accounts_transactions_sender_account_idToaccounts: {
          user_id: userId
        },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get recipient user details
    const recipientDetails = await Promise.all(
      recipients.map(async (recipient: any) => {
        const account = await prisma.accounts.findUnique({
          where: { id: recipient.recipient_account_id },
          include: { users: true }
        });

        return {
          name: `${account?.users.first_name} ${account?.users.last_name}`,
          amount: Number(recipient._sum.amount),
          count: recipient._count.id
        };
      })
    );

    return recipientDetails;
  }

  /**
   * Get top senders by amount received
   */
  private async getTopSenders(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<SenderAnalytics[]> {
    const senders = await prisma.transactions.groupBy({
      by: ['sender_account_id'],
      where: {
        accounts_transactions_recipient_account_idToaccounts: {
          user_id: userId
        },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get sender user details
    const senderDetails = await Promise.all(
      senders.map(async (sender: any) => {
        const account = await prisma.accounts.findUnique({
          where: { id: sender.sender_account_id },
          include: { users: true }
        });

        return {
          name: `${account?.users.first_name} ${account?.users.last_name}`,
          amount: Number(sender._sum.amount),
          count: sender._count.id
        };
      })
    );

    return senderDetails;
  }

  /**
   * Get top spending categories
   */
  private async getTopCategories(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CategoryAnalytics[]> {
    const categories = await prisma.transactions.groupBy({
      by: ['category'],
      where: {
        accounts_transactions_sender_account_idToaccounts: {
          user_id: userId
        },
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const totalAmount = categories.reduce(
      (sum: number, cat: any) => sum + Number(cat._sum.amount), 
      0
    );

    return categories.map((category: any) => ({
      category: this.formatCategoryName(category.category),
      amount: Number(category._sum.amount),
      percentage: Math.round((Number(category._sum.amount) / totalAmount) * 100)
    }));
  }

  /**
   * Get transaction trends over time
   */
  private async getTransactionTrends(
    userId: string, 
    startDate: Date, 
    endDate: Date,
    period: string
  ): Promise<TrendAnalytics[]> {
    if (period === 'weekly') {
      return this.getWeeklyTrends(userId, startDate, endDate);
    } else if (period === 'monthly') {
      return this.getMonthlyTrends(userId, startDate, endDate);
    } else {
      return this.getDailyTrends(userId, startDate, endDate);
    }
  }

  /**
   * Get weekly transaction trends
   */
  private async getWeeklyTrends(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<TrendAnalytics[]> {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trends: TrendAnalytics[] = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransactions = await prisma.transactions.aggregate({
        where: {
          OR: [
            {
              accounts_transactions_sender_account_idToaccounts: {
                user_id: userId
              }
            },
            {
              accounts_transactions_recipient_account_idToaccounts: {
                user_id: userId
              }
            }
          ],
          created_at: {
            gte: dayStart,
            lte: dayEnd
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      });

      trends.push({
        date: weekDays[dayStart.getDay()],
        amount: Number(dayTransactions._sum.amount) || 0,
        count: dayTransactions._count.id || 0
      });
    }

    return trends;
  }

  /**
   * Get monthly transaction trends
   */
  private async getMonthlyTrends(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<TrendAnalytics[]> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: TrendAnalytics[] = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(startDate.getFullYear(), i, 1);
      const monthEnd = new Date(startDate.getFullYear(), i + 1, 0, 23, 59, 59, 999);

      const monthTransactions = await prisma.transactions.aggregate({
        where: {
          OR: [
            {
              accounts_transactions_sender_account_idToaccounts: {
                user_id: userId
              }
            },
            {
              accounts_transactions_recipient_account_idToaccounts: {
                user_id: userId
              }
            }
          ],
          created_at: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      });

      trends.push({
        date: months[i],
        amount: Number(monthTransactions._sum.amount) || 0,
        count: monthTransactions._count.id || 0
      });
    }

    return trends;
  }

  /**
   * Get daily transaction trends
   */
  private async getDailyTrends(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<TrendAnalytics[]> {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trends: TrendAnalytics[] = [];

    for (let i = 0; i < Math.min(days, 7); i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransactions = await prisma.transactions.aggregate({
        where: {
          OR: [
            {
              accounts_transactions_sender_account_idToaccounts: {
                user_id: userId
              }
            },
            {
              accounts_transactions_recipient_account_idToaccounts: {
                user_id: userId
              }
            }
          ],
          status: 'COMPLETED',
          created_at: {
            gte: dayStart,
            lte: dayEnd
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      });

      trends.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: Number(dayTransactions._sum.amount) || 0,
        count: dayTransactions._count.id || 0
      });
    }

    return trends;
  }

  /**
   * Get summary statistics
   */
  private async getSummary(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<SummaryAnalytics> {
    const [sentStats, receivedStats, totalStats] = await Promise.all([
      // Total sent
      prisma.transactions.aggregate({
        where: {
          accounts_transactions_sender_account_idToaccounts: { user_id: userId },
          created_at: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),

      // Total received
      prisma.transactions.aggregate({
        where: {
          accounts_transactions_recipient_account_idToaccounts: { user_id: userId },
          created_at: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),

      // Total transactions
      prisma.transactions.aggregate({
        where: {
          OR: [
            { accounts_transactions_sender_account_idToaccounts: { user_id: userId } },
            { accounts_transactions_recipient_account_idToaccounts: { user_id: userId } }
          ],
          created_at: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    const totalSent = Number(sentStats._sum.amount) || 0;
    const totalReceived = Number(receivedStats._sum.amount) || 0;
    const totalTransactions = totalStats._count.id || 0;
    const averageAmount = totalTransactions > 0 ? (totalSent + totalReceived) / totalTransactions : 0;

    return {
      totalSent,
      totalReceived,
      totalTransactions,
      averageAmount: Math.round(averageAmount * 100) / 100
    };
  }

  /**
   * Calculate date range based on period
   */
  private calculateDateRange(
    period: string, 
    startDate?: Date, 
    endDate?: Date
  ): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = endDate || now;

    if (startDate) {
      start = startDate;
    } else {
      switch (period) {
        case 'daily':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
          break;
        case 'weekly':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1); // Current month
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1); // Current quarter
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      }
    }

    return { start, end };
  }

  /**
   * Format category names for display
   */
  private formatCategoryName(category: TransactionCategory): string {
    switch (category) {
      case 'FOOD': return 'Food & Dining';
      case 'SHOPPING': return 'Shopping & Retail';
      case 'TRANSPORT': return 'Transport & Fuel';
      case 'ENTERTAINMENT': return 'Entertainment';
      case 'UTILITIES': return 'Utilities & Bills';
      case 'HEALTHCARE': return 'Healthcare';
      case 'EDUCATION': return 'Education';
      case 'SAVINGS': return 'Savings';
      case 'OTHER': return 'Other';
      default: return category;
    }
  }

  /**
   * Calculate spending by category
   */
  private calculateSpendingByCategory(transactions: any[], userId: string): Record<string, number> {
    const spendingByCategory: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      if (transaction.accounts_transactions_sender_account_idToaccounts?.user_id === userId) {
        const category = transaction.description || 'General';
        spendingByCategory[category] = (spendingByCategory[category] || 0) + Number(transaction.amount);
      }
    });
    
    return spendingByCategory;
  }

  /**
   * Generate insights based on analytics data
   */
  private generateInsights(totalSent: number, totalReceived: number, transactionCount: number, period: string): string[] {
    const insights: string[] = [];
    
    if (totalReceived > totalSent) {
      insights.push(`You received $${totalReceived.toFixed(2)} more than you sent this ${period}`);
    } else if (totalSent > totalReceived) {
      insights.push(`You sent $${totalSent.toFixed(2)} more than you received this ${period}`);
    }
    
    if (transactionCount > 10) {
      insights.push(`High transaction volume this ${period} - ${transactionCount} transactions`);
    }
    
    if (totalSent > 1000) {
      insights.push(`Significant spending this ${period} - consider reviewing your expenses`);
    }
    
    return insights.length > 0 ? insights : [`No significant patterns this ${period}`];
  }

  /**
   * Generate trends from transactions
   */
  private generateTrends(transactions: any[], period: string): TransactionTrend[] {
    // Group transactions by day/week/month
    const groupedTransactions = this.groupTransactionsByPeriod(transactions, period);
    
    return Object.entries(groupedTransactions).map(([period, amount]) => ({
      date: period,
      amount: Number(amount),
      count: 1 // Simplified for now
    }));
  }

  /**
   * Group transactions by period
   */
  private groupTransactionsByPeriod(transactions: any[], period: string): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      let key: string;
      
      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      grouped[key] = (grouped[key] || 0) + Number(transaction.amount);
    });
    
    return grouped;
  }
}

export default new AnalyticsService();
