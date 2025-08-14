import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import AIInsightCard, { AIInsight } from '@/components/evault-components/ai-insight';
import ChallengeCard, { Challenge } from '@/components/evault-components/challenge';
import BalanceCard from '@/components/evault-components/e-balance';
import ActionButtons from '@/components/evault-components/e-button';
import { Transaction } from '@/components/evault-components/e-transaction';
import SectionHeader from '@/components/evault-components/section-header';
import TransactionsList from '@/components/evault-components/transaction-list';
import { authService } from '@/lib/auth';

// Import proper types
import {
  Account,
  Transaction as DBTransaction,
  KycStatus,
  TransactionCategory,
  TransactionStatus,
  User
} from '@/types/types';

const MainDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [primaryAccount, setPrimaryAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { user } = await authService.getCurrentUser();
        
        if (user) {
          const profileResult = await authService.getUserProfile(user.id);
          
          if (profileResult.success && profileResult.data) {
            const userData: User = profileResult.data;
            setUserProfile(userData);
            
            // Set primary account (first active account)
            const activeAccount = userData.accounts?.find(acc => acc.status === 'ACTIVE');
            if (activeAccount) {
              setPrimaryAccount(activeAccount);
            }
          } else {
            // Fallback to basic user info if profile fetch fails
            const fallbackUser: Partial<User> = {
              id: user.id,
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              kyc_status: KycStatus.PENDING,
              is_active: true,
              created_at: new Date(user.created_at || Date.now()),
              updated_at: new Date(),
              accounts: [],
              sentTransactions: [],
              receivedTransactions: [],
            };
            setUserProfile(fallbackUser as User);
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        Alert.alert('Error', 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Get display name from user profile
  const getDisplayName = (): string => {
    if (!userProfile) return 'User';
    
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    
    if (userProfile.first_name) {
      return userProfile.first_name;
    }
    
    // Fallback to email prefix
    if (userProfile.email) {
      return userProfile.email.split('@')[0];
    }
    
    return 'User';
  };

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  // Format currency based on account currency or default to GHS
  const formatCurrency = (amount: number): string => {
    const currency = primaryAccount?.currency || 'GHS';
    
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Convert database transactions to component format
  const getRecentTransactions = (): Transaction[] => {
    if (!userProfile) return [];

    const allTransactions: DBTransaction[] = [
      ...(userProfile.sentTransactions || []),
      ...(userProfile.receivedTransactions || [])
    ];

    // Sort by date (most recent first) and take first 4
    const recentTransactions = allTransactions
      .filter(tx => tx.status === TransactionStatus.COMPLETED)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    // Convert to component format
    return recentTransactions.map((tx): Transaction => {
      const isSent = tx.senderAccountId === primaryAccount?.id;
      const amount = isSent ? -tx.amount : tx.amount;
      
      return {
        id: tx.id,
        title: getTransactionTitle(tx, isSent),
        category: getCategoryDisplay(tx.category),
        amount: amount,
        icon: getCategoryIcon(tx.category),
        iconBackground: getCategoryIconBackground(tx.category),
        time: getTimeAgo(tx.createdAt),
      };
    });
  };

  const getTransactionTitle = (tx: DBTransaction, isSent: boolean): string => {
    if (tx.description) return tx.description;
    
    if (isSent) {
      return 'Payment Sent';
    } else {
      return 'Payment Received';
    }
  };

  const getCategoryDisplay = (category: TransactionCategory): string => {
    const categoryMap: Record<TransactionCategory, string> = {
      [TransactionCategory.FOOD]: 'Food & Dining',
      [TransactionCategory.SHOPPING]: 'Shopping',
      [TransactionCategory.TRANSPORT]: 'Transportation',
      [TransactionCategory.ENTERTAINMENT]: 'Entertainment',
      [TransactionCategory.UTILITIES]: 'Utilities',
      [TransactionCategory.HEALTHCARE]: 'Healthcare',
      [TransactionCategory.EDUCATION]: 'Education',
      [TransactionCategory.SAVINGS]: 'Savings',
      [TransactionCategory.OTHER]: 'Other',
    };
    
    return categoryMap[category] || 'Other';
  };

  const getCategoryIcon = (category: TransactionCategory): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap => {
    const iconMap: Record<TransactionCategory, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
      [TransactionCategory.FOOD]: 'restaurant-outline',
      [TransactionCategory.SHOPPING]: 'bag-outline',
      [TransactionCategory.TRANSPORT]: 'car-outline',
      [TransactionCategory.ENTERTAINMENT]: 'game-controller-outline',
      [TransactionCategory.UTILITIES]: 'flash-outline',
      [TransactionCategory.HEALTHCARE]: 'medical-outline',
      [TransactionCategory.EDUCATION]: 'school-outline',
      [TransactionCategory.SAVINGS]: 'wallet-outline',
      [TransactionCategory.OTHER]: 'ellipsis-horizontal-outline',
    };
    
    return iconMap[category] || 'ellipsis-horizontal-outline';
  };

  const getCategoryIconBackground = (category: TransactionCategory): string => {
    const backgroundMap: Record<TransactionCategory, string> = {
      [TransactionCategory.FOOD]: '#FEF3C7',
      [TransactionCategory.SHOPPING]: '#DBEAFE',
      [TransactionCategory.TRANSPORT]: '#D1FAE5',
      [TransactionCategory.ENTERTAINMENT]: '#F3E8FF',
      [TransactionCategory.UTILITIES]: '#FEE2E2',
      [TransactionCategory.HEALTHCARE]: '#ECFDF5',
      [TransactionCategory.EDUCATION]: '#FEF3C7',
      [TransactionCategory.SAVINGS]: '#E0F2FE',
      [TransactionCategory.OTHER]: '#F3F4F6',
    };
    
    return backgroundMap[category] || '#F3F4F6';
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const challenge: Challenge = {
    id: '1',
    title: 'Save $500 this month',
    description: 'Progress: 40%',
    progress: 40,
    targetAmount: 500,
    currentAmount: 200,
    icon: 'trophy',
  };

  const aiInsight: AIInsight = {
    id: '1',
    title: "You've spent 15% more on dining out this month.",
    description: 'Consider setting a budget to manage your expenses better and reach your savings goals.',
    type: 'warning',
    actionText: 'Set Budget',
  };

  const handleActionButtonPress = (title: string): void => {
    console.log(`Action button pressed: ${title}`);
  };

  const handleSeeAllPress = (section: string) => (): void => {
    console.log(`See all pressed for: ${section}`);
  };

  const handleInsightAction = (): void => {
    console.log('AI Insight action pressed');
  };

  const handleChallengeDetails = (): void => {
    console.log('Challenge details pressed');
  };

  const handleProfilePress = (): void => {
    // Navigate to profile screen or show profile menu
    console.log('Profile pressed');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A574" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const transactions = getRecentTransactions();
  const displayBalance = primaryAccount ? formatCurrency(primaryAccount.availableBalance) : '$0.00';

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <BalanceCard
        balance={displayBalance}
        changePercentage="+2.5% from last month"
        changeType="up"
      />

      <View style={styles.actionButtonsContainer}>
        <ActionButtons
          title="Send Money"
          variant="primary"
          onPress={handleActionButtonPress}
          style={styles.actionButton}
        />
        <ActionButtons
          title="Request Money"
          variant="secondary"
          onPress={handleActionButtonPress}
          style={styles.actionButton}
        />
        <ActionButtons
          title="View Transactions"
          variant="secondary"
          onPress={handleActionButtonPress}
          style={styles.actionButton}
        />
        <ActionButtons
          title="Insights"
          variant="secondary"
          onPress={handleActionButtonPress}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Insights"
          onSeeAllPress={handleSeeAllPress('AI Insights')}
        />
        <AIInsightCard
          insight={{
            ...aiInsight,
            onActionPress: handleInsightAction
          }}
        />
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Recent Transactions"
          onSeeAllPress={handleSeeAllPress('Recent Transactions')}
        />
        {transactions.length > 0 ? (
          <TransactionsList transactions={transactions} />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recent transactions</Text>
            <Text style={styles.emptyStateSubtext}>Your transactions will appear here</Text>
          </View>
        )}
      </View>

      {/* Challenges Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Challenges"
          onSeeAllPress={handleSeeAllPress('Challenges')}
        />
        <ChallengeCard
          challenge={{
            ...challenge,
            onDetailsPress: handleChallengeDetails
          }}
        />
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343A40',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  bottomSpacing: {
    height: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
    minWidth: '49%',
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default MainDashboard;