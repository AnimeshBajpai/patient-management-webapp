import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'patient';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    // In a real app, this would make an API call to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'doctor@example.com' && password === 'password') {
          setUser({
            id: '1',
            email: 'doctor@example.com',
            name: 'Dr. Smith',
            role: 'doctor',
          });
          resolve(true);
        } else if (email === 'patient@example.com' && password === 'password') {
          setUser({
            id: '2',
            email: 'patient@example.com',
            name: 'John Doe',
            role: 'patient',
          });
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
