import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface HeaderProps {
  balance?: string;
  userName?: string;
  onNotificationPress: () => void;
  showNotificationBadge?: boolean;
}

const AppHeader: React.FC<HeaderProps> = ({
  balance,
  userName = "Elvis",
  onNotificationPress,
  showNotificationBadge = true
}) => {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#D4A574', '#B08E6B']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>{userName[0]}</Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.appTitle}>{userName}</Text>
              <Text style={styles.welcomeText}>Welcome back!</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton}>
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications-outline" size={24} color="#343A40" />
              {showNotificationBadge && <View style={styles.notificationBadge} />}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

export default AppHeader;