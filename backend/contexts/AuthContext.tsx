import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiClient, tokenManager, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    bvn: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  // Debug user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
    console.log('🔐 Authentication state changed:', isAuthenticated);
  }, [user, isAuthenticated]);

  const checkAuthenticationStatus = async () => {
    try {
      setIsLoading(true);
      const hasToken = await tokenManager.isAuthenticated();
      
      if (hasToken) {
        // Try to get user profile
        await refreshUserProfile();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      // Clear invalid token
      await tokenManager.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      // Get the stored token to extract user ID
      const token = await tokenManager.getToken();
      if (!token) {
        throw new Error('No token available');
      }

      // Decode the JWT token to get user ID (simple base64 decode for demo)
      // In production, you'd use a proper JWT library
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;
        
        if (!userId) {
          throw new Error('Invalid token format');
        }

        console.log('Token decoded, userId:', userId);

        // Get user profile with the user ID
        const response = await apiClient.get(`/auth/profile?userId=${userId}`);
        console.log('Profile response:', response);
        
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Failed to get user profile');
        }
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        // Don't throw here, just log the error
        console.log('Continuing without token refresh...');
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // Don't clear the token on every error, just log it
      console.log('User profile refresh failed, but keeping existing user data');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔐 Login attempt for:', email);
      
      const response = await apiClient.login(email, password);
      console.log('🔐 Login response:', response);
      
      if (response.success && response.data) {
        const { user: userData, token, refreshToken } = response.data;
        console.log('🔐 User data received:', userData);
        console.log('🔐 Token received:', token ? 'Yes' : 'No');
        
        // Save token
        await tokenManager.saveToken(token);
        console.log('🔐 Token saved to storage');
        
        // Set user data
        setUser(userData);
        setIsAuthenticated(true);
        console.log('🔐 User state updated, isAuthenticated:', true);
        
        return true;
      } else {
        console.log('🔐 Login failed:', response.message);
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    bvn: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        const { user: newUser, token, refreshToken } = response.data;
        
        // Save token
        await tokenManager.saveToken(token);
        
        // Set user data
        setUser(newUser);
        setIsAuthenticated(true);
        
        Alert.alert('Registration Successful', 'Welcome! Your account has been created successfully.');
        return true;
      } else {
        Alert.alert('Registration Failed', response.message || 'Failed to create account');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'An error occurred during registration. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API
      await apiClient.logout();
      
      // Clear local data
      await tokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
      
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      await tokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiClient.updateUserProfile(profileData);
      
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        Alert.alert('Update Failed', response.message || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Update Failed', 'An error occurred while updating your profile.');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserProfile,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
