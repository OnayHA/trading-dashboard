"""
Manual Trading Router
Handles manual trade execution
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random

from services.websocket import notify_notification


router = APIRouter()


# Request/Response Models
class ManualTradeRequest(BaseModel):
    ticker: str
    type: str  # call, put, stock
    strike: Optional[float] = None
    delta: Optional[float] = None
    dte: Optional[int] = None
    contracts: int
    hold_type: str  # intraday, multi_day, until_targets
    max_hold_days: Optional[int] = None
    monitor_enabled: bool = True
    target_1_pct: Optional[float] = None
    target_2_pct: Optional[float] = None
    stop_loss_pct: Optional[float] = None
    partial_close_t1: Optional[float] = None
    trailing_stop_enabled: bool = False


class ManualTradeResponse(BaseModel):
    position_id: str
    message: str
    entry_price: float
    cost: float


# Endpoints
@router.post("/execute", response_model=ManualTradeResponse)
async def execute_manual_trade(request: ManualTradeRequest):
    """
    Execute a manual trade (option or stock).

    This endpoint:
    1. Validates the request
    2. Finds optimal strike (for options) based on delta
    3. Executes order via Trading Controller
    4. Activates monitor if enabled
    5. Records in database
    6. Notifies via WebSocket

    TODO: Connect to actual Trading Controller:
    - trading_controller.execute_manual_order(...)
    - Validate available capital
    - Find strike based on delta
    - Execute via IB API
    - Activate Monitor module
    """
    # Mock implementation
    # Simulate entry price and cost
    if request.type == "stock":
        entry_price = random.uniform(100, 500)
        cost = entry_price * request.contracts
    else:
        entry_price = random.uniform(1.5, 5.0)
        cost = entry_price * request.contracts * 100  # Options are per 100 shares

    position_id = f"{request.ticker}_{request.strike or 'STOCK'}_{request.type.upper()}_{datetime.now().strftime('%Y%m%d')}_MANUAL"

    # TODO: Actual execution logic
    # result = await trading_controller.execute_manual_order(
    #     ticker=request.ticker,
    #     option_type=request.type,
    #     strike=request.strike,
    #     contracts=request.contracts,
    #     monitor_config={
    #         "target_1": request.target_1_pct,
    #         "target_2": request.target_2_pct,
    #         "stop_loss": request.stop_loss_pct
    #     }
    # )

    # Send notification
    await notify_notification(
        notification_type="position_opened",
        title="Operación Manual Ejecutada",
        message=f"{request.ticker} {request.type.upper()} - {request.contracts} contratos @ ${entry_price:.2f}"
    )

    return ManualTradeResponse(
        position_id=position_id,
        message="Orden ejecutada exitosamente",
        entry_price=round(entry_price, 2),
        cost=round(cost, 2)
    )


@router.post("/close-all")
async def close_all_manual_trades():
    """
    Close ALL manual trades.

    TODO: Identify manual positions and send close orders.
    """
    # Mock implementation
    return {
        "message": "Cerrando todas las operaciones manuales...",
        "positions_affected": 0  # Replace with actual count
    }
