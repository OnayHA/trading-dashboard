/**
 * Notifications Panel
 * Displays trading signals, system alerts, and other notifications
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, TrendingUp, TrendingDown, AlertTriangle, Info, Clock } from 'lucide-react';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'signal',
    title: 'Señal Alcista Detectada',
    message: 'AAPL - Call Δ0.45 DTE 7 - $245 strike',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
    tradingDisabled: true,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Trading Desactivado',
    message: 'Oportunidad perdida: TSLA señal alcista detectada pero trading está desactivado',
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
    tradingDisabled: true,
  },
  {
    id: 3,
    type: 'signal',
    title: 'Señal Bajista Detectada',
    message: 'SPY - Put Δ-0.40 DTE 5 - $450 strike',
    timestamp: new Date(Date.now() - 30 * 60000),
    read: true,
    tradingDisabled: false,
  },
  {
    id: 4,
    type: 'info',
    title: 'Sistema Conectado',
    message: 'Conexión con el sistema de trading establecida correctamente',
    timestamp: new Date(Date.now() - 60 * 60000),
    read: true,
    tradingDisabled: false,
  },
  {
    id: 5,
    type: 'signal',
    title: 'Señal Alcista Detectada',
    message: 'NVDA - Call Δ0.52 DTE 10 - $850 strike',
    timestamp: new Date(Date.now() - 90 * 60000),
    read: true,
    tradingDisabled: true,
  },
];

export function NotificationsPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // seconds

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return `Hace ${Math.floor(diff / 86400)}d`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'signal':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Marcar todas
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell className="w-12 h-12 mb-3" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(notification.timestamp)}</span>
                      </div>
                      {notification.tradingDisabled && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                          Trading OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Las señales se mostrarán aquí cuando se detecten oportunidades
        </p>
      </div>
    </div>
  );
}
