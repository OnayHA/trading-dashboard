"""
WebSocket Manager for real-time updates
Handles broadcasting events to connected clients
"""
from fastapi import WebSocket
from typing import List, Dict
import json
import asyncio
from datetime import datetime


class WebSocketManager:
    """
    Manages WebSocket connections and broadcasts messages to clients.

    Usage:
        ws_manager = WebSocketManager()
        await ws_manager.connect(websocket)
        await ws_manager.broadcast("signal_detected", {...})
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message_type: str, payload: Dict):
        """
        Broadcast a message to all connected clients.

        Args:
            message_type: Type of message (e.g., "signal_detected", "position_update")
            payload: Message data
        """
        message = {
            "type": message_type,
            "payload": payload
        }

        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def send_to_client(self, websocket: WebSocket, message_type: str, payload: Dict):
        """
        Send a message to a specific client.

        Args:
            websocket: Target WebSocket connection
            message_type: Type of message
            payload: Message data
        """
        message = {
            "type": message_type,
            "payload": payload
        }
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending to client: {e}")
            self.disconnect(websocket)


# Global WebSocket manager instance
ws_manager = WebSocketManager()


# Helper functions to be called from trading system
async def notify_signal_detected(signal: Dict):
    """
    Notify all clients that a new signal was detected.

    TODO: Call this from your Signal Controller when a signal is found.

    Args:
        signal: Signal data dict with keys: id, timestamp, ticker, signal_type, direction, confidence
    """
    await ws_manager.broadcast("signal_detected", signal)


async def notify_position_update(position: Dict):
    """
    Notify all clients of a position price update.

    TODO: Call this from your Monitor when prices update.

    Args:
        position: Position data dict with keys: position_id, current_price, unrealized_pnl, delta
    """
    await ws_manager.broadcast("position_update", position)


async def notify_position_closed(position_id: str, pnl: float, reason: str):
    """
    Notify all clients that a position was closed.

    TODO: Call this from your Monitor when a position closes.

    Args:
        position_id: Position identifier
        pnl: Profit/Loss amount
        reason: Closing reason (TARGET_1, TARGET_2, STOP_LOSS, EOD, MANUAL)
    """
    await ws_manager.broadcast("position_closed", {
        "position_id": position_id,
        "pnl": pnl,
        "reason": reason
    })

    # Also send as notification
    await notify_notification(
        notification_type="position_closed",
        title="Posición Cerrada",
        message=f"Posición {position_id} cerrada con P&L: ${pnl:.2f} ({reason})"
    )


async def notify_system_status(status: Dict):
    """
    Notify all clients of system status update.

    TODO: Call this periodically (every 10 seconds) from your trading system.

    Args:
        status: System status dict
    """
    await ws_manager.broadcast("system_status", status)


async def notify_notification(notification_type: str, title: str, message: str):
    """
    Send a general notification to all clients.

    Args:
        notification_type: Type (signal, position_opened, position_closed, alert)
        title: Notification title
        message: Notification message
    """
    await ws_manager.broadcast("notification", {
        "id": f"notif_{datetime.utcnow().timestamp()}",
        "type": notification_type,
        "title": title,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    })
