import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground?: string;
  profileImage?: string;
  time: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
  showAnimation?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  index = 0,
  showAnimation = true 
}) => {
  const [slideAnim] = useState(new Animated.Value(showAnimation ? 50 : 0));
  const [opacityAnim] = useState(new Animated.Value(showAnimation ? 0 : 1));

  useEffect(() => {
    if (showAnimation) {
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
    }
  }, [showAnimation, index]);

  const isPositive = transaction.amount > 0;
  const amountText = `${isPositive ? '+' : '-'}$${Math.abs(transaction.amount).toFixed(2)}`;

  return (
    <Animated.View 
      style={[
        styles.transactionItem,
        showAnimation && {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.transactionLeft}>
        {transaction.profileImage ? (
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={['#D4A574', '#B08E6B']}
              style={styles.profileImagePlaceholder}
            >
              <Text style={styles.profileInitial}>
                {transaction.title.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.transactionIconContainer}>
            <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBackground || '#F8F9FA' }]}>
              <Ionicons name={transaction.icon} size={24} color="#343A40" />
            </View>
          </View>
        )}
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionCategory}>{transaction.category}</Text>
            <Text style={styles.transactionTime}>{transaction.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, isPositive && styles.positiveAmount]}>
          {amountText}
        </Text>
        <Ionicons 
          name={isPositive ? "arrow-down" : "arrow-up"} 
          size={14} 
          color={isPositive ? "#10B981" : "#EF4444"} 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  transactionIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  transactionDetails: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  transactionTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ADB5BD',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
  },
  positiveAmount: {
    color: '#10B981',
  },
});

export default TransactionItem;
export type { Transaction };
