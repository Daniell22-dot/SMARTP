'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StoredUser, UserRole, getToken, getUser, setToken, setUser, clearToken, isAuthenticated } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  portalLogin: (accessKey: string, password: string, portal: 'admin' | 'landlord') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!getToken()) {
      setUserState(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await apiClient.get<User>('/auth/me');
      const storedUser: StoredUser = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role: userData.role,
        profile_picture: userData.profile_picture,
      };
      setUser(storedUser);
      setUserState(storedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      clearToken();
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setToken(data.access_token);
    await refreshUser();
  };

  const portalLogin = async (accessKey: string, password: string, portal: 'admin' | 'landlord') => {
    const response = await apiClient.post<{ access_token: string }>('/auth/portal-login', {
      access_key: accessKey,
      password,
      portal,
    });

    setToken(response.access_token);
    await refreshUser();
  };

  const register = async (data: any) => {
    const response = await apiClient.post<{ access_token: string }>('/auth/register', data);
    setToken(response.access_token);
    await refreshUser();
  };

  const logout = () => {
    clearToken();
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        portalLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}