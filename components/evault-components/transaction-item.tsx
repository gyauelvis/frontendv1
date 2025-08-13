import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Transaction interface
export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground?: string;
  profileImage?: string;
  time: string;
  description?: string;
  type?: 'income' | 'expense' | 'transfer';
  status?: 'completed' | 'pending' | 'failed';
}

// Component props interface
interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
  showAnimation?: boolean;
  onPress?: (transaction: Transaction) => void;
  compact?: boolean;
  showStatus?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  index = 0,
  showAnimation = true,
  onPress,
  compact = false,
  showStatus = false
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

  const handlePress = () => {
    if (onPress) {
      onPress(transaction);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6C757D';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      default: return 'checkmark-circle';
    }
  };

  const ProfileImage = () => (
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
  );

  const TransactionIcon = () => (
    <View style={styles.transactionIconContainer}>
      <View style={[
        styles.transactionIcon, 
        { backgroundColor: transaction.iconBackground || '#F8F9FA' }
      ]}>
        <Ionicons name={transaction.icon} size={24} color="#343A40" />
      </View>
    </View>
  );

  const TransactionContent = () => (
    <>
      <View style={styles.transactionLeft}>
        {transaction.profileImage ? <ProfileImage /> : <TransactionIcon />}
        
        <View style={styles.transactionDetails}>
          <Text style={[
            styles.transactionTitle,
            compact && styles.compactTitle
          ]}>
            {transaction.title}
          </Text>
          
          <View style={styles.transactionMeta}>
            <Text style={[
              styles.transactionCategory,
              compact && styles.compactCategory
            ]}>
              {transaction.category}
            </Text>
            {!compact && (
              <>
                <View style={styles.metaDivider} />
                <Text style={styles.transactionTime}>{transaction.time}</Text>
              </>
            )}
          </View>
          
          {transaction.description && !compact && (
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount, 
          isPositive && styles.positiveAmount,
          compact && styles.compactAmount
        ]}>
          {amountText}
        </Text>
        
        <View style={styles.transactionMeta}>
          {showStatus && transaction.status && (
            <View style={styles.statusContainer}>
              <Ionicons 
                name={getStatusIcon(transaction.status)} 
                size={12} 
                color={getStatusColor(transaction.status)} 
              />
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(transaction.status) }
              ]}>
                {transaction.status}
              </Text>
            </View>
          )}
          
          {!showStatus && (
            <Ionicons 
              name={isPositive ? "arrow-down" : "arrow-up"} 
              size={14} 
              color={isPositive ? "#10B981" : "#EF4444"} 
            />
          )}
        </View>
        
        {compact && (
          <Text style={styles.compactTime}>{transaction.time}</Text>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Animated.View 
        style={[
          styles.transactionItem,
          compact && styles.compactItem,
          showAnimation && {
            transform: [{ translateX: slideAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.touchableContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <TransactionContent />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.transactionItem,
        compact && styles.compactItem,
        showAnimation && {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TransactionContent />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  compactItem: {
    backgroundColor: 'transparent',
  },
  touchableContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  compactTitle: {
    fontSize: 15,
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
  compactCategory: {
    fontSize: 13,
  },
  metaDivider: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ADB5BD',
  },
  transactionTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ADB5BD',
  },
  transactionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6C757D',
    marginTop: 2,
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
  compactAmount: {
    fontSize: 15,
  },
  positiveAmount: {
    color: '#10B981',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  compactTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ADB5BD',
    marginTop: 2,
  },
});

export default TransactionItem;