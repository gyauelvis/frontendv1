import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import SectionHeader from '@/components/evault-components/section-header';

const { width } = Dimensions.get('window');

interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  transactions: number;
}

interface PersonPayment {
  id: string;
  name: string;
  amount: number;
  avatar: string;
  transactions: number;
  lastPayment: string;
}

interface StatsCard {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

// Enhanced Stats Card Component
const StatsCard: React.FC<{ stat: StatsCard; index: number }> = ({ stat, index }) => {
  const [slideAnim] = useState(new Animated.Value(50));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.statsCard,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <LinearGradient
        colors={[stat.color, stat.color + '80']}
        style={styles.statsGradient}
      >
        <View style={styles.statsIcon}>
          <Ionicons name={stat.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.statsValue}>{stat.value}</Text>
        <Text style={styles.statsTitle}>{stat.title}</Text>
        <View style={styles.statsChange}>
          <Ionicons 
            name={stat.changeType === 'up' ? "trending-up" : "trending-down"} 
            size={14} 
            color="rgba(255,255,255,0.8)" 
          />
          <Text style={styles.statsChangeText}>{stat.change}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Spending Category Item Component
const SpendingCategoryItem: React.FC<{ category: SpendingCategory; index: number }> = ({ category, index }) => {
  const [slideAnim] = useState(new Animated.Value(50));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: category.percentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, index * 100 + 300);
  }, []);

  return (
    <Animated.View 
      style={[
        styles.categoryItem,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon} size={20} color={category.color} />
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryTransactions}>{category.transactions} transactions</Text>
        </View>
      </View>
      
      <View style={styles.categoryRight}>
        <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: category.color,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{category.percentage}%</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Person Payment Item Component
const PersonPaymentItem: React.FC<{ person: PersonPayment; index: number }> = ({ person, index }) => {
  const [slideAnim] = useState(new Animated.Value(50));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.personItem,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.personLeft}>
        <LinearGradient
          colors={['#D4A574', '#B08E6B']}
          style={styles.personAvatar}
        >
          <Text style={styles.personInitial}>{person.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={styles.personDetails}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personLastPayment}>Last payment: {person.lastPayment}</Text>
        </View>
      </View>
      
      <View style={styles.personRight}>
        <Text style={styles.personAmount}>${person.amount.toFixed(2)}</Text>
        <Text style={styles.personTransactions}>{person.transactions} payments</Text>
      </View>
    </Animated.View>
  );
};

// Main Analytics Page Component
const AnalyticsPage: React.FC = () => {
  // Sample analytics data
  const statsData: StatsCard[] = [
    {
      title: 'Total Spent',
      value: '$2,847.30',
      change: '+12.5%',
      changeType: 'up',
      icon: 'trending-up',
      color: '#EF4444',
    },
    {
      title: 'Total Received',
      value: '$1,456.80',
      change: '+8.3%',
      changeType: 'up',
      icon: 'arrow-down',
      color: '#10B981',
    },
    {
      title: 'Net Flow',
      value: '-$1,390.50',
      change: '-4.2%',
      changeType: 'down',
      icon: 'swap-horizontal',
      color: '#F59E0B',
    },
  ];

  const topSpendingCategories: SpendingCategory[] = [
    {
      id: '1',
      name: 'Food & Dining',
      amount: 847.50,
      percentage: 30,
      icon: 'restaurant',
      color: '#EF4444',
      transactions: 24,
    },
    {
      id: '2',
      name: 'Transportation',
      amount: 567.20,
      percentage: 20,
      icon: 'car',
      color: '#3B82F6',
      transactions: 18,
    },
    {
      id: '3',
      name: 'Shopping',
      amount: 445.80,
      percentage: 16,
      icon: 'bag',
      color: '#8B5CF6',
      transactions: 12,
    },
    {
      id: '4',
      name: 'Entertainment',
      amount: 324.60,
      percentage: 11,
      icon: 'game-controller',
      color: '#F59E0B',
      transactions: 15,
    },
    {
      id: '5',
      name: 'Subscriptions',
      amount: 289.40,
      percentage: 10,
      icon: 'refresh',
      color: '#06B6D4',
      transactions: 8,
    },
  ];

  const topPeople: PersonPayment[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      amount: 425.00,
      avatar: 'SJ',
      transactions: 8,
      lastPayment: '2 days ago',
    },
    {
      id: '2',
      name: 'Mike Chen',
      amount: 320.50,
      avatar: 'MC',
      transactions: 5,
      lastPayment: '1 week ago',
    },
    {
      id: '3',
      name: 'Emma Davis',
      amount: 285.75,
      avatar: 'ED',
      transactions: 6,
      lastPayment: '3 days ago',
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      amount: 210.00,
      avatar: 'AR',
      transactions: 4,
      lastPayment: '5 days ago',
    },
    {
      id: '5',
      name: 'Lisa Wilson',
      amount: 195.30,
      avatar: 'LW',
      transactions: 3,
      lastPayment: '1 week ago',
    },
  ];

  const handleSeeAllPress = (section: string) => (): void => {
    console.log(`See all pressed for: ${section}`);
  };

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Overview Stats */}
      <View style={styles.section}>
        <SectionHeader 
          title="Overview"
          showSeeAll={false}
        />
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <StatsCard key={stat.title} stat={stat} index={index} />
          ))}
        </View>
      </View>

      {/* Top Spending Categories */}
      <View style={styles.section}>
        <SectionHeader 
          title="Top Spending Categories"
          onSeeAllPress={handleSeeAllPress('Top Spending Categories')}
        />
        <View style={styles.categoriesContainer}>
          {topSpendingCategories.map((category, index) => (
            <SpendingCategoryItem key={category.id} category={category} index={index} />
          ))}
        </View>
      </View>

      {/* Top People Sent Money To */}
      <View style={styles.section}>
        <SectionHeader 
          title="Most Sent To"
          onSeeAllPress={handleSeeAllPress('Most Sent To')}
        />
        <View style={styles.peopleContainer}>
          {topPeople.map((person, index) => (
            <PersonPaymentItem key={person.id} person={person} index={index} />
          ))}
        </View>
      </View>

      {/* Monthly Summary Card */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#D4A574', '#B08E6B']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>This Month Summary</Text>
              <Ionicons name="calendar" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>47</Text>
                <Text style={styles.summaryStatLabel}>Transactions</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>$2,847</Text>
                <Text style={styles.summaryStatLabel}>Total Spent</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>$1,457</Text>
                <Text style={styles.summaryStatLabel}>Received</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.summaryAction}>
              <Text style={styles.summaryActionText}>View Detailed Report</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
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
  
  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statsGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsChangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  // Category Styles
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
  categoryTransactions: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6C757D',
    marginTop: 2,
  },
  categoryRight: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 100,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F3F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
    minWidth: 32,
  },

  // People Styles
  peopleContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  personItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  personLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
  personLastPayment: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6C757D',
    marginTop: 2,
  },
  personRight: {
    alignItems: 'flex-end',
  },
  personAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
  },
  personTransactions: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6C757D',
    marginTop: 2,
  },

  // Summary Card Styles
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  summaryGradient: {
    padding: 24,
    borderRadius: 20,
    gap: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  summaryAction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  summaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  bottomSpacing: {
    height: 20,
  },
});

export default AnalyticsPage;