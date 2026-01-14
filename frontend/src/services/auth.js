/**
 * Authentication Service
 * Handles login, logout, and password verification
 */
import api from './api';

export const authService = {
  /**
   * Login with username and password
   */
  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    const { token, ...user } = response.data;

    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  /**
   * Verify password for lock screen unlock
   */
  async verifyPassword(username, password) {
    const response = await api.post('/auth/verify-password', { username, password });
    return response.data.valid;
  },

  /**
   * Logout - clear local storage
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
