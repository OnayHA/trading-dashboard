"""
System Router
Handles system status, kill switch, and health monitoring
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

from services.mock_data import MOCK_SYSTEM_STATUS
from services.database import get_system_config, set_system_config


router = APIRouter()


# Request/Response Models
class KillSwitchRequest(BaseModel):
    enabled: bool


class SystemStatus(BaseModel):
    overall: str
    signal_controller: str
    trading_controller: str
    monitor: str
    ib_api: str
    database: str
    live_trading: bool
    last_heartbeat: str


# Endpoints
@router.get("/status", response_model=SystemStatus)
async def get_system_status():
    """
    Get overall system status.

    TODO: Connect to actual trading system modules:
    - Signal Controller status
    - Trading Controller status
    - Monitor status
    - IB API connection status
    - Database connection status

    For now: Returns mock data
    """
    # Update heartbeat timestamp
    status = MOCK_SYSTEM_STATUS.copy()
    status["last_heartbeat"] = datetime.utcnow().isoformat()

    # Get live_trading status from database
    live_trading = get_system_config("live_trading_enabled")
    status["live_trading"] = live_trading == "true" if live_trading else True

    return SystemStatus(**status)


@router.post("/kill-switch")
async def toggle_kill_switch(request: KillSwitchRequest):
    """
    Toggle live trading on/off (Kill Switch).

    When disabled:
    - System continues to generate signals
    - NO orders are executed
    - Existing positions continue to be monitored

    TODO: Connect to actual Trading Controller to enable/disable order execution.
    """
    # Save to database
    set_system_config("live_trading_enabled", "true" if request.enabled else "false")

    # TODO: Call trading_controller.set_live_trading(request.enabled)

    return {
        "live_trading_enabled": request.enabled,
        "message": "Trading en vivo activado" if request.enabled else "Trading pausado - solo señales"
    }


@router.get("/heartbeat")
async def heartbeat():
    """
    Simple heartbeat endpoint for health checks.
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }
