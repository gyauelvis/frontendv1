import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');

interface RecentContact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatar: string;
  lastTransaction: string;
  amount?: number;
}

interface QuickAmount {
  value: number;
  label: string;
}

interface AccountLookupResult {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accounts: Array<{
    id: string;
    accountNumber: string;
    accountType: string;
    currency: string;
  }>;
}

interface TransferResponse {
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  senderAccount: {
    id: string;
    accountNumber: string;
    newBalance: number;
  };
  recipientAccount: {
    id: string;
    accountNumber: string;
    newBalance: number;
  };
  timestamp: string;
}

// Recent Contact Item Component
const RecentContactItem: React.FC<{ contact: RecentContact; onSelect: (contact: RecentContact) => void; index: number }> = ({ 
  contact, 
  onSelect, 
  index 
}) => {
  const [slideAnim] = useState(new Animated.Value(50));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
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
  }, []);

  return (
    <Animated.View 
      style={[
        styles.contactItem,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity onPress={() => onSelect(contact)} style={styles.contactButton}>
        <LinearGradient
          colors={['#D4A574', '#B08E6B']}
          style={styles.contactAvatar}
        >
          <Text style={styles.contactInitial}>{contact.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactInfo}>{contact.phoneNumber}</Text>
          {contact.amount && (
            <Text style={styles.lastAmount}>Last sent: ₦{contact.amount.toLocaleString()}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6C757D" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Quick Amount Button Component
const QuickAmountButton: React.FC<{ 
  amount: QuickAmount; 
  isSelected: boolean; 
  onPress: () => void;
  index: number;
}> = ({ amount, isSelected, onPress, index }) => {
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.quickAmountButton,
          isSelected && styles.quickAmountButtonSelected
        ]}
        onPress={onPress}
      >
        <Text style={[
          styles.quickAmountText,
          isSelected && styles.quickAmountTextSelected
        ]}>
          {amount.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Send Money Screen Component
const SendMoneyScreen: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState<RecentContact | null>(null);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<QuickAmount | null>(null);
  const [userAccounts, setUserAccounts] = useState<Array<{id: string, accountNumber: string, availableBalance: string, currency: string}>>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(30));
  const [opacityAnim] = useState(new Animated.Value(0));
  const { user } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get user's accounts on component mount
  useEffect(() => {
    const getUserAccounts = async () => {
      if (!user?.id) return;
      
      setIsLoadingAccounts(true);
      try {
        const response = await apiClient.get(`/payments/accounts/${user.id}`);
        if (response.data.success) {
          setUserAccounts(response.data.data);
        }
      } catch (error) {
        console.error('Error loading user accounts:', error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    getUserAccounts();
  }, [user?.id]);

  // Sample recent contacts data
  const recentContacts: RecentContact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      phoneNumber: '+234 801 234 5678',
      email: 'sarah@email.com',
      avatar: 'SJ',
      lastTransaction: '2 days ago',
      amount: 5000,
    },
    {
      id: '2',
      name: 'Mike Chen',
      phoneNumber: '+234 802 345 6789',
      avatar: 'MC',
      lastTransaction: '1 week ago',
      amount: 12000,
    },
    {
      id: '3',
      name: 'Emma Davis',
      phoneNumber: '+234 803 456 7890',
      email: 'emma@email.com',
      avatar: 'ED',
      lastTransaction: '3 days ago',
      amount: 8500,
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      phoneNumber: '+234 804 567 8901',
      avatar: 'AR',
      lastTransaction: '5 days ago',
      amount: 3000,
    },
  ];

  // Quick amount options
  const quickAmounts: QuickAmount[] = [
    { value: 1000, label: '₦1K' },
    { value: 2000, label: '₦2K' },
    { value: 5000, label: '₦5K' },
    { value: 10000, label: '₦10K' },
    { value: 20000, label: '₦20K' },
    { value: 50000, label: '₦50K' },
  ];

  // Event handlers
  const handleContactSelect = (contact: RecentContact): void => {
    setSelectedContact(contact);
    setRecipient(contact.phoneNumber);
  };

  const handleQuickAmountSelect = (quickAmount: QuickAmount): void => {
    setSelectedQuickAmount(quickAmount);
    setAmount(quickAmount.value.toString());
  };

  const handleAmountChange = (text: string): void => {
    // Remove any non-numeric characters except decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    setAmount(numericValue);
    setSelectedQuickAmount(null);
  };

  const handleTransfer = async (): Promise<void> => {
    if (!isFormValid || !user?.id) return;

    setIsLoading(true);

    try {
      // Get user's primary account (first account)
      if (userAccounts.length === 0) {
        Alert.alert('Error', 'No accounts found. Please try again.');
        return;
      }

      const senderAccount = userAccounts[0]; // Use first account as sender

      // Look up recipient by phone number or email
      let recipientAccountId: string;
      let recipientDetails: any;

      try {
        const lookupResponse = await apiClient.get(`/payments/lookup/${recipient}`);
        if (lookupResponse.data.success) {
          recipientDetails = lookupResponse.data.data;
          if (recipientDetails.accounts && recipientDetails.accounts.length > 0) {
            recipientAccountId = recipientDetails.accounts[0].id;
          } else {
            Alert.alert('Error', 'Recipient has no accounts');
            return;
          }
        } else {
          Alert.alert('Error', 'Recipient not found');
          return;
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to find recipient. Please check the phone number or email.');
        return;
      }

      const transferData = {
        senderAccountId: senderAccount.id,
        recipientAccountId: recipientAccountId,
        amount: parseFloat(amount),
        currency: 'USD',
        description: note || `Transfer to ${recipient}`
      };

      console.log('Making transfer with data:', transferData);

      // Make the transfer
      const transferResponse = await apiClient.post('/payments/transfer', transferData);

      if (transferResponse.data.success) {
        const transferData: TransferResponse = transferResponse.data.data;
        
        Alert.alert(
          'Success! 🎉',
          `$${parseFloat(amount).toLocaleString()} sent successfully!\n\nTransaction ID: ${transferData.transactionId}\nReference: ${transferData.reference}\nNew Balance: $${transferData.senderAccount.newBalance.toLocaleString()}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setRecipient('');
                setAmount('');
                setNote('');
                setSelectedContact(null);
                setSelectedQuickAmount(null);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', transferResponse.data.message || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  const isFormValid = recipient && amount && parseFloat(amount) > 0;

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Amount Input Section */}
      <Animated.View 
        style={[
          styles.amountSection,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['#D4A574', '#B08E6B']}
          style={styles.amountGradient}
        >
          <Text style={styles.amountLabel}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {amount && (
            <Text style={styles.amountWords}>
              {parseFloat(amount).toLocaleString()} Naira
            </Text>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Quick Amount Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Amounts</Text>
        <View style={styles.quickAmountsGrid}>
          {quickAmounts.map((quickAmount, index) => (
            <QuickAmountButton
              key={quickAmount.value}
              amount={quickAmount}
              isSelected={selectedQuickAmount?.value === quickAmount.value}
              onPress={() => handleQuickAmountSelect(quickAmount)}
              index={index}
            />
          ))}
        </View>
      </View>

      {/* Recipient Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send To</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="person-outline" size={20} color="#D4A574" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Phone number or email"
            placeholderTextColor="#6C757D"
            value={recipient}
            onChangeText={setRecipient}
            keyboardType="email-address"
          />
          {selectedContact && (
            <TouchableOpacity 
              onPress={() => {
                setSelectedContact(null);
                setRecipient('');
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#6C757D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Contacts</Text>
        <View style={styles.contactsContainer}>
          {recentContacts.map((contact, index) => (
            <RecentContactItem
              key={contact.id}
              contact={contact}
              onSelect={handleContactSelect}
              index={index}
            />
          ))}
        </View>
      </View>

      {/* Note Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Note (Optional)</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="chatbubble-outline" size={20} color="#D4A574" />
          </View>
          <TextInput
            style={[styles.textInput, styles.noteInput]}
            placeholder="What's this for?"
            placeholderTextColor="#6C757D"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={100}
          />
        </View>
      </View>

      {/* Transaction Summary */}
      {isFormValid && (
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transaction Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recipient:</Text>
              <Text style={styles.summaryValue}>
                {selectedContact?.name || recipient}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>₦{parseFloat(amount).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fee:</Text>
              <Text style={styles.summaryValue}>₦0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₦{parseFloat(amount).toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Send Button */}
      <View style={styles.sendButtonContainer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            !isFormValid && styles.sendButtonDisabled
          ]}
                          onPress={handleTransfer}
          disabled={!isFormValid || isLoading}
        >
          <LinearGradient
            colors={isFormValid ? ['#D4A574', '#B08E6B'] : ['#E9ECEF', '#DEE2E6']}
            style={styles.sendButtonGradient}
          >
            {isLoading ? (
              <Text style={styles.sendButtonText}>Sending...</Text>
            ) : (
              <>
                <Ionicons 
                  name="paper-plane" 
                  size={20} 
                  color={isFormValid ? "#FFFFFF" : "#6C757D"} 
                />
                <Text style={[
                  styles.sendButtonText,
                  !isFormValid && styles.sendButtonTextDisabled
                ]}>
                  Send Money
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Amount Section
  amountSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  amountGradient: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 120,
    maxWidth: 200,
  },
  amountWords: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },

  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 16,
    marginHorizontal: 20,
  },

  // Quick Amounts
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickAmountButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAmountButtonSelected: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  quickAmountTextSelected: {
    color: '#FFFFFF',
  },

  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#343A40',
    paddingVertical: 16,
  },
  noteInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  clearButton: {
    padding: 4,
  },

  // Contacts
  contactsContainer: {
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
  contactItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
  contactInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
    marginTop: 2,
  },
  lastAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D4A574',
    marginTop: 2,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343A40',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4A574',
  },

  // Send Button
  sendButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sendButton: {
    borderRadius: 16,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    shadowOpacity: 0.1,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sendButtonTextDisabled: {
    color: '#6C757D',
  },

  bottomSpacing: {
    height: 20,
  },
});

export default SendMoneyScreen;