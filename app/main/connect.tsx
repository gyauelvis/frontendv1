import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PaystackConnectionProps {
  onConnectionSuccess?: (walletData: any) => void;
  onBack?: () => void;
}

const PaystackConnection: React.FC<PaystackConnectionProps> = ({
  onConnectionSuccess,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<'verify' | 'connect' | 'success'>('verify');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  // Check biometric availability on component mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        'Biometric Authentication Unavailable',
        'Please set up fingerprint or face recognition to continue.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setLoading(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to connect your Paystack wallet',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setIsAuthenticated(true);
        setCurrentStep('connect');
      } else {
        Alert.alert('Authentication Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = (): boolean => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return false;
    }
    
    return true;
  };

  const handlePaystackConnection = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setConnectionStatus('connecting');

      // Simulate Paystack API integration
      // In production, this would call your backend which interfaces with Paystack
      const response = await simulatePaystackConnection();
      
      if (response.success) {
        setConnectionStatus('success');
        setCurrentStep('success');
        
        // Call success callback with wallet data
        onConnectionSuccess?.(response.walletData);
      } else {
        setConnectionStatus('error');
        Alert.alert('Connection Failed', response.error || 'Unable to connect to Paystack');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Paystack connection error:', error);
      Alert.alert('Error', 'Failed to connect to Paystack. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Paystack API connection
  const simulatePaystackConnection = (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful connection
        resolve({
          success: true,
          walletData: {
            accountId: 'psk_' + Math.random().toString(36).substr(2, 9),
            email: email,
            phoneNumber: phoneNumber,
            balance: 0,
            currency: 'NGN',
            isVerified: true,
            connectedAt: new Date().toISOString(),
          }
        });
      }, 3000);
    });
  };

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={80} color="#00C851" />
      </View>
      
      <Text style={styles.title}>Security Verification</Text>
      <Text style={styles.subtitle}>
        We use fingerprint authentication to ensure your wallet connection is secure
      </Text>
      
      <View style={styles.securityFeatures}>
        <View style={styles.featureItem}>
          <Ionicons name="lock-closed" size={24} color="#00C851" />
          <Text style={styles.featureText}>End-to-end encryption</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="eye-off" size={24} color="#00C851" />
          <Text style={styles.featureText}>Private key protection</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="shield" size={24} color="#00C851" />
          <Text style={styles.featureText}>Fraud detection</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleBiometricAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="finger-print" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Authenticate with Fingerprint</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderConnectionStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet" size={80} color="#D4A574" />
      </View>
      
      <Text style={styles.title}>Connect to Paystack</Text>
      <Text style={styles.subtitle}>
        Enter your details to securely connect your Paystack wallet
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#D4A574" />
        <Text style={styles.infoText}>
          Your credentials are encrypted and never stored on our servers
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handlePaystackConnection}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.buttonText}>Connecting...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Connect Wallet</Text>
        )}
      </TouchableOpacity>

      {connectionStatus === 'connecting' && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Establishing secure connection...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>
      )}
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#00C851" />
      </View>
      
      <Text style={styles.title}>Connection Successful!</Text>
      <Text style={styles.subtitle}>
        Your Paystack wallet has been securely connected to your account
      </Text>

      <View style={styles.successInfo}>
        <View style={styles.successItem}>
          <Text style={styles.successLabel}>Email:</Text>
          <Text style={styles.successValue}>{email}</Text>
        </View>
        <View style={styles.successItem}>
          <Text style={styles.successLabel}>Phone:</Text>
          <Text style={styles.successValue}>{phoneNumber}</Text>
        </View>
        <View style={styles.successItem}>
          <Text style={styles.successLabel}>Status:</Text>
          <Text style={[styles.successValue, { color: '#00C851' }]}>Verified ✓</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => onBack?.()}
      >
        <Text style={styles.buttonText}>Continue to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'verify':
        return renderVerificationStep();
      case 'connect':
        return renderConnectionStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderVerificationStep();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paystack Integration</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        <View style={[styles.stepDot, currentStep === 'verify' && styles.activeDot]} />
        <View style={[styles.stepLine, currentStep !== 'verify' && styles.activeLine]} />
        <View style={[styles.stepDot, currentStep === 'connect' && styles.activeDot]} />
        <View style={[styles.stepLine, currentStep === 'success' && styles.activeLine]} />
        <View style={[styles.stepDot, currentStep === 'success' && styles.activeDot]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderCurrentStep()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E5E5',
  },
  activeDot: {
    backgroundColor: '#D4A57430',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 10,
  },
  activeLine: {
    backgroundColor: '#4285F4',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  securityFeatures: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4A57430',
    
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    width: '100%',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#D4A574',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  successInfo: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  successItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  successLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  successValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default PaystackConnection;