"""
Positions Router
Handles active positions and closing operations
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from services.mock_data import MOCK_ACTIVE_POSITIONS


router = APIRouter()


# Request/Response Models
class Position(BaseModel):
    id: str
    ticker: str
    option_type: str
    strike: Optional[float]
    contracts: int
    entry_time: str
    entry_price: float
    current_price: float
    unrealized_pnl: float
    delta: Optional[float]
    signal_type: Optional[str]
    strategy: str
    hold_type: str
    days_held: int
    status: str


class ClosePositionRequest(BaseModel):
    percentage: int = 100  # 100 = close all, 50 = close half, etc.


# Endpoints
@router.get("/active", response_model=List[Position])
async def get_active_positions():
    """
    Get all currently active positions.

    TODO: Read from one of these sources:
    1. SQLite active_positions table (when created)
    2. Monitor module directly
    3. IB API for real-time positions

    For now: Returns mock data
    """
    return MOCK_ACTIVE_POSITIONS


@router.post("/close/{position_id}")
async def close_position(position_id: str, request: ClosePositionRequest):
    """
    Close a position (partially or completely).

    Args:
        position_id: Position identifier
        request: Close request with percentage (100 = full close)

    TODO: Send close order to Trading Controller:
    - Validate position exists
    - Calculate contracts to close
    - Send market order to IB API
    - Update database
    - Notify via WebSocket
    """
    # Mock implementation
    return {
        "position_id": position_id,
        "percentage_closed": request.percentage,
        "message": f"Orden de cierre enviada para {request.percentage}% de la posición"
    }


@router.post("/close-all")
async def close_all_positions():
    """
    EMERGENCY: Close ALL open positions immediately.

    This is a critical operation that should:
    1. Send market orders for all positions
    2. Log the emergency shutdown
    3. Notify all connected clients
    4. Optionally disable live trading

    TODO: Connect to Trading Controller emergency shutdown.

    ⚠️ WARNING: This action is irreversible!
    """
    # Mock implementation
    positions_count = len(MOCK_ACTIVE_POSITIONS)

    # TODO: Call trading_controller.emergency_close_all()

    return {
        "message": "Cerrando todas las posiciones...",
        "positions_affected": positions_count
    }
