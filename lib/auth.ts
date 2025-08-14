import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfileData {
    email: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    kycDocumentUri?: string;
    biometricEnabled: boolean;
    password: string;
}

export interface KYCUploadData {
    userId: string;
    documentUri: string;
    documentType: 'passport' | 'drivers_license' | 'national_id' | 'other';
}

class AuthService {
    // Sign up user using backend
    async signUpUser(userData: UserProfileData): Promise<{ success: boolean; error?: string; userId?: string }> {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phoneNumber,
                    bvn: '12345678901' // Default for demo
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Registration failed' };
            }

            if (data.success && data.data) {
                // Store the token
                await AsyncStorage.setItem('authToken', data.data.token);
                await AsyncStorage.setItem('userId', data.data.user.id);
                
                return { success: true, userId: data.data.user.id };
            } else {
                return { success: false, error: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    // Sign in user using backend
    async signInUser(emailOrPhone: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
        try {
            // Call backend login endpoint
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailOrPhone,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            if (data.success && data.data) {
                // Store the token
                await AsyncStorage.setItem('authToken', data.data.token);
                await AsyncStorage.setItem('userId', data.data.user.id);
                
                return { success: true, user: data.data.user };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    // Get user profile from backend
    async getUserProfile(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            
            if (!token) {
                return { success: false, error: 'No authentication token' };
            }

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/profile?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.message || 'Failed to get user profile' };
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    // Sign out user
    async signOut(): Promise<{ success: boolean; error?: string }> {
        try {
            // Clear local storage
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userProfile');
            
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    // Get current user from backend
    async getCurrentUser(): Promise<{ user: any | null; session: any | null }> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('userId');
            
            if (!token || !userId) {
                return { user: null, session: null };
            }

            // Verify token with backend
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    return { user: data.data.user, session: { access_token: token } };
                }
            }

            // If token is invalid, clear storage
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userId');
            return { user: null, session: null };
        } catch (error) {
            console.error('Error getting current user:', error);
            return { user: null, session: null };
        }
    }

    // Send OTP for verification
    async sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
        try {
            // In a real implementation, you'd integrate with an SMS service
            // For now, we'll simulate OTP sending
            console.log(`OTP sent to ${phone}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Verify OTP
    async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
        try {
            // In a real implementation, you'd verify the OTP
            // For demo purposes, accept any 6-digit code
            if (otp.length === 6) {
                return { success: true };
            } else {
                return { success: false, error: 'Invalid OTP' };
            }
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Enable biometric authentication
    async enableBiometric(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // In a real implementation, you'd integrate with biometric services
            console.log(`Biometric enabled for user ${userId}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Create default account
    async createDefaultAccount(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // In a real implementation, you'd call the backend to create an account
            console.log(`Default account created for user ${userId}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Upload KYC document
    async uploadKYCDocument(kycData: KYCUploadData): Promise<{ success: boolean; error?: string; documentUrl?: string }> {
        try {
            // In a real implementation, you'd upload to a file storage service
            console.log(`KYC document uploaded for user ${kycData.userId}`);
            return { success: true, documentUrl: 'https://example.com/document.pdf' };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }
}

export const authService = new AuthService();