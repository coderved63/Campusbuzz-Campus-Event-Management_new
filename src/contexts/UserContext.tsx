import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { IUser } from '@/types';

interface UserContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure axios interceptors for automatic token refresh
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't intercept refresh token requests to avoid infinite loops
        if (originalRequest.url?.includes('/api/refresh-token')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshResponse = await axios.post('/api/refresh-token');
            if (refreshResponse.data.success) {
              setUser(refreshResponse.data.data);
              // Retry the original request
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, log out the user
            console.log('Refresh token failed, logging out user');
            setUser(null);
            // Redirect to login page if needed
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await axios.post('/api/refresh-token');
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        // Clear localStorage if you're storing anything there
        localStorage.removeItem('user');
        // You might also want to clear cookies via an API call
        try {
          await axios.post('/api/logout');
        } catch (logoutError) {
          console.log('Logout API call failed, but continuing...');
        }
      }
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Login failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/register', { name, email, password });
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        return { success: true };
      }
      
      return { success: false, error: response.data.error || 'Registration failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in on app start
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/profile');
        if (isMounted && response.data.success && response.data.data) {
          setUser(response.data.data);
        } else if (isMounted) {
          // Try to refresh token if profile check fails
          const refreshed = await refreshAuth();
          if (!refreshed) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (isMounted) {
          // Try to refresh token on error
          const refreshed = await refreshAuth();
          if (!refreshed) {
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshAuth]);

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    refreshAuth
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
}