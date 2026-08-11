'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, LoginDto } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { tokenManager } from '../services/token-manager';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginDto) => Promise<AuthUser>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'lis_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage if token is still present
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const hasToken = !!tokenManager.getToken();

      if (storedUser && hasToken) {
        const parsed = JSON.parse(storedUser) as AuthUser;
        // Basic sanity check – backend gives us 'id', not 'userId'
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setUser(parsed);
        } else {
          // Stored data is stale/malformed — clear it
          localStorage.removeItem(USER_KEY);
          tokenManager.removeToken();
        }
      } else {
        // No token or no user — ensure both are cleared
        localStorage.removeItem(USER_KEY);
        tokenManager.removeToken();
      }
    } catch {
      localStorage.removeItem(USER_KEY);
      tokenManager.removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginDto): Promise<AuthUser> => {
    // authService.login handles token storage via tokenManager
    const data = await authService.login(credentials);
    const authUser = data.user;
    setUser(authUser);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    return authUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
