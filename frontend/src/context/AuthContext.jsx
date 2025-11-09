/**
 * Authentication Context
 * Manages user authentication state and lock screen
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    if (token) {
      const savedUser = authService.getCurrentUser();
      setUser(savedUser);
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setToken(data.token);
    setUser({ username: data.username, email: data.email });
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setIsLocked(false);
  };

  const lock = () => {
    setIsLocked(true);
  };

  const unlock = async (password) => {
    if (!user) return false;

    const isValid = await authService.verifyPassword(user.username, password);
    if (isValid) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const value = {
    user,
    token,
    isLocked,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    lock,
    unlock,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
