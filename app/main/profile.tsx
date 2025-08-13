import SectionHeader from '@/components/evault-components/section-header';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
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
  avatar: string;
  isVerified: boolean;
  memberSince: string;
  accountType: 'Basic' | 'Premium' | 'Business';
  totalTransactions: number;
  totalVolume: number;
  currency: string;
}

interface SecuritySettings {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  transactionNotifications: boolean;
  loginNotifications: boolean;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_123456789',
    name: 'Elvis Kwame',
    email: 'elvis.kwame@example.com',
    phone: '+233 24 123 4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    memberSince: '2023-01-15',
    accountType: 'Premium',
    totalTransactions: 156,
    totalVolume: 125000,
    currency: 'GHS',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: true,
    twoFactorEnabled: false,
    transactionNotifications: true,
    loginNotifications: true,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    setEditForm({
      name: user.name,
      phone: user.phone,
    });
  }, [user]);

  const formatCurrency = (amount: number): string => {
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
          onPress: () => {
            console.log('User logged out');
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
            console.log('Account deletion requested');
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

    if (!editForm.phone.trim()) {
      Alert.alert('Error', 'Phone number cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUser(prev => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
      }));

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ProfileHeader = () => (
    <View style={styles.cardContainer}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
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
          <Text style={styles.userName}>{user.name}</Text>
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
            disabled={loading}
          >
            {loading ? (
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
              subtitle="Connected and verified"
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