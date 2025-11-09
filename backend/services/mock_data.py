"""
Mock data for development and testing
Provides realistic sample data for the dashboard
"""
from datetime import datetime, timedelta
from typing import List, Dict
import random


# Mock Active Positions
MOCK_ACTIVE_POSITIONS = [
    {
        "id": "SPY_580C_20251109",
        "ticker": "SPY",
        "option_type": "CALL",
        "strike": 580.0,
        "contracts": 10,
        "entry_time": (datetime.now() - timedelta(days=2, hours=3)).isoformat(),
        "entry_price": 3.20,
        "current_price": 4.15,
        "unrealized_pnl": 950.00,
        "delta": 0.42,
        "signal_type": "ELITE_2",
        "strategy": "gaps",
        "hold_type": "multi_day",
        "days_held": 2,
        "status": "OPEN"
    },
    {
        "id": "QQQ_495P_20251109",
        "ticker": "QQQ",
        "option_type": "PUT",
        "strike": 495.0,
        "contracts": 5,
        "entry_time": datetime.now().replace(hour=10, minute=15).isoformat(),
        "entry_price": 2.80,
        "current_price": 2.65,
        "unrealized_pnl": -75.00,
        "delta": -0.30,
        "signal_type": "ELITE_1",
        "strategy": "patterns",
        "hold_type": "intraday",
        "days_held": 0,
        "status": "OPEN"
    },
    {
        "id": "NVDA_148C_20251109",
        "ticker": "NVDA",
        "option_type": "CALL",
        "strike": 148.0,
        "contracts": 8,
        "entry_time": (datetime.now() - timedelta(days=1, hours=5)).isoformat(),
        "entry_price": 4.50,
        "current_price": 5.20,
        "unrealized_pnl": 560.00,
        "delta": 0.38,
        "signal_type": "ELITE_2",
        "strategy": "gaps",
        "hold_type": "multi_day",
        "days_held": 1,
        "status": "OPEN"
    }
]


# Mock System Status
MOCK_SYSTEM_STATUS = {
    "overall": "operational",
    "signal_controller": "active",
    "trading_controller": "active",
    "monitor": "active",
    "ib_api": "connected",
    "database": "connected",
    "live_trading": True,
    "last_heartbeat": datetime.utcnow().isoformat()
}


# Mock Trade History
MOCK_TRADES = [
    {
        "id": 1,
        "signal_id": 123,
        "entry_time": "2025-11-08T09:35:00",
        "exit_time": "2025-11-08T15:45:00",
        "ticker": "SPY",
        "strike": 580.0,
        "option_type": "CALL",
        "contracts": 10,
        "entry_price": 3.20,
        "exit_price": 4.50,
        "pnl": 650.00,
        "delta": 0.35,
        "strategy": "gaps",
        "days_held": 0
    },
    {
        "id": 2,
        "signal_id": 124,
        "entry_time": "2025-11-07T10:15:00",
        "exit_time": "2025-11-08T14:20:00",
        "ticker": "NVDA",
        "strike": 148.0,
        "option_type": "CALL",
        "contracts": 15,
        "entry_price": 1.95,
        "exit_price": 2.40,
        "pnl": 450.00,
        "delta": 0.40,
        "strategy": "patterns",
        "days_held": 1
    },
    {
        "id": 3,
        "signal_id": 125,
        "entry_time": "2025-11-06T09:45:00",
        "exit_time": "2025-11-06T15:30:00",
        "ticker": "QQQ",
        "strike": 495.0,
        "option_type": "PUT",
        "contracts": 8,
        "entry_price": 2.90,
        "exit_price": 2.50,
        "pnl": -320.00,
        "delta": -0.32,
        "strategy": "gaps",
        "days_held": 0
    },
    {
        "id": 4,
        "signal_id": 126,
        "entry_time": "2025-11-05T11:20:00",
        "exit_time": "2025-11-07T14:10:00",
        "ticker": "TSLA",
        "strike": 245.0,
        "option_type": "CALL",
        "contracts": 12,
        "entry_price": 3.80,
        "exit_price": 5.10,
        "pnl": 780.00,
        "delta": 0.37,
        "strategy": "patterns",
        "days_held": 2
    }
]


# Mock Recent Signals
MOCK_SIGNALS = [
    {
        "id": "sig_001",
        "timestamp": datetime.now().replace(hour=14, minute=35).isoformat(),
        "ticker": "SPY",
        "signal_type": "ELITE_2",
        "direction": "CALL",
        "confidence": 0.87,
        "status": "pending"
    },
    {
        "id": "sig_002",
        "timestamp": datetime.now().replace(hour=13, minute=20).isoformat(),
        "ticker": "QQQ",
        "signal_type": "ELITE_1",
        "direction": "PUT",
        "confidence": 0.75,
        "status": "executed"
    },
    {
        "id": "sig_003",
        "timestamp": datetime.now().replace(hour=11, minute=45).isoformat(),
        "ticker": "NVDA",
        "signal_type": "NORMAL_1",
        "direction": "CALL",
        "confidence": 0.62,
        "status": "filtered"
    }
]


# Mock Global Config
MOCK_GLOBAL_CONFIG = {
    "live_trading_enabled": True,
    "hold_type": "smart",
    "allocation_mode": "per_ticker"
}


# Mock Ticker Limits
MOCK_TICKER_LIMITS = [
    {
        "symbol": "SPY",
        "enabled": True,
        "max_allocation": 5000,
        "max_positions": 5,
        "open_positions": 2
    },
    {
        "symbol": "QQQ",
        "enabled": True,
        "max_allocation": 4000,
        "max_positions": 5,
        "open_positions": 1
    },
    {
        "symbol": "NVDA",
        "enabled": True,
        "max_allocation": 3000,
        "max_positions": 3,
        "open_positions": 1
    },
    {
        "symbol": "TSLA",
        "enabled": False,
        "max_allocation": 2000,
        "max_positions": 3,
        "open_positions": 0
    },
    {
        "symbol": "AAPL",
        "enabled": True,
        "max_allocation": 4500,
        "max_positions": 5,
        "open_positions": 0
    }
]


# Mock Strategies
MOCK_STRATEGIES = [
    {
        "id": "gaps",
        "name": "Gap Strategy",
        "enabled": True,
        "priority": 1,
        "hold_type": "multi_day",
        "max_hold_days": 3,
        "target_1_pct": 20,
        "target_2_pct": 40,
        "stop_loss_pct": 15,
        "partial_close_t1": 25,
        "trailing_stop_trigger": 40
    },
    {
        "id": "patterns",
        "name": "Pattern Finder",
        "enabled": True,
        "priority": 2,
        "hold_type": "intraday",
        "max_hold_days": 0,
        "target_1_pct": 15,
        "target_2_pct": 25,
        "stop_loss_pct": 12,
        "partial_close_t1": 50,
        "trailing_stop_trigger": None
    }
]


# Mock Risk Parameters
MOCK_RISK_PARAMETERS = {
    "delta_min": 0.25,
    "delta_max": 0.45,
    "dte_min": 3,
    "dte_max": 14,
    "max_daily_loss": 1000,
    "max_open_trades": 15
}


def get_mock_trade_lifecycle(trade_id: int) -> List[Dict]:
    """Generate mock lifecycle events for a trade."""
    base_time = datetime.now() - timedelta(hours=6)

    return [
        {
            "id": 1,
            "trade_id": trade_id,
            "event_type": "SIGNAL",
            "timestamp": base_time.isoformat(),
            "details": '{"signal_type": "ELITE_2", "confidence": 0.87}',
            "pnl": None,
            "reason": None
        },
        {
            "id": 2,
            "trade_id": trade_id,
            "event_type": "ALLOCATED",
            "timestamp": (base_time + timedelta(minutes=2)).isoformat(),
            "details": '{"amount": 3200, "contracts": 10}',
            "pnl": None,
            "reason": None
        },
        {
            "id": 3,
            "trade_id": trade_id,
            "event_type": "EXECUTED",
            "timestamp": (base_time + timedelta(minutes=5)).isoformat(),
            "details": '{"price": 3.20, "fill": "complete"}',
            "pnl": None,
            "reason": None
        },
        {
            "id": 4,
            "trade_id": trade_id,
            "event_type": "PARTIAL_CLOSE",
            "timestamp": (base_time + timedelta(hours=4)).isoformat(),
            "details": '{"percentage": 50, "price": 4.00}',
            "pnl": 400.00,
            "reason": "TARGET_1"
        },
        {
            "id": 5,
            "trade_id": trade_id,
            "event_type": "FULL_CLOSE",
            "timestamp": (base_time + timedelta(hours=6)).isoformat(),
            "details": '{"percentage": 50, "price": 4.50}',
            "pnl": 250.00,
            "reason": "TARGET_2"
        }
    ]
