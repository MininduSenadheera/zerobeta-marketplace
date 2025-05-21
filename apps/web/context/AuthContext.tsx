import { useState, createContext, useEffect, useCallback } from 'react';
import { IUser } from '@/Helpers/Interfaces';
import axios from 'axios';
import config from '@/Helpers/config';

interface AuthContextProps {
  user: IUser | null;
  login: (token: string, loginUser: IUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: () => { },
  logout: () => { },
  isAuthenticated: false,
  isLoading: true,
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await validateToken();
      }
      setIsLoading(false);
    };

    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token: string, loginUser: IUser) => {
    localStorage.setItem('token', token);
    setUser(loginUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await axios.get(config.apiUrl + 'users/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setUser(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
      return false;
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}