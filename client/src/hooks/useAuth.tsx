import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthUser, AuthAdmin } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [admin, setAdmin] = useState<AuthAdmin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType') as 'user' | 'admin' | null;
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('admin');

    if (storedToken && storedUserType) {
      setToken(storedToken);
      setUserType(storedUserType);
      
      if (storedUserType === 'user' && storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedUserType === 'admin' && storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: any, type: 'user' | 'admin') => {
    try {
      const endpoint = type === 'user' ? '/api/auth/login' : '/api/admin/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        cache: 'no-cache', // Prevent caching issues
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      
      // Validate token exists
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      // Update state first
      setToken(data.token);
      setUserType(type);
      
      if (type === 'user') {
        setUser(data.user);
        setAdmin(null);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('admin');
      } else {
        setAdmin(data.admin);
        setUser(null);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.removeItem('user');
      }
      
      // Store in localStorage after state update
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', type);
      
      // Verify token is stored correctly
      const storedToken = localStorage.getItem('token');
      if (storedToken !== data.token) {
        console.warn('Token storage verification failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    
    // Force page reload to prevent router errors
    window.location.href = '/';
  };

  const refreshUser = async () => {
    if (token && userType === 'user') {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-cache',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else if (response.status === 401) {
          // Token is invalid, logout user
          logout();
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const validateToken = async () => {
    if (!token) return false;
    
    try {
      const endpoint = userType === 'user' ? '/api/user/profile' : '/api/admin/dashboard/stats';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-cache',
      });
      
      if (response.status === 401) {
        // Token is invalid, logout
        logout();
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        token,
        login,
        logout,
        refreshUser,
        validateToken,
        isLoading,
        userType,
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