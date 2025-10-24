import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  loginUser,
  logoutUser,
  storeAuthToken,
  removeAuthToken,
  getAuthToken,
  getUserProfile,
  type LoginRequest,
  type LoginResponse,
} from '../apis/user/api';
import { customToast } from '../utils/useCustomToast';

// ----------------- Interfaces -----------------
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
  updatedAt?: string; // ✅ optional now
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

// ----------------- Provider -----------------
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load token + user from localStorage on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('user');
        }
      }

      // Try refreshing user data from API
      if (token) {
        try {
          const response = await getUserProfile();
          if (!response.hasError && response.data) {
            const freshUser: User = {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              phone: response.data.phone,
              departmentId: response.data.departmentId ?? undefined,
              companyId: response.data.companyId,
              isDelete: response.data.isDelete,
              isActive: response.data.isActive,
              isRider: response.data.isRider ?? undefined,
              createdAt: response.data.createdAt,
              updatedAt: response.data.updatedAt,
            };

            setUser(freshUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(freshUser)); // ✅ Sync latest user
          } else {
            // Invalid token → clear data
            removeAuthToken();
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to validate token:', error);
          removeAuthToken();
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // ✅ Login Function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response: LoginResponse = await loginUser(credentials);
      console.log('Login response:', response);

      if (!response.hasError && response.data) {
        const token = response.data.accessToken || response.data.session?.token;
        if (token) {
          storeAuthToken(token);
        }

        if (response.data.user) {
          const loggedUser: User = {
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
            updatedAt: response.data.user.updatedAt,
          };

          setUser(loggedUser);
          localStorage.setItem('user', JSON.stringify(loggedUser)); // ✅ Store user persistently
        }

        setIsAuthenticated(true);
        customToast.success(
          response.message || 'Welcome back! You have successfully signed in.'
        );
        return true;
      } else {
        customToast.error(
          response.message || 'Login failed. Please check your credentials.'
        );
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      customToast.error(errorMessage);
      return false;
    }
  };

  // ✅ Logout Function
  const logout = async () => {
    try {
      const response = await logoutUser();
      if (!response.hasError) {
        customToast.success(
          response.message || 'You have been logged out successfully.'
        );
      } else {
        customToast.error(
          response.message || 'Logout failed, but logged out locally.'
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
      customToast.error('Logout failed, but logged out locally.');
    } finally {
      removeAuthToken();
      localStorage.removeItem('user'); // ✅ Clear user data
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // ----------------- Context Value -----------------
  const value: AuthContextType = {
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
