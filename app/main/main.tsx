import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import AIInsightCard, { AIInsight } from '@/components/evault-components/ai-insight';
import ChallengeCard, { Challenge } from '@/components/evault-components/challenge';
import BalanceCard from '@/components/evault-components/e-balance';
import ActionButtons from '@/components/evault-components/e-button';
import { Transaction } from '@/components/evault-components/e-transaction';
import SectionHeader from '@/components/evault-components/section-header';
import TransactionsList from '@/components/evault-components/transaction-list';

const MainDashboard: React.FC = () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      title: 'Morning Brew',
      category: 'Coffee Shop',
      amount: -5.75,
      icon: 'cafe-outline',
      iconBackground: '#FEF3C7',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Weekly Groceries',
      category: 'Grocery Store',
      amount: -85.20,
      icon: 'cart-outline',
      iconBackground: '#DBEAFE',
      time: '1 day ago',
    },
    {
      id: '3',
      title: 'Dinner with Alex',
      category: 'Friend Payment',
      amount: 25.00,
      icon: 'person-circle-outline',
      profileImage: 'alex-profile.jpg',
      time: '2 days ago',
    },
    {
      id: '4',
      title: 'Spotify Premium',
      category: 'Subscription',
      amount: -9.99,
      icon: 'musical-notes-outline',
      iconBackground: '#F3E8FF',
      time: '3 days ago',
    },
  ];

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

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <BalanceCard
        balance="$1,234.56"
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
        <TransactionsList transactions={transactions} />
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
  },
  scrollContent: {
    paddingBottom: 20,
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
});

export default MainDashboard;