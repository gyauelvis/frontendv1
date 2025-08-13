import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetAmount: number;
  currentAmount: number;
  icon?: keyof typeof Ionicons.glyphMap;
  onDetailsPress?: () => void;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const handleDetailsPress = () => {
    if (challenge.onDetailsPress) {
      challenge.onDetailsPress();
    } else {
      console.log(`View details for challenge: ${challenge.title}`);
    }
  };

  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeIconContainer}>
          <LinearGradient
            colors={['#D4A574', '#B08E6B']}
            style={styles.challengeIcon}
          >
            <Ionicons 
              name={challenge.icon || 'trophy'} 
              size={20} 
              color="#FFFFFF" 
            />
          </LinearGradient>
        </View>
        <Text style={styles.challengeBadge}>Challenge</Text>
      </View>
      
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#D4A574', '#B08E6B']}
            style={[styles.progressFill, { width: `${Math.min(challenge.progress, 100)}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{challenge.progress}%</Text>
      </View>
      
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeAmount}>
          ${challenge.currentAmount} / ${challenge.targetAmount}
        </Text>
        <TouchableOpacity style={styles.challengeAction} onPress={handleDetailsPress}>
          <Text style={styles.challengeActionText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  challengeIconContainer: {
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  challengeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F3F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#343A40',
    minWidth: 36,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  challengeAction: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  challengeActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A574',
  },
});

export default ChallengeCard;
export type { Challenge };
