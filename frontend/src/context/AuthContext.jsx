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
    // Validate token with backend on mount
    const validateToken = async () => {
      if (token) {
        try {
          // Try to get user profile - this validates the token
          const savedUser = authService.getCurrentUser();
          if (savedUser && savedUser.username) {
            // Verify token is still valid by making an API call
            const response = await fetch(`http://localhost:8000/auth/profile?username=${savedUser.username}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              // Token is valid
              setUser(savedUser);
            } else {
              // Token is invalid - logout
              console.warn('Token inválido, cerrando sesión...');
              authService.logout();
              setToken(null);
              setUser(null);
            }
          } else {
            // No user data - logout
            authService.logout();
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          // Error validating token - logout
          console.error('Error validando token:', error);
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setToken(data.token);
    setUser({ username: data.username, email: data.email, role: data.role });
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

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
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
    updateUser,
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
