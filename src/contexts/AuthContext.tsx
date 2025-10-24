import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginUser, logoutUser, storeAuthToken, removeAuthToken, getAuthToken, getUserProfile, type LoginRequest, type LoginResponse } from '../apis/user/api';
import { customToast } from '../utils/useCustomToast';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  departmentId?: number;
  companyId: number;
  isDelete: boolean;
  isActive: boolean;
  isRider?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // Fetch user profile to validate token and get current user data
          const response = await getUserProfile();
          if (!response.hasError && response.data) {
            setUser({
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              phone: response.data.phone,
              departmentId: response.data.departmentId ?? undefined,
              companyId: response.data.companyId,
              isDelete: response.data.isDelete,
              isActive: response.data.isActive,
              isRider: undefined,
              createdAt: response.data.createdAt,
              updatedAt: response.data.createdAt
            });
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            removeAuthToken();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to validate token:', error);
          // Token is invalid or expired, clear it
          removeAuthToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response: LoginResponse = await loginUser(credentials);
      
      console.log('Login response:', response); // Debug log
      
      if (!response.hasError && response.data) {
        // Store the access token (prefer accessToken over session.token)
        const token = response.data.accessToken || response.data.session?.token;
        if (token) {
          storeAuthToken(token);
        }
        
        // Set user data from response
        if (response.data.user) {
          setUser({
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            phone: response.data.user.phone,
            departmentId: response.data.user.departmentId ?? undefined,
            companyId: response.data.user.companyId,
            isDelete: response.data.user.isDelete,
            isActive: response.data.user.isActive,
            isRider: response.data.user.isRider ?? undefined,
            createdAt: response.data.user.createdAt,
            updatedAt: response.data.user.updatedAt
          });
        }
        
        setIsAuthenticated(true);
        customToast.success(response.message || 'Welcome back! You have successfully signed in.');
        return true;
      } else {
        customToast.error(response.message || 'Login failed. Please check your credentials.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle CORS errors specifically
      if (error instanceof TypeError && error.message.includes('CORS')) {
        customToast.error('CORS error: Unable to connect to the server. Please check your network connection.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
        customToast.error(errorMessage);
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call the logout API
      const response = await logoutUser();
      
      if (!response.hasError) {
        customToast.success(response.message || 'You have been logged out successfully.');
      } else {
        customToast.error(response.message || 'Logout failed, but you have been logged out locally.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      customToast.error('Logout failed, but you have been logged out locally.');
    } finally {
      // Always clear local state regardless of API response
      removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
