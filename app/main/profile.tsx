import SectionHeader from '@/components/evault-components/section-header';
import { authService } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  memberSince: string;
  accountType: 'Basic' | 'Premium' | 'Business';
  totalTransactions: number;
  totalVolume: number;
  currency: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  phone_verified?: boolean;
  email_confirmed_at?: string;
  created_at?: string;
}

interface SecuritySettings {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  transactionNotifications: boolean;
  loginNotifications: boolean;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: true,
    twoFactorEnabled: false,
    transactionNotifications: true,
    loginNotifications: true,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
  });

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get current authenticated user
      const { user: authUser } = await authService.getCurrentUser();
      
      if (!authUser) {
        Alert.alert('Error', 'No authenticated user found', [
          { text: 'OK', onPress: () => router.replace('/auth/login' as never) }
        ]);
        return;
      }

      // Get detailed user profile
      const profileResult = await authService.getUserProfile(authUser.id);
      
      let profileData: UserProfile;

      if (profileResult.success && profileResult.data) {
        // Use profile data from database
        const data = profileResult.data;
        profileData = {
          id: authUser.id,
          name: data.full_name || data.first_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          phone: data.phone_number || '',
          isVerified: !!authUser.email_confirmed_at && !!data.phone_verified,
          memberSince: authUser.created_at || new Date().toISOString(),
          accountType: 'Basic', // You can determine this based on your business logic
          totalTransactions: 0, // These would come from your transaction data
          totalVolume: 0,
          currency: 'GHS',
          // Include all the original fields for potential use
          full_name: data.full_name,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          phone_verified: data.phone_verified,
          email_confirmed_at: authUser.email_confirmed_at,
          created_at: authUser.created_at,
        };
      } else {
        // Fallback to basic auth user data
        profileData = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || 
                authUser.user_metadata?.first_name || 
                authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          phone: authUser.user_metadata?.phone || authUser.phone || '',
          isVerified: !!authUser.email_confirmed_at,
          memberSince: authUser.created_at || new Date().toISOString(),
          accountType: 'Basic',
          totalTransactions: 0,
          totalVolume: 0,
          currency: 'GHS',
          created_at: authUser.created_at,
          email_confirmed_at: authUser.email_confirmed_at,
        };
      }

      setUser(profileData);
      
      // Initialize edit form
      setEditForm({
        name: profileData.name,
        phone: profileData.phone,
      });

    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (!user) return '₵0.00';
    
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: user.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              router.replace('/auth/login' as never);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Account deletion requested');
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          }
        }
      ]
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable biometric authentication',
          fallbackLabel: 'Use Passcode',
        });

        if (result.success) {
          setSecuritySettings(prev => ({ ...prev, biometricEnabled: true }));
        }
      } catch (error) {
        console.error('Biometric auth error:', error);
      }
    } else {
      setSecuritySettings(prev => ({ ...prev, biometricEnabled: false }));
    }
  };

  const handleSecurityToggle = (setting: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User data not available');
      return;
    }

    try {
      setUpdating(true);
      
      // Update user profile in the database
      const updateData = {
        full_name: editForm.name.trim(),
        phone_number: editForm.phone.trim(),
        // You might also want to split the name into first_name and last_name
        first_name: editForm.name.trim().split(' ')[0],
        last_name: editForm.name.trim().split(' ').slice(1).join(' ') || null,
      };

      const result = await authService.updateUserProfile(user.id, updateData);
      
      if (result.success) {
        // Update local state
        setUser(prev => prev ? {
          ...prev,
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          full_name: editForm.name.trim(),
          phone_number: editForm.phone.trim(),
        } : null);

        setEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (): string => {
    if (!user) return 'U';
    
    const name = user.name || user.email || 'User';
    const parts = name.split(' ');
    
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return name.charAt(0).toUpperCase();
  };

  const getDisplayName = (): string => {
    if (!user) return 'User';
    return user.name || user.email?.split('@')[0] || 'User';
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ProfileHeader = () => (
    <View style={styles.cardContainer}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#00C851" />
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.accountTypeContainer}>
            <Text style={[styles.accountType, { 
              backgroundColor: user.accountType === 'Premium' ? '#FFD700' : 
                              user.accountType === 'Business' ? '#4285F4' : '#E0E0E0'
            }]}>
              {user.accountType}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const StatsCard = () => (
    <View style={styles.cardContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.totalTransactions}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(user.totalVolume)}</Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
      </View>
      <View style={styles.memberSinceContainer}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.memberSinceText}>Member since {formatDate(user.memberSince)}</Text>
      </View>
    </View>
  );

  const MenuCard = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.cardContainer}>
      {children}
    </View>
  );

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent,
    isLast = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
    isLast?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.menuItem, isLast && styles.lastMenuItem]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon as any} size={20} color="#666" />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={18} color="#CCC" />}
      </View>
    </TouchableOpacity>
  );

  const EditProfileModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            style={styles.modalButton}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleUpdateProfile}
            style={styles.modalButton}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <Text style={styles.modalSaveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.name}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.phone}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={user.email}
              editable={false}
              placeholder="Email cannot be changed"
            />
            <Text style={styles.helperText}>Email address cannot be changed for security reasons</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />
        <StatsCard />

        <View style={styles.section}>
          <SectionHeader title="Account" />
          <MenuCard>
            <MenuItem
              icon="person-outline"
              title="Personal Information"
              subtitle="Update your personal details"
              onPress={() => setEditModalVisible(true)}
            />
            <MenuItem
              icon="card-outline"
              title="Payment Methods"
              subtitle="Manage your linked accounts"
              onPress={() => console.log('Payment methods')}
            />
            <MenuItem
              icon="wallet-outline"
              title="Paystack Wallet"
              subtitle={user.phone_verified ? "Connected and verified" : "Not verified"}
              onPress={() => console.log('Paystack wallet')}
              isLast={true}
            />
          </MenuCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Security" />
          <MenuCard>
            <MenuItem
              icon="finger-print"
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID"
              onPress={() => {}}
              showArrow={false}
              rightComponent={
                <Switch
                  value={securitySettings.biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: '#E0E0E0', true: '#4285F4' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <MenuItem
              icon="shield-outline"
              title="Two-Factor Authentication"
              subtitle="Extra security for your account"
              onPress={() => {}}
              showArrow={false}
              rightComponent={
                <Switch
                  value={securitySettings.twoFactorEnabled}
                  onValueChange={() => handleSecurityToggle('twoFactorEnabled')}
                  trackColor={{ false: '#E0E0E0', true: '#4285F4' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <MenuItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => console.log('Change password')}
              isLast={true}
            />
          </MenuCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Notifications" />
          <MenuCard>
            <MenuItem
              icon="notifications-outline"
              title="Transaction Alerts"
              subtitle="Get notified of all transactions"
              onPress={() => {}}
              showArrow={false}
              rightComponent={
                <Switch
                  value={securitySettings.transactionNotifications}
                  onValueChange={() => handleSecurityToggle('transactionNotifications')}
                  trackColor={{ false: '#E0E0E0', true: '#4285F4' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <MenuItem
              icon="log-in-outline"
              title="Login Notifications"
              subtitle="Get notified of new logins"
              onPress={() => {}}
              showArrow={false}
              rightComponent={
                <Switch
                  value={securitySettings.loginNotifications}
                  onValueChange={() => handleSecurityToggle('loginNotifications')}
                  trackColor={{ false: '#E0E0E0', true: '#4285F4' }}
                  thumbColor="#FFFFFF"
                />
              }
              isLast={true}
            />
          </MenuCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Support" />
          <MenuCard>
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help with your account"
              onPress={() => console.log('Help')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => console.log('Terms')}
            />
            <MenuItem
              icon="star-outline"
              title="Rate App"
              subtitle="Rate us on the app store"
              onPress={() => console.log('Rate app')}
              isLast={true}
            />
          </MenuCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account Actions" />
          <MenuCard>
            <MenuItem
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
            />
            <MenuItem
              icon="trash-outline"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={handleDeleteAccount}
              isLast={true}
            />
          </MenuCard>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EditProfileModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4285F4',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  accountTypeContainer: {
    alignSelf: 'flex-start',
  },
  accountType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  memberSinceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalButton: {
    padding: 4,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285F4',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfilePage;