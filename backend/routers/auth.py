"""
Authentication Router
Handles login, password verification, and user management
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json
from pathlib import Path

from services.auth_service import verify_password, get_password_hash, create_access_token
from services.database import get_db_connection


router = APIRouter()


# Request/Response Models
class LoginRequest(BaseModel):
    username: str
    password: str


class VerifyPasswordRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str = None


class TokenResponse(BaseModel):
    token: str
    username: str
    email: str


# Endpoints
@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login endpoint - validates credentials and returns JWT token.

    Credentials:
    - username: admin
    - password: admin
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="User account is disabled")

    # Create JWT token
    token = create_access_token({"sub": user["username"]})

    return TokenResponse(
        token=token,
        username=user["username"],
        email=user["email"] or ""
    )


@router.post("/verify-password")
async def verify_password_endpoint(request: VerifyPasswordRequest):
    """
    Verify password for lock screen unlock.
    Does NOT invalidate the session - only checks password.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()

    if not user:
        return {"valid": False}

    is_valid = verify_password(request.password, user["password_hash"])

    return {"valid": is_valid}


@router.post("/register")
async def register(request: RegisterRequest):
    """
    Register a new user.

    TODO: Add admin-only restriction in production.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        # Create new user
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, created_at, is_active)
            VALUES (?, ?, ?, ?, ?)
        """, (
            request.username,
            request.email or f"{request.username}@trading.com",
            get_password_hash(request.password),
            datetime.utcnow().isoformat(),
            1
        ))

        conn.commit()

    return {"message": "User created successfully"}


@router.get("/profile")
async def get_profile(username: str):
    """
    Get user profile.

    TODO: Extract username from JWT token instead of query parameter.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user["username"],
        "email": user["email"],
        "created_at": user["created_at"]
    }
