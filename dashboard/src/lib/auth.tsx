'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthenticatedUser, TokenSet } from './auth/types';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  // Enhanced with Microsoft auth data
  microsoftUser?: AuthenticatedUser;
  tenantId?: string;
  tenantName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Legacy login method (deprecated in favor of Microsoft auth)
  login: (email: string, password: string) => Promise<void>;
  // New Microsoft authentication methods
  loginWithMicrosoft: (microsoftUser: AuthenticatedUser, tokens: TokenSet) => void;
  logout: () => void;
  // Token management
  getAccessToken: () => string | null;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenSet | null>(null);

  useEffect(() => {
    // Check for existing Microsoft authentication session
    const checkAuth = async () => {
      try {
        // Check for stored tokens and user data
        const storedTokens = localStorage.getItem('demoforge_tokens');
        const storedUser = localStorage.getItem('demoforge_user');
        
        if (storedTokens && storedUser) {
          const tokenData: TokenSet = JSON.parse(storedTokens);
          const userData: User = JSON.parse(storedUser);
          
          // Check if tokens are still valid
          if (tokenData.expiresAt > Date.now()) {
            setTokens(tokenData);
            setUser(userData);
            console.log('✅ Restored authentication session for:', userData.name);
          } else {
            // Tokens expired, try to refresh
            console.log('🔄 Tokens expired, attempting refresh...');
            // TODO: Implement token refresh logic
            clearStoredAuth();
          }
        } else {
          console.log('📝 No stored authentication found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearStoredAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearStoredAuth = () => {
    localStorage.removeItem('demoforge_tokens');
    localStorage.removeItem('demoforge_user');
    setTokens(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Legacy login - deprecated in favor of Microsoft auth
      console.warn('⚠️ Using deprecated login method. Use Microsoft authentication instead.');
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Demo User',
        role: 'admin'
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = (microsoftUser: AuthenticatedUser, tokenSet: TokenSet) => {
    console.log('🚀 Setting up Microsoft authentication session...');
    
    // Convert Microsoft user to internal user format
    const internalUser: User = {
      id: microsoftUser.id,
      email: microsoftUser.userPrincipalName,
      name: microsoftUser.displayName,
      role: 'admin', // TODO: Map from Microsoft roles
      microsoftUser,
      tenantId: microsoftUser.tenant.tenantId,
      tenantName: microsoftUser.tenant.displayName,
    };

    // Store tokens and user data
    localStorage.setItem('demoforge_tokens', JSON.stringify(tokenSet));
    localStorage.setItem('demoforge_user', JSON.stringify(internalUser));
    
    setTokens(tokenSet);
    setUser(internalUser);
    
    console.log('✅ Microsoft authentication session established');
    console.log(`👤 User: ${internalUser.name} (${internalUser.email})`);
    console.log(`🏢 Tenant: ${internalUser.tenantName} (${internalUser.tenantId})`);
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    clearStoredAuth();
    // TODO: Revoke Microsoft tokens if needed
    // TODO: Redirect to sign-in page
  };

  const getAccessToken = (): string | null => {
    if (!tokens || tokens.expiresAt <= Date.now()) {
      console.warn('⚠️ No valid access token available');
      return null;
    }
    return tokens.accessToken;
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) {
      console.warn('⚠️ No refresh token available');
      return false;
    }

    try {
      // TODO: Implement token refresh with Microsoft
      console.log('🔄 Token refresh not yet implemented');
      return false;
    } catch (error) {
      console.error('🚨 Token refresh failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithMicrosoft,
    logout,
    getAccessToken,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}