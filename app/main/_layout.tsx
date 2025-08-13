import { Slot, usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

import BottomNavigation, { NavigationItem } from '@/components/evault-components/bottom-nav';
import AppHeader from '@/components/evault-components/e-header';

const RootLayout: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    { 
      id: 'home', 
      title: 'Home', 
      icon: 'home-outline', 
      isActive: pathname === '/main/main'
    },
    { 
      id: 'send', 
      title: 'Send', 
      icon: 'send-outline', 
      isActive: pathname === '/send' || pathname === '/main/send'
    },
    { 
      id: 'analytics', 
      title: 'Analytics', 
      icon: 'analytics-outline', 
      isActive: pathname === '/analytics' || pathname === '/main/analytics'
    },
    { 
      id: 'challenges', 
      title: 'Challenges', 
      icon: 'trophy-outline', 
      isActive: pathname === '/challenges'
    },
    { 
      id: 'profile', 
      title: 'Profile', 
      icon: 'person-outline', 
      isActive: pathname === '/profile'
    },
  ];

  // Event handlers
  const handleNotificationPress = (): void => {
    console.log('Notification pressed');
    // Navigate to notifications screen or open notification modal
    // router.push('/notifications');
  };

  const handleNavigationPress = (id: string): void => {
    console.log(`Navigation pressed: ${id}`);
    
    switch (id) {
      case 'home':
        router.push('/main/main');
        break;
      case 'send':
        router.push('/main/connect');
        break;
      case 'analytics':
        router.push('/main/analytics');
        break;
      case 'challenges':
        router.push('/challenges' as never);
        break;
      case 'profile':
        router.push('/main/profile');
        break;
      default:
        console.warn(`Unknown navigation id: ${id}`);
    }
  };

  // Get current user name - this could come from context/state management
  const getCurrentUserName = (): string => {
    // This could be retrieved from user context, AsyncStorage, or state management
    return 'Elvis';
  };

  // Determine if notification badge should be shown
  const getNotificationBadgeStatus = (): boolean => {
    // This could be based on actual notification state
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Shared Header */}
      <AppHeader
        userName={getCurrentUserName()}
        onNotificationPress={handleNotificationPress}
        showNotificationBadge={getNotificationBadgeStatus()}
      />

      {/* Main Content Area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Shared Bottom Navigation */}
      <BottomNavigation
        navigation={navigationItems}
        onNavigationPress={handleNavigationPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
});

export default RootLayout;