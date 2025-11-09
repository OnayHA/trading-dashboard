/**
 * Header Component
 * Top navigation bar with market status, system info, and user controls
 */
import React, { useState, useEffect } from 'react';
import { Lock, Bell, User, Activity, Database, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useMarketStatus } from '../../../hooks/useMarketStatus';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';
import api from '../../../services/api';

export function Header() {
  const { user, lock } = useAuth();
  const marketStatus = useMarketStatus();
  const [systemStatus, setSystemStatus] = useState(null);

  // Ctrl+L to lock screen
  useKeyboardShortcut('l', () => lock(), { ctrl: true });

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${getMarketStatusColor()}`} />
            <span className="text-sm font-medium text-gray-700">
              Mercado: {marketStatus.state === 'open' ? 'Abierto' : 'Cerrado'}
            </span>
            {marketStatus.timeUntil && (
              <span className="text-xs text-gray-500">
                ({marketStatus.timeUntil})
              </span>
            )}
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
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{user?.username}</span>
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
    </header>
  );
}
