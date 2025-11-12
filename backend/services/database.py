"""
Database service for Trading Dashboard
Handles SQLite connections and queries
"""
import sqlite3
from pathlib import Path
from typing import List, Dict, Optional
from contextlib import contextmanager
from datetime import datetime

from config import settings


DATABASE_PATH = Path(settings.DATABASE_PATH)
AUTH_DATABASE_PATH = Path(settings.AUTH_DATABASE_PATH)


@contextmanager
def get_db_connection():
    """
    Context manager for SQLite database connection (trading data).

    Usage:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM trades")
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_auth_db_connection():
    """
    Context manager for authentication database connection.

    Usage:
        with get_auth_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users")
    """
    conn = sqlite3.connect(AUTH_DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
    finally:
        conn.close()


def init_database():
    """
    Initialize trading database with required tables.
    Creates tables only if they don't exist.
    """
    # Ensure directory exists
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Create system_config table (for dashboard settings)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                updated_at TEXT NOT NULL
            )
        """)

        # Insert default config values
        cursor.execute("""
            INSERT OR IGNORE INTO system_config (key, value, updated_at) VALUES
            ('live_trading_enabled', 'true', ?),
            ('hold_type', 'smart', ?),
            ('allocation_mode', 'per_ticker', ?)
        """, (datetime.utcnow().isoformat(), datetime.utcnow().isoformat(), datetime.utcnow().isoformat()))

        conn.commit()
        print("✅ Trading database tables initialized")


def init_auth_database():
    """
    Initialize authentication database with users table.
    Creates auth.db in separate location from trading data.
    """
    from services.auth_service import get_password_hash

    # Ensure directory exists
    AUTH_DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    with get_auth_db_connection() as conn:
        cursor = conn.cursor()

        # Create users table with role field
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                phone TEXT,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
                created_at TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1
            )
        """)

        # Create default admin user
        # Password: "admin" (change after first login!)
        admin_password_hash = get_password_hash("admin")
        cursor.execute("""
            INSERT OR IGNORE INTO users (username, email, password_hash, role, created_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "admin",
            "admin@trading.com",
            admin_password_hash,
            "admin",
            datetime.utcnow().isoformat(),
            1
        ))

        conn.commit()
        print("✅ Authentication database initialized")


# Query functions for trades (from existing trading system)
def get_trades_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    ticker: Optional[str] = None,
    strategy: Optional[str] = None,
    option_type: Optional[str] = None,
    min_pnl: Optional[float] = None,
    max_pnl: Optional[float] = None,
    limit: int = 100
) -> List[Dict]:
    """
    Get trades history with optional filters.

    TODO: Adjust based on actual trades table schema in your system.
    """
    with get_db_connection() as conn:
        query = "SELECT * FROM trades WHERE 1=1"
        params = []

        if start_date:
            query += " AND DATE(entry_time) >= ?"
            params.append(start_date)

        if end_date:
            query += " AND DATE(entry_time) <= ?"
            params.append(end_date)

        if ticker and ticker != 'all':
            query += " AND ticker = ?"
            params.append(ticker)

        if strategy and strategy != 'all':
            query += " AND strategy = ?"
            params.append(strategy)

        if option_type and option_type != 'all':
            query += " AND option_type = ?"
            params.append(option_type)

        if min_pnl is not None:
            query += " AND pnl >= ?"
            params.append(min_pnl)

        if max_pnl is not None:
            query += " AND pnl <= ?"
            params.append(max_pnl)

        query += " ORDER BY entry_time DESC LIMIT ?"
        params.append(limit)

        cursor = conn.cursor()

        try:
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.OperationalError:
            # Table doesn't exist yet, return empty
            return []


def get_recent_signals(limit: int = 10) -> List[Dict]:
    """
    Get recent trading signals.

    TODO: Adjust based on actual signals table schema.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            cursor.execute(
                "SELECT * FROM signals ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            )
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.OperationalError:
            # Table doesn't exist yet, return empty
            return []


def get_system_config(key: str) -> Optional[str]:
    """Get system configuration value by key."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_config WHERE key = ?", (key,))
        row = cursor.fetchone()
        return row["value"] if row else None


def set_system_config(key: str, value: str):
    """Set system configuration value."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO system_config (key, value, updated_at)
            VALUES (?, ?, ?)
        """, (key, value, datetime.utcnow().isoformat()))
        conn.commit()
