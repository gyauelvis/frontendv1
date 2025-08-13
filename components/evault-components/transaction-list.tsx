import TransactionItem, { Transaction } from '@/components/evault-components/transaction-item';
import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';

interface TransactionsListProps {
  transactions: Transaction[];
  showAnimation?: boolean;
  containerStyle?: any;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ 
  transactions,
  showAnimation = true,
  containerStyle
}) => {
  return (
    <View style={[styles.transactionsContainer, containerStyle]}>
      {transactions.map((transaction, index) => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction} 
          index={index}
          showAnimation={showAnimation}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionsContainer: {
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
});

export default TransactionsList;