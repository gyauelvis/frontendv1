import { authService } from '@/lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface FormData {
    emailOrPhone: string;
    password: string;
    otp: string;
}

interface TimerState {
    minutes: number;
    seconds: number;
}

const LoginScreen = () => {
    const router = useRouter();
    const otpInputRef = useRef<TextInput>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [otpLoading, setOtpLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormData>({
        emailOrPhone: '',
        password: '',
        otp: ''
    });
    const [showOTP, setShowOTP] = useState<boolean>(false);
    const [timer, setTimer] = useState<TimerState>({ minutes: 0, seconds: 30 });
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
    const [pendingUserId, setPendingUserId] = useState<string>('');

    // Check if biometric authentication is available and load saved credentials
    useEffect(() => {
        const initializeAuth = async () => {
            // Check biometrics
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();

            if (compatible && enrolled) {
                setBiometricAvailable(true);
            }

            // Load saved credentials
            try {
                const savedEmail = await AsyncStorage.getItem('savedEmail');
                const savedRememberMe = await AsyncStorage.getItem('rememberMe');

                if (savedEmail) {
                    setFormData(prev => ({ ...prev, emailOrPhone: savedEmail }));
                    setRememberMe(savedRememberMe === 'true');
                    setIsFirstTime(false);
                }
            } catch (error) {
                console.error('Error loading saved credentials:', error);
            }

            // // Check if user is already logged in
            // const { user } = await authService.getCurrentUser();
            // if (user) {
            //     router.replace('/(tabs)');
            // }
        };

        initializeAuth();
    }, []);

    // Timer effect
    const updateTimer = useCallback(() => {
        setTimer(prevTimer => {
            if (prevTimer.seconds > 0) {
                return { ...prevTimer, seconds: prevTimer.seconds - 1 };
            } else if (prevTimer.minutes > 0) {
                return { minutes: prevTimer.minutes - 1, seconds: 59 };
            } else {
                setIsTimerActive(false);
                return { minutes: 0, seconds: 0 };
            }
        });
    }, []);

    useEffect(() => {
        if (isTimerActive && (timer.minutes > 0 || timer.seconds > 0)) {
            timerRef.current = setInterval(updateTimer, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isTimerActive, timer.minutes, timer.seconds, updateTimer]);

    const handleInputChange = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const saveCredentials = useCallback(async () => {
        try {
            if (rememberMe) {
                await AsyncStorage.setItem('savedEmail', formData.emailOrPhone);
                await AsyncStorage.setItem('rememberMe', 'true');
            } else {
                await AsyncStorage.removeItem('savedEmail');
                await AsyncStorage.removeItem('rememberMe');
            }
        } catch (error) {
            console.error('Error saving credentials:', error);
        }
    }, [rememberMe, formData.emailOrPhone]);

    const handleLogin = useCallback(async () => {
        if (!formData.emailOrPhone || !formData.password) {
            Alert.alert('Missing Information', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            // Attempt login
            const result = await authService.signInUser(formData.emailOrPhone, formData.password);

            if (!result.success) {
                Alert.alert('Login Failed', result.error || 'Invalid credentials');
                setLoading(false);
                return;
            }

            // Save credentials if remember me is checked
            await saveCredentials();

            // Check if user has verified email
            if (result.user && !result.user.email_confirmed_at) {
                Alert.alert(
                    'Email Verification Required',
                    'Please check your email and click the verification link before proceeding.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // Get user profile to check if phone is verified
            if (result.user) {
                const profileResult = await authService.getUserProfile(result.user.id);

                if (profileResult.success && profileResult.data) {
                    // Check if phone verification is needed
                    const needsPhoneVerification = !profileResult.data.phone_verified;

                    if (needsPhoneVerification && formData.emailOrPhone.includes('@')) {
                        // If logging in with email but phone needs verification
                        setPendingUserId(result.user.id);
                        setShowOTP(true);
                        setTimer({ minutes: 0, seconds: 30 });
                        setIsTimerActive(true);

                        // Send OTP
                        await authService.sendOTP(profileResult.data.phone_number);

                        setTimeout(() => {
                            otpInputRef.current?.focus();
                        }, 100);

                        setLoading(false);
                        return;
                    }
                }
            }

            // Login successful
            setLoading(false);
            Alert.alert('Login Successful', 'Welcome back!', [
                { text: 'OK', onPress: () => router.push('/main/main') }
            ]);

        } catch (error) {
            setLoading(false);
            Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        }
    }, [formData.emailOrPhone, formData.password, saveCredentials, router]);

    const handleBiometrics = async () => {
        if (!biometricAvailable) {
            Alert.alert('Biometric Unavailable', 'Your device does not support biometric authentication');
            return;
        }

        try {
            // Check if user has biometric credentials stored
            const savedUserId = await AsyncStorage.getItem('biometricUserId');

            if (!savedUserId) {
                Alert.alert('Biometric Not Set Up', 'Please log in with your password first to enable biometric authentication');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to login',
                fallbackLabel: 'Use Password Instead'
            });

            if (result.success) {
                // Get user data and sign them in
                const { user } = await authService.getCurrentUser();

                if (user || savedUserId) {
                    Alert.alert('Authentication Successful', 'Welcome back!', [
                        { text: 'OK', onPress: () => router.replace('/(tabs)') }
                    ]);
                } else {
                    Alert.alert('Authentication Failed', 'Please log in with your password');
                }
            }
        } catch (error) {
            Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again');
        }
    };

    const handleSocialLogin = useCallback(async (platform: string) => {
        // Implement social login based on platform
        if (platform === 'Google') {
            // Implement Google OAuth
            Alert.alert('Coming Soon', 'Google login will be available soon');
        } else if (platform === 'Apple') {
            // Implement Apple Sign In
            Alert.alert('Coming Soon', 'Apple Sign In will be available soon');
        }
    }, []);

    const handleResendOTP = useCallback(async () => {
        if (timer.minutes === 0 && timer.seconds === 0) {
            setOtpLoading(true);

            try {
                // Get user phone number and resend OTP
                const profileResult = await authService.getUserProfile(pendingUserId);

                if (profileResult.success && profileResult.data?.phone_number) {
                    await authService.sendOTP(profileResult.data.phone_number);
                    setTimer({ minutes: 0, seconds: 30 });
                    setIsTimerActive(true);
                    Alert.alert('OTP Sent', 'A new verification code has been sent to your phone');
                } else {
                    Alert.alert('Error', 'Failed to resend OTP. Please try logging in again.');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to resend OTP. Please try again.');
            }

            setOtpLoading(false);
        }
    }, [timer.minutes, timer.seconds, pendingUserId]);

    const handleGoBack = useCallback(() => {
        if (showOTP) {
            setShowOTP(false);
            setFormData(prev => ({ ...prev, otp: '' }));
            setIsTimerActive(false);
            setPendingUserId('');
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        } else {
            router.back();
        }
    }, [showOTP, router]);

    const handleSubmitOTP = useCallback(async () => {
        if (!formData.otp || formData.otp.length < 6) {
            Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code');
            return;
        }

        setOtpLoading(true);

        try {
            // Get user phone number for verification
            const profileResult = await authService.getUserProfile(pendingUserId);

            if (!profileResult.success || !profileResult.data?.phone_number) {
                Alert.alert('Error', 'Failed to verify OTP. Please try logging in again.');
                setOtpLoading(false);
                return;
            }

            // Verify OTP
            const verifyResult = await authService.verifyOTP(profileResult.data.phone_number, formData.otp);

            if (!verifyResult.success) {
                Alert.alert('Invalid OTP', verifyResult.error || 'The verification code is incorrect');
                setOtpLoading(false);
                return;
            }

            // Update user profile to mark phone as verified
            await authService.updateUserProfile(pendingUserId, {
                phone_verified: true,
                phone_verified_at: new Date().toISOString()
            });

            // Save biometric user ID if biometric was enabled during registration
            if (profileResult.data.user_biometric?.length > 0) {
                await AsyncStorage.setItem('biometricUserId', pendingUserId);
            }

            setOtpLoading(false);
            Alert.alert('Verification Successful', 'Welcome! You have been logged in successfully.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error) {
            setOtpLoading(false);
            Alert.alert('Verification Failed', 'An error occurred during verification. Please try again.');
            console.error('OTP verification error:', error);
        }
    }, [formData.otp, pendingUserId, router]);

    const handleForgotPassword = useCallback(() => {
        router.push('/auth/forgot-password' as never);
    }, [router]);

    const toggleRememberMe = useCallback(() => {
        setRememberMe(prev => !prev);
    }, []);

    interface CustomInputProps {
        placeholder: string;
        value: string;
        onChangeText: (text: string) => void;
        secureTextEntry?: boolean;
        keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
        inputRef?: React.RefObject<TextInput | null>;
        maxLength?: number;
        autoFocus?: boolean;
    }

    const CustomInput: React.FC<CustomInputProps> = React.memo(({
        placeholder,
        value,
        onChangeText,
        secureTextEntry = false,
        keyboardType = 'default',
        inputRef,
        maxLength,
        autoFocus = false
    }) => (
        <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor="#8C855F"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
            maxLength={maxLength}
            autoFocus={autoFocus}
            returnKeyType={keyboardType === 'numeric' ? 'done' : 'next'}
            blurOnSubmit={false}
            editable={!loading && !otpLoading}
        />
    ));

    // Memoize TimerDisplay to prevent unnecessary re-renders
    const TimerDisplay = useMemo(() => (
        <View style={styles.timerContainer}>
            <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{String(timer.minutes).padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Minutes</Text>
            </View>

            <Text style={styles.timerColon}>:</Text>

            <View style={styles.timerBox}>
                <Text style={styles.timerNumber}>{String(timer.seconds).padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Seconds</Text>
            </View>
        </View>
    ), [timer.minutes, timer.seconds]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Geometric background pattern */}
            <View style={styles.geometricPattern} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                        activeOpacity={0.7}
                        disabled={loading || otpLoading}
                    >
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{showOTP ? 'Verify Phone' : 'Welcome Back'}</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Welcome Message */}
                {!showOTP && (
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>
                            {isFirstTime ? 'Welcome!' : 'Welcome Back!'}
                        </Text>
                        <Text style={styles.welcomeSubtitle}>
                            {isFirstTime
                                ? 'Sign in to get started with your account'
                                : 'Sign in to continue where you left off'
                            }
                        </Text>
                    </View>
                )}

                {/* Login Form */}
                {!showOTP && (
                    <View style={styles.formSection}>
                        <CustomInput
                            placeholder="Email or Phone"
                            value={formData.emailOrPhone}
                            onChangeText={(value: string) => handleInputChange('emailOrPhone', value)}
                            keyboardType="email-address"
                        />

                        <CustomInput
                            placeholder="Password"
                            value={formData.password}
                            onChangeText={(value: string) => handleInputChange('password', value)}
                            secureTextEntry={true}
                        />

                        {/* Remember Me and Forgot Password */}
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={styles.rememberMeContainer}
                                onPress={toggleRememberMe}
                                activeOpacity={0.7}
                                disabled={loading}
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.rememberMeText}>Remember Me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleForgotPassword}
                                disabled={loading}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                            onPress={handleLogin}
                            activeOpacity={0.9}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Biometric Login */}
                        {biometricAvailable && (
                            <TouchableOpacity
                                style={styles.biometricButton}
                                onPress={handleBiometrics}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                <View style={styles.biometricIcon}>
                                    <Text style={styles.biometricEmoji}>👆</Text>
                                </View>
                                <Text style={styles.biometricButtonText}>Use Biometrics</Text>
                            </TouchableOpacity>
                        )}

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Google')}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Apple')}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* OTP Section */}
                {showOTP && (
                    <View style={styles.otpSection}>
                        <Text style={styles.otpTitle}>Verify Your Phone</Text>
                        <Text style={styles.otpSubtitle}>We sent a 6-digit code to your phone number</Text>

                        <CustomInput
                            placeholder="Enter OTP"
                            value={formData.otp}
                            onChangeText={(value: string) => handleInputChange('otp', value)}
                            keyboardType="numeric"
                            inputRef={otpInputRef}
                            maxLength={6}
                            autoFocus={true}
                        />

                        {TimerDisplay}

                        <TouchableOpacity
                            style={[
                                styles.resendButton,
                                ((timer.minutes > 0 || timer.seconds > 0) || otpLoading) && styles.resendButtonDisabled
                            ]}
                            onPress={handleResendOTP}
                            disabled={(timer.minutes > 0 || timer.seconds > 0) || otpLoading}
                            activeOpacity={0.7}
                        >
                            {otpLoading ? (
                                <ActivityIndicator color="#D4A574" size="small" />
                            ) : (
                                <Text style={[
                                    styles.resendButtonText,
                                    (timer.minutes > 0 || timer.seconds > 0) && styles.resendButtonTextDisabled
                                ]}>
                                    Resend OTP
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryButton, otpLoading && styles.primaryButtonDisabled]}
                            onPress={handleSubmitOTP}
                            activeOpacity={0.9}
                            disabled={otpLoading}
                        >
                            {otpLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

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
    welcomeSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#343A40',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formSection: {
        paddingHorizontal: 20,
        paddingTop: 30,
        gap: 20,
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
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#343A40',
        letterSpacing: -0.1,
    },
    otpSection: {
        paddingHorizontal: 20,
        paddingTop: 30,
        gap: 20,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#343A40',
        textAlign: 'center',
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        marginBottom: 20,
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingVertical: 20,
    },
    timerBox: {
        backgroundColor: '#F8F9FA',
        width: 80,
        height: 80,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    timerNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#343A40',
        letterSpacing: -0.5,
    },
    timerLabel: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
        marginTop: 5,
    },
    timerColon: {
        fontSize: 24,
        fontWeight: '700',
        color: '#343A40',
        marginBottom: 20,
    },
    resendButton: {
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    resendButtonDisabled: {
        opacity: 0.5,
    },
    resendButtonText: {
        fontSize: 16,
        color: '#D4A574',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    resendButtonTextDisabled: {
        color: '#8C855F',
    },
    bottomSpacer: {
        height: 50,
    },
    otpInput: {
        borderColor: '#F1F3F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: -10,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D4A574',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
        backgroundColor: '#D4A574',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    rememberMeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#343A40',
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#D4A574',
    },
    primaryButton: {
        backgroundColor: '#D4A574',
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#D4A574',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 8,
    },
    primaryButtonDisabled: {
        backgroundColor: '#B8B8B8',
        shadowOpacity: 0.1,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        height: 50,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    biometricIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    biometricEmoji: {
        fontSize: 18,
    },
    biometricButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#343A40',
        letterSpacing: -0.2,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E9ECEF',
    },
    dividerText: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    }
});


export default LoginScreen;
