"""
Trades Router
Handles trade history, lifecycle, and export
"""
from fastapi import APIRouter, Response
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import csv
from io import StringIO

from services.database import get_trades_history
from services.mock_data import MOCK_TRADES, get_mock_trade_lifecycle


router = APIRouter()


# Request/Response Models
class Trade(BaseModel):
    id: int
    signal_id: Optional[int]
    entry_time: str
    exit_time: Optional[str]
    ticker: str
    strike: Optional[float]
    option_type: str
    contracts: int
    entry_price: float
    exit_price: Optional[float]
    pnl: float
    delta: Optional[float]
    strategy: str
    days_held: int


class TradeLifecycleEvent(BaseModel):
    id: int
    trade_id: int
    event_type: str
    timestamp: str
    details: Optional[str]
    pnl: Optional[float]
    reason: Optional[str]


# Endpoints
@router.get("/history", response_model=List[Trade])
async def get_trade_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    ticker: Optional[str] = "all",
    strategy: Optional[str] = "all",
    type: Optional[str] = "all",
    status: Optional[str] = "closed",
    min_pnl: Optional[float] = None,
    max_pnl: Optional[float] = None
):
    """
    Get trade history with optional filters.

    Query Parameters:
    - start_date: Filter by entry date (YYYY-MM-DD)
    - end_date: Filter by entry date (YYYY-MM-DD)
    - ticker: Filter by ticker symbol (or "all")
    - strategy: Filter by strategy (or "all")
    - type: Filter by option type (call, put, stock, or "all")
    - status: Filter by status (open, closed, or "all")
    - min_pnl: Minimum P&L filter
    - max_pnl: Maximum P&L filter

    TODO: Replace with actual database query when SQLite is connected.
    """
    # Try to get from database first
    trades = get_trades_history(
        start_date=start_date,
        end_date=end_date,
        ticker=ticker,
        strategy=strategy,
        option_type=type,
        min_pnl=min_pnl,
        max_pnl=max_pnl
    )

    # If no trades from database, use mock data
    if not trades:
        trades = MOCK_TRADES

    return trades


@router.get("/export")
async def export_trades_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    ticker: Optional[str] = "all",
    strategy: Optional[str] = "all"
):
    """
    Export trades to CSV file.

    Uses same filters as /history endpoint.

    TODO: Implement CSV generation with pandas for cleaner output.
    """
    # Get trades with filters
    trades = get_trades_history(
        start_date=start_date,
        end_date=end_date,
        ticker=ticker,
        strategy=strategy
    )

    if not trades:
        trades = MOCK_TRADES

    # Generate CSV
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id', 'entry_time', 'exit_time', 'ticker', 'option_type', 'strike',
        'contracts', 'entry_price', 'exit_price', 'pnl', 'delta', 'strategy', 'days_held'
    ])

    writer.writeheader()
    for trade in trades:
        writer.writerow(trade)

    # Prepare response
    csv_content = output.getvalue()
    filename = f"trades_{start_date or 'all'}_{end_date or 'all'}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/{trade_id}/lifecycle", response_model=List[TradeLifecycleEvent])
async def get_trade_lifecycle(trade_id: int):
    """
    Get the complete lifecycle of a trade.

    Returns all events from signal detection to final close:
    - SIGNAL: Signal detected
    - ALLOCATED: Capital allocated
    - EXECUTED: Order executed
    - PARTIAL_CLOSE: Partial close (target hit)
    - FULL_CLOSE: Final close

    TODO: Read from trade_lifecycle table when created.
    """
    # Mock implementation
    lifecycle = get_mock_trade_lifecycle(trade_id)

    return lifecycle
