import { authService, UserProfileData } from '@/lib/auth';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface FormData {
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
}


interface CustomInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      placeholderTextColor="#8C855F"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

const CompleteProfileScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phoneNumber: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [fingerprintEnabled, setFingerprintEnabled] = useState<boolean>(false);
  const [idUploaded, setIdUploaded] = useState<boolean>(false);
  const [idDocumentUri, setIdDocumentUri] = useState<string>('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUploadID = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please enable photo access to upload your ID');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        setIdDocumentUri(pickerResult.assets[0].uri);
        setIdUploaded(true);
        Alert.alert('ID Selected', 'Your identification document has been selected and will be uploaded when you complete registration');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Upload Error', 'Failed to select ID. Please try again');
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const compatible = await LocalAuthentication.hasHardwareAsync();

      if (!compatible) {
        Alert.alert('Not Supported', 'Your device does not support biometric authentication');
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!enrolled) {
        Alert.alert('Not Set Up', 'Please set up biometric authentication in your device settings');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
      });

      if (result.success) {
        setFingerprintEnabled(true);
        Alert.alert('Biometric Enabled', 'Fingerprint authentication will be activated after registration');
      }
    } else {
      setFingerprintEnabled(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.phoneNumber || !formData.password) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return false;
    }

    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Missing Information', 'Please enter your first and last name');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return false;
    }

    if (!idUploaded) {
      Alert.alert('ID Required', 'Please upload your identification document to continue');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Create user account
      const userProfileData: UserProfileData = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        biometricEnabled: fingerprintEnabled,
        kycDocumentUri: idDocumentUri,
        password: formData.password, // Include password for signup
      };

      const signUpResult = await authService.signUpUser(userProfileData);

      if (!signUpResult.success) {
        Alert.alert('Registration Failed', signUpResult.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // 2. Upload KYC document if provided
      if (idDocumentUri && signUpResult.userId) {
        const uploadResult = await authService.uploadKYCDocument({
          userId: signUpResult.userId,
          documentUri: idDocumentUri,
          documentType: 'other' // You might want to add a picker for document type
        });

        if (!uploadResult.success) {
          console.warn('KYC upload failed:', uploadResult.error);
          // Don't fail the entire registration if KYC upload fails
        }
      }

      setLoading(false);

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
      router.push('/auth/login');

    } catch (error) {
      setLoading(false);
      Alert.alert('Registration Failed', 'An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const handleGoBack = () => {
    router.back();
    setCurrentStep(1);
    setFormData({
      email: '',
      phoneNumber: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setFingerprintEnabled(false);
    setIdUploaded(false);
    setIdDocumentUri('');
  };

  const ProgressDots = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            step === currentStep ? styles.progressDotActive : styles.progressDotInactive
          ]}
        />
      ))}
    </View>
  );



  return (
    <SafeAreaView style={styles.container}>
      {/* Geometric background pattern */}
      <View style={styles.geometricPattern} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Indicator */}
        <ProgressDots />

        {/* Form Section */}
        <View style={styles.formSection}>
          <CustomInput
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
          />

          <CustomInput
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
          />

          <CustomInput
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
          />

          <CustomInput
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
          />

          <CustomInput
            label="Password"
            placeholder="Create a password (min. 6 characters)"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={true}
          />
        </View>

        {/* KYC Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>KYC Verification</Text>
          <Text style={styles.sectionDescription}>
            Upload a clear photo of your ID to verify your identity.
          </Text>

          <TouchableOpacity
            style={[
              styles.uploadContainer,
              idUploaded && styles.uploadContainerSuccess
            ]}
            onPress={handleUploadID}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={styles.uploadContent}>
              <View style={[
                styles.uploadIcon,
                idUploaded && styles.uploadIconSuccess
              ]}>
                <Text style={styles.uploadEmoji}>
                  {idUploaded ? '✅' : '📄'}
                </Text>
              </View>
              <Text style={styles.uploadTitle}>
                {idUploaded ? 'ID Selected' : 'Upload ID'}
              </Text>
              <Text style={styles.uploadSubtitle}>
                {idUploaded
                  ? 'Identification document ready for upload'
                  : 'Tap to select your identification document'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Biometric Security Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Biometric Security</Text>
          <Text style={styles.sectionDescription}>
            Enable fingerprint authentication for faster and secure access.
          </Text>

          <View style={styles.biometricContainer}>
            <View style={styles.biometricContent}>
              <View style={[
                styles.biometricIcon,
                fingerprintEnabled && styles.biometricIconActive
              ]}>
                <Text style={styles.biometricEmoji}>
                  {fingerprintEnabled ? '👆' : '🔒'}
                </Text>
              </View>
              <Text style={styles.biometricText}>
                {fingerprintEnabled ? 'Fingerprint Enabled' : 'Enable Fingerprint'}
              </Text>
            </View>
            <Switch
              value={fingerprintEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: '#F5F4F0', true: '#D4A574' }}
              thumbColor={fingerprintEnabled ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#F5F4F0"
              style={styles.switch}
              disabled={loading}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  geometricPattern: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: height * 0.8,
    borderRadius: 200,
    backgroundColor: '#F8F9FA',
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotActive: {
    backgroundColor: '#D4A574',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressDotInactive: {
    backgroundColor: '#E9ECEF',
  },
  formSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  textInput: {
    height: 56,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#343A40',
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#6C757D',
    lineHeight: 22,
    marginBottom: 20,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FAFBFC',
  },
  uploadContainerSuccess: {
    borderColor: '#D4A574',
    borderStyle: 'solid',
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  uploadIconSuccess: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderColor: '#D4A574',
  },
  uploadEmoji: {
    fontSize: 28,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  biometricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  biometricIconActive: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderColor: '#D4A574',
  },
  biometricEmoji: {
    fontSize: 20,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    letterSpacing: -0.2,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  continueButton: {
    backgroundColor: '#D4A574',
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 40,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#B8B8B8',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default CompleteProfileScreen;