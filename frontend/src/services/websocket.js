/**
 * WebSocket Service
 * Manages WebSocket connection for real-time updates
 */
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = {};
    this.reconnectTimeout = null;
    this.reconnectDelay = 5000; // 5 seconds
  }

  connect(url = 'ws://localhost:8000/ws') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        // Call all listeners for this event type
        if (this.listeners[type]) {
          this.listeners[type].forEach(callback => callback(payload));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('❌ WebSocket disconnected');

      // Attempt to reconnect
      this.reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.connect(url);
      }, this.reconnectDelay);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to an event type
   */
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  /**
   * Unsubscribe from an event type
   */
  off(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  /**
   * Send a message to the server
   */
  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket not connected');
    }
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;
