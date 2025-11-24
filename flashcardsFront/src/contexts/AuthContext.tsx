import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string; email_verification_sent?: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) => Promise<any>;
  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => Promise<any>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getToken();
      
      // If no token exists, mark as not loading and not authenticated
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }
  
      // Token exists, try to fetch user data
      try {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // API returned unsuccessful response - clear auth
          apiService.clearAuth();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        
        // Only clear auth token on authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication failed - clearing token');
          apiService.clearAuth();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } else {
          // For network errors or other issues, keep the token but mark as not loading
          // This prevents logout on temporary network issues
          console.log('Network or server error - keeping token');
          setAuthState({
            user: null,
            isAuthenticated: true, // Keep authenticated state
            isLoading: false,
            error: null,
          });
        }
      }
    };
  
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: response.message }));
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { 
          success: true, 
          email_verification_sent: response.data.email_verification_sent || false 
        };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: response.message }));
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const resetPassword = useCallback(async (data: { token: string; email: string; password: string; password_confirmation: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiService.resetPassword(data);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Reset password failed' };
    }
  }, []);

  const changePassword = useCallback(async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
    try {
      const response = await apiService.changePassword(data);
      return response;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'فشل في تغيير كلمة المرور' };
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    try {
      const response = await apiService.resendVerificationEmail();
      return response.success 
        ? { success: true } 
        : { success: false, error: response.message };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'فشل في إرسال رابط التحقق' };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (apiService.isAuthenticated()) {
      try {
        const response = await apiService.getCurrentUser();
        if (response.success) {
          setAuthState(prev => ({ 
            ...prev, 
            user: response.data,
            isAuthenticated: true,
            error: null 
          }));
        }
      } catch (error: any) {
        console.error('Failed to refresh user data:', error);
        // Only clear on auth errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          apiService.clearAuth();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    clearError,
    resetPassword,
    changePassword,
    resendVerificationEmail,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};