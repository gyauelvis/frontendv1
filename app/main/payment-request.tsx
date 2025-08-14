import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { paymentRequestService } from '../../services/paymentRequestService';

const PaymentRequestScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePaymentRequest = async () => {
    if (!amount) {
      Alert.alert('Missing Information', 'Please enter amount');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await paymentRequestService.createPaymentRequest({
        payerId: user.id, // For demo, user pays themselves
        amount: parseFloat(amount),
        currency: 'USD',
        description: description || 'Payment request'
      });

      if (response.success && response.data) {
        const paymentRequest = response.data;
        
        // Automatically navigate to QR code screen
        router.push({
          pathname: '/main/qr-code',
          params: { 
            requestId: paymentRequest.id,
            amount: amount,
            description: description,
            paystackUrl: paymentRequest.paystack_payment_url
          }
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to create payment request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment request. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Money</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Create Payment Request</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              autoFocus
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="What's this payment for?"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            onPress={handleCreatePaymentRequest}
            disabled={isCreating}
            activeOpacity={0.9}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create Payment Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backArrow: {
    fontSize: 20,
    color: '#343A40',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
    marginLeft: 20,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    flex: 1,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#343A40',
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  createButton: {
    backgroundColor: '#D4A574',
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#CED4DA',
    shadowOpacity: 0.1,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default PaymentRequestScreen;
