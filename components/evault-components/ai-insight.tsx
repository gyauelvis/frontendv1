import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info';
  actionText?: string;
  onActionPress?: () => void;
}

interface AIInsightCardProps {
  insight: AIInsight;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return '#F59E0B';
      case 'success': return '#10B981';
      default: return '#D4A574';
    }
  };

  const handleActionPress = () => {
    if (insight.onActionPress) {
      insight.onActionPress();
    } else {
      console.log('Default action pressed');
    }
  };

  return (
    <View style={styles.aiInsightCard}>
      <View style={styles.aiInsightHeader}>
        <View style={[styles.insightTypeIndicator, { backgroundColor: getInsightColor(insight.type) }]} />
        <Text style={styles.aiInsightBadge}>Insight</Text>
      </View>
      <Text style={styles.aiInsightTitle}>{insight.title}</Text>
      <Text style={styles.aiInsightDescription}>{insight.description}</Text>
      <View style={styles.aiInsightFooter}>
        <TouchableOpacity style={styles.insightAction} onPress={handleActionPress}>
          <Text style={styles.insightActionText}>
            {insight.actionText || 'Set Budget'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#D4A574" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  aiInsightCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  insightTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiInsightBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiInsightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    lineHeight: 24,
    marginBottom: 8,
  },
  aiInsightDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6C757D',
    lineHeight: 22,
    marginBottom: 16,
  },
  aiInsightFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
});

export default AIInsightCard;
export type { AIInsight };
