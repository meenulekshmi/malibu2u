'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultValue: AuthContextType = {
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user session on client mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultValue;
}
