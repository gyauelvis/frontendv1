import { supabase } from '@/lib/supabase';
import { KycStatus, UserBase } from '@/types/types';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

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
    async signUpUser(userData: UserProfileData): Promise<{ success: boolean; error?: string; userId?: string }> {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password || '',
                options: {
                    data: {
                        phone_number: userData.phoneNumber,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                    }
                }
            });

            if (authError) {
                return { success: false, error: authError.message };
            }

            if (!authData.user) {
                return { success: false, error: 'User creation failed' };
            }


            const data: UserBase = {
                id: authData.user.id,
                email: userData.email,
                phone_number: userData.phoneNumber,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
                date_of_birth: null,
                kyc_status: KycStatus.PENDING,
                kyc_verified_at: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            }
            const { error: profileError } = await supabase
                .schema('public')
                .from('users')
                .insert(data);

            if (profileError) {
                try {
                    await supabase.auth.admin.deleteUser(authData.user.id);
                } catch (cleanupError) {
                    console.error('Failed to cleanup auth user:', cleanupError);
                }
                return { success: false, error: profileError.message };
            }
            if (userData.biometricEnabled) {
                const biometricResult = await this.enableBiometric(authData.user.id);
                if (!biometricResult.success) {
                    console.warn('Biometric setup failed:', biometricResult.error);
                    // Don't fail the entire signup for biometric issues
                }
            }

            // 6. Create default account
            const accountResult = await this.createDefaultAccount(authData.user.id);
            if (!accountResult.success) {
                console.warn('Default account creation failed:', accountResult.error);
                // Don't fail the entire signup for account creation issues
            }

            return { success: true, userId: authData.user.id };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Alternative approach: Wait for session with explicit retry logic
    private async waitForSession(maxRetries: number = 5, retryDelay: number = 1000): Promise<boolean> {
        for (let i = 0; i < maxRetries; i++) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                return true;
            }

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return false;
    }

    // Sign in user
    async signInUser(emailOrPhone: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
        try {
            // Determine if input is email or phone
            const isEmail = emailOrPhone.includes('@');

            let email = emailOrPhone;

            // If it's a phone number, get the email from your users table
            if (!isEmail) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('email')
                    .eq('phone_number', emailOrPhone)
                    .single();

                if (userError || !userData) {
                    return { success: false, error: 'User not found' };
                }

                email = userData.email;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // Update last login time
            if (data.user) {
                await supabase
                    .from('users')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', data.user.id);
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Upload KYC document
    async uploadKYCDocument(data: KYCUploadData): Promise<{ success: boolean; error?: string; publicUrl?: string }> {
        try {
            // Read the file
            const fileInfo = await FileSystem.getInfoAsync(data.documentUri);
            if (!fileInfo.exists) {
                return { success: false, error: 'File does not exist' };
            }

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(data.documentUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to array buffer
            const arrayBuffer = decode(base64);

            // Generate unique filename
            const fileExtension = data.documentUri.split('.').pop() || 'jpg';
            const fileName = `kyc_documents/${data.userId}/${Date.now()}.${fileExtension}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('kyc-documents')
                .upload(fileName, arrayBuffer, {
                    contentType: `image/${fileExtension}`,
                    upsert: false
                });

            if (uploadError) {
                return { success: false, error: uploadError.message };
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('kyc-documents')
                .getPublicUrl(fileName);

            // Update user profile with KYC info
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    kyc_status: 'PENDING',
                    kyc_verified_at: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.userId);

            if (updateError) {
                return { success: false, error: updateError.message };
            }

            return { success: true, publicUrl: urlData.publicUrl };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Enable biometric authentication
    async enableBiometric(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Check if biometric record already exists
            const { data: existingBiometric } = await supabase
                .from('user_biometric')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (existingBiometric) {
                // Update existing record
                const { error } = await supabase
                    .from('user_biometric')
                    .update({
                        last_used_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId);

                if (error) {
                    return { success: false, error: error.message };
                }
            } else {
                // Create new biometric record
                const { error } = await supabase
                    .from('user_biometric')
                    .insert({
                        user_id: userId,
                        credential_id: `bio_${userId}_${Date.now()}`,
                        public_key: 'placeholder_key', // In real implementation, store actual biometric data
                        device_name: 'Mobile Device',
                    });

                if (error) {
                    return { success: false, error: error.message };
                }
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Create default account for new user
    async createDefaultAccount(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const accountNumber = `ACC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            const { error } = await supabase
                .from('accounts')
                .insert({
                    user_id: userId,
                    account_number: accountNumber,
                    balance: 0.00,
                    available_balance: 0.00,
                    currency: 'USD',
                    account_type: 'PERSONAL',
                    status: 'ACTIVE',
                });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Get user profile data
    async getUserProfile(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select(`
          *,
          accounts(*),
          user_biometric(*),
          user_mfa(*)
        `)
                .eq('id', userId)
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Update user profile
    async updateUserProfile(userId: string, updates: Partial<any>): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Sign out user
    async signOut(): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    // Check if user session is valid
    async getCurrentUser(): Promise<{ user: any | null; session: any | null }> {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        return { user, session };
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
}

export const authService = new AuthService();