/**
 * useWebSocket Hook
 * Provides WebSocket connection and event handling
 */
import { useEffect, useState } from 'react';
import wsService from '../services/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    wsService.connect();

    // Update connection status
    const checkConnection = setInterval(() => {
      setIsConnected(wsService.ws?.readyState === WebSocket.OPEN);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      // Note: We don't disconnect on unmount to keep connection alive
    };
  }, []);

  const on = (type, callback) => {
    wsService.on(type, callback);
  };

  const off = (type, callback) => {
    wsService.off(type, callback);
  };

  const send = (type, payload) => {
    wsService.send(type, payload);
  };

  return {
    isConnected,
    on,
    off,
    send,
  };
}
