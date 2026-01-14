"""
Configuration Router
Handles global config, ticker limits, strategies, and risk parameters
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from services.database import get_system_config, set_system_config
from services.mock_data import (
    MOCK_GLOBAL_CONFIG,
    MOCK_TICKER_LIMITS,
    MOCK_STRATEGIES,
    MOCK_RISK_PARAMETERS
)


router = APIRouter()


# Request/Response Models
class GlobalConfig(BaseModel):
    live_trading_enabled: bool
    hold_type: str  # intraday, multi_day, smart
    allocation_mode: str  # per_ticker, fixed, percentage


class TickerLimit(BaseModel):
    symbol: str
    enabled: bool
    max_allocation: float
    max_positions: int
    open_positions: int


class TickerConfigUpdate(BaseModel):
    enabled: Optional[bool] = None
    max_allocation: Optional[float] = None
    max_positions: Optional[int] = None


class Strategy(BaseModel):
    id: str
    name: str
    enabled: bool
    priority: int
    hold_type: str
    max_hold_days: int
    target_1_pct: float
    target_2_pct: float
    stop_loss_pct: float
    partial_close_t1: float
    trailing_stop_trigger: Optional[float]


class RiskParameters(BaseModel):
    delta_min: float
    delta_max: float
    dte_min: int
    dte_max: int
    max_daily_loss: float
    max_open_trades: int


# Endpoints
@router.get("/global", response_model=GlobalConfig)
async def get_global_config():
    """
    Get global system configuration.

    TODO: Read from system_config table.
    """
    # Get from database
    live_trading = get_system_config("live_trading_enabled")
    hold_type = get_system_config("hold_type")
    allocation_mode = get_system_config("allocation_mode")

    return GlobalConfig(
        live_trading_enabled=live_trading == "true" if live_trading else True,
        hold_type=hold_type or "smart",
        allocation_mode=allocation_mode or "per_ticker"
    )


@router.put("/global")
async def update_global_config(config: GlobalConfig):
    """
    Update global system configuration.

    TODO: Apply changes to trading system.
    """
    # Save to database
    set_system_config("live_trading_enabled", "true" if config.live_trading_enabled else "false")
    set_system_config("hold_type", config.hold_type)
    set_system_config("allocation_mode", config.allocation_mode)

    # TODO: Notify trading system of config changes

    return {"message": "Configuration updated successfully"}


@router.get("/tickers", response_model=List[TickerLimit])
async def get_ticker_limits():
    """
    Get configuration for all tickers.

    TODO: Create ticker_config table and read from it.
    TODO: Get real-time open_positions count.
    """
    return MOCK_TICKER_LIMITS


@router.put("/tickers/{symbol}")
async def update_ticker_config(symbol: str, config: TickerConfigUpdate):
    """
    Update configuration for a specific ticker.

    TODO: Save to ticker_config table.
    TODO: Apply changes to trading system.
    """
    # Mock implementation
    return {"message": f"Ticker {symbol} configuration updated"}


@router.get("/strategies", response_model=List[Strategy])
async def get_strategies():
    """
    Get all trading strategies and their configurations.

    TODO: Create strategy_config table and read from it.
    """
    return MOCK_STRATEGIES


@router.put("/strategies/{strategy_id}")
async def update_strategy(strategy_id: str, strategy: Strategy):
    """
    Update a strategy configuration.

    TODO: Save to strategy_config table.
    TODO: Apply changes to Signal Controller.
    """
    # Mock implementation
    return {"message": f"Strategy {strategy_id} updated"}


@router.get("/risk-parameters", response_model=RiskParameters)
async def get_risk_parameters():
    """
    Get global risk parameters.

    TODO: Read from system_config or dedicated risk_config table.
    """
    return MOCK_RISK_PARAMETERS


@router.put("/risk-parameters")
async def update_risk_parameters(params: RiskParameters):
    """
    Update global risk parameters.

    TODO: Save to database.
    TODO: Apply limits to trading system.
    """
    # Mock implementation
    return {"message": "Risk parameters updated"}
