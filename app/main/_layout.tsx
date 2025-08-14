
import BottomNavigation, { NavigationItem } from '@/components/evault-components/bottom-nav';
import AppHeader from '@/components/evault-components/e-header';
import { authService } from '@/lib/auth';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

const RootLayout: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

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
      isActive: pathname === '/main/challenge'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      isActive: pathname === '/main/profile'
    },
  ];

  const handleNotificationPress = (): void => {
    console.log('Notification pressed');
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
        router.push('/main/challenge');
        break;
      case 'profile':
        router.push('/main/profile');
        break;
      default:
        console.warn(`Unknown navigation id: ${id}`);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { user } = await authService.getCurrentUser();

        if (user) {
          const profileResult = await authService.getUserProfile(user.id);

          if (profileResult.success && profileResult.data) {
            setUserProfile(profileResult.data);
          } else {
            setUserProfile({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name,
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  const getNotificationBadgeStatus = (): boolean => {
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Shared Header */}
      <AppHeader
        userName={userProfile?.first_name || ''}
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