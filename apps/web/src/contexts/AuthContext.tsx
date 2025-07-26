import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, CreateUserDto, LoginDto } from '@campo360/lib';
import { authService } from '@/services/authService';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: CreateUserDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar si hay un token guardado al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('campo360_token');
      
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          // Token inválido o expirado
          Cookies.remove('campo360_token');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    try {
      const authResponse: AuthResponse = await authService.login(credentials);
      
      // Guardar token en cookies
      Cookies.set('campo360_token', authResponse.token, {
        expires: 7, // 7 días
        secure: import.meta.env.PROD,
        sameSite: 'strict',
      });
      
      setUser(authResponse.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: CreateUserDto) => {
    try {
      const authResponse: AuthResponse = await authService.register(userData);
      
      // Guardar token en cookies
      Cookies.set('campo360_token', authResponse.token, {
        expires: 7, // 7 días
        secure: import.meta.env.PROD,
        sameSite: 'strict',
      });
      
      setUser(authResponse.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('campo360_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
