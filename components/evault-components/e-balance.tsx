import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface BalanceCardProps {
  balance: string;
  changePercentage?: string;
  changeType?: 'up' | 'down';
  showDecorations?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  changePercentage = "+2.5% from last month",
  changeType = "up",
  showDecorations = true
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.balanceContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#D4A574', '#B08E6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceGradient}
      >
        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{balance}</Text>
          <View style={styles.balanceChange}>
            <Ionicons 
              name={changeType === 'up' ? "trending-up" : "trending-down"} 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.changeText}>{changePercentage}</Text>
          </View>
        </View>
        {showDecorations && (
          <View style={styles.balanceDecoration}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  balanceGradient: {
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceContent: {
    zIndex: 2,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  balanceDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -20,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});

export default BalanceCard;