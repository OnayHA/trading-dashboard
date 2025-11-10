/**
 * Header Component
 * Top navigation bar with market status, system info, and user controls
 */
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Bell, User, Activity, Database, Zap, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useMarketStatus } from '../../../hooks/useMarketStatus';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';
import { UserProfileModal } from '../../shared/UserProfileModal/UserProfileModal';
import { NotificationsPanel } from '../../shared/NotificationsPanel/NotificationsPanel';
import api from '../../../services/api';

export function Header() {
  const { user, lock, logout, updateUser } = useAuth();
  const marketStatus = useMarketStatus();
  const [systemStatus, setSystemStatus] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Ctrl+L to lock screen
  useKeyboardShortcut('l', () => lock(), { ctrl: true });

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const loadSystemStatus = async () => {
    try {
      const response = await api.get('/api/system/status');
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const getMarketStatusColor = () => {
    if (marketStatus.state === 'open') return 'bg-green-500';
    if (marketStatus.state === 'premarket') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status) => {
    if (status === 'active' || status === 'connected' || status === 'operational') return 'text-green-600';
    if (status === 'degraded') return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleProfileUpdate = (updatedUser) => {
    if (updateUser) {
      updateUser(updatedUser);
    }
    setProfileModalOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Market Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Trading Dashboard</h1>
          </div>

          {/* Market Status */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full ${getMarketStatusColor()} animate-pulse`} />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {marketStatus.timeUntil || 'Cargando...'}
              </span>
              {marketStatus.countdown && (
                <span className="text-xs font-mono font-semibold text-blue-600">
                  {marketStatus.countdown}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: System Status */}
        <div className="flex items-center gap-4">
          {systemStatus && (
            <>
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${getStatusColor(systemStatus.signal_controller)}`} />
                <span className="text-xs text-gray-600">Signals</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${getStatusColor(systemStatus.trading_controller)}`} />
                <span className="text-xs text-gray-600">Trading</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${getStatusColor(systemStatus.database)}`} />
                <span className="text-xs text-gray-600">DB</span>
              </div>
            </>
          )}
        </div>

        {/* Right: User Controls */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Notifications Panel */}
            <NotificationsPanel
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setProfileModalOpen(true);
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Lock Button */}
          <button
            onClick={lock}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Bloquear pantalla (Ctrl+L)"
          >
            <Lock className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Ctrl+L</span>
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={user}
        onUpdate={handleProfileUpdate}
      />
    </header>
  );
}
