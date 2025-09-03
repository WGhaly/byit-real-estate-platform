'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginForm, ApiResponse } from '@/types';
import { api } from './api';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<boolean>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get<ApiResponse<User>>('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        Cookies.remove('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginForm): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, accessToken } = response.data;
        Cookies.set('token', accessToken, { expires: 7 }); // 7 days
        setUser(user);
        toast.success('Login successful');
        return true;
      } else {
        toast.error(response.data.error || 'Login failed');
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'An error occurred during login';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
