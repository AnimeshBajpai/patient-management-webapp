import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authService } from '../services/api';
import { AclUser, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  rawUserData: AclUser | null;
  requestOtp: (mobile: string, isoCode: string, userType?: string) => Promise<{ success: boolean; message?: string }>;
  validateOtp: (mobile: string, isoCode: string, otp: string, userType?: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (mobile: string, isoCode: string, userType?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to transform AclUser to UserProfile
const transformToUserProfile = (aclUser: AclUser): UserProfile => {
  const firstName = aclUser.firstName || '';
  const lastName = aclUser.lastName || '';
  const displayName = `${firstName} ${lastName}`.trim() || 'User';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  
  return {
    id: aclUser.uuid,
    uuid: aclUser.uuid,
    firstName,
    lastName,
    email: aclUser.email,
    mobile: aclUser.mobile,
    userType: aclUser.userType,
    department: aclUser.department,
    gender: aclUser.gender,
    nationality: aclUser.nationality,
    mobileVerified: aclUser.mobileVerified,
    emailVerified: aclUser.emailVerified,
    status: aclUser.status,
    role: aclUser.userType.toLowerCase() as 'doctor' | 'patient' | 'admin',
    displayName,
    initials,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rawUserData, setRawUserData] = useState<AclUser | null>(null);
  const [loading, setLoading] = useState(false);

  const requestOtp = async (mobile: string, isoCode: string, userType: string = 'PATIENT'): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await authService.requestOtp(mobile, isoCode, userType);
      setLoading(false);
      return { 
        success: response.success, 
        message: response.message || (response.success ? 'OTP sent successfully' : 'Failed to send OTP')
      };
    } catch (error: any) {
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to send OTP'
      };
    }
  };

  const validateOtp = async (mobile: string, isoCode: string, otp: string, userType: string = 'PATIENT'): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await authService.validateOtp(mobile, isoCode, otp, userType);
      
      if (response.success && response.data) {
        // Store auth token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        // Set user data from AclUserDto response
        if (response.data.user || response.data) {
          const aclUserData = (response.data.user || response.data) as AclUser;
          setRawUserData(aclUserData);
          setUser(transformToUserProfile(aclUserData));
        } else {
          // Fallback user creation for development
          const fallbackAclUser: AclUser = {
            uuid: Date.now().toString(),
            mobile: mobile,
            firstName: 'User',
            lastName: '',
            userType: userType as 'DOCTOR' | 'PATIENT' | 'ADMIN',
            isoCode: isoCode,
            mobileVerified: true,
            emailVerified: false,
            status: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setRawUserData(fallbackAclUser);
          setUser(transformToUserProfile(fallbackAclUser));
        }
        
        setLoading(false);
        return { 
          success: true, 
          message: response.message || 'Login successful'
        };
      } else {
        setLoading(false);
        return { 
          success: false, 
          message: response.message || 'Invalid OTP. Please try again.'
        };
      }
    } catch (error: any) {
      setLoading(false);
      // Handle HTTP errors without triggering global redirect
      if (error.response?.status >= 400 && error.response?.status < 500) {
        // Client errors (400-499) - these are validation errors, not auth failures
        return { 
          success: false, 
          message: error.response?.data?.message || 'Invalid OTP. Please check and try again.'
        };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Network error. Please try again.'
      };
    }
  };

  const resendOtp = async (mobile: string, isoCode: string, userType: string = 'PATIENT'): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const response = await authService.resendOtp(mobile, isoCode, userType);
      setLoading(false);
      return { 
        success: response.success, 
        message: response.message || (response.success ? 'OTP resent successfully' : 'Failed to resend OTP')
      };
    } catch (error: any) {
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to resend OTP'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setRawUserData(null);
    authService.logout();
  };

  const value = {
    user,
    rawUserData,
    requestOtp,
    validateOtp,
    resendOtp,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
