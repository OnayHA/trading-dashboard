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
from services.database import get_auth_db_connection


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
    role: str = "user"  # Default to 'user' role


class UpdateProfileRequest(BaseModel):
    current_username: str
    new_username: str = None
    new_password: str = None
    email: str = None
    phone: str = None


class TokenResponse(BaseModel):
    token: str
    username: str
    email: str
    role: str = "user"


# Endpoints
@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login endpoint - validates credentials and returns JWT token.

    Credentials:
    - username: admin
    - password: admin
    """
    with get_auth_db_connection() as conn:
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
        email=user["email"] or "",
        role=user.get("role", "user")
    )


@router.post("/verify-password")
async def verify_password_endpoint(request: VerifyPasswordRequest):
    """
    Verify password for lock screen unlock.
    Does NOT invalidate the session - only checks password.
    """
    with get_auth_db_connection() as conn:
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
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        # Create new user
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role, created_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            request.username,
            request.email or f"{request.username}@trading.com",
            get_password_hash(request.password),
            request.role,
            datetime.utcnow().isoformat(),
            1
        ))

        conn.commit()

    return {
        "message": "User created successfully",
        "username": request.username,
        "role": request.role
    }


@router.get("/profile")
async def get_profile(username: str):
    """
    Get user profile.

    TODO: Extract username from JWT token instead of query parameter.
    """
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user["username"],
        "email": user["email"],
        "phone": user.get("phone"),
        "role": user.get("role", "user"),
        "created_at": user["created_at"]
    }


@router.put("/profile")
async def update_profile(request: UpdateProfileRequest):
    """
    Update user profile (username, password, phone).
    Returns new token if username changed.
    """
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()

        # Verify user exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.current_username,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if new username already exists (if changing username)
        if request.new_username and request.new_username != request.current_username:
            cursor.execute("SELECT * FROM users WHERE username = ?", (request.new_username,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Username already exists")

        # Build update query dynamically
        updates = []
        params = []

        if request.new_username:
            updates.append("username = ?")
            params.append(request.new_username)

        if request.new_password:
            updates.append("password_hash = ?")
            params.append(get_password_hash(request.new_password))

        if request.email is not None:  # Allow changing email
            updates.append("email = ?")
            params.append(request.email)

        if request.phone is not None:  # Allow empty string to clear phone
            updates.append("phone = ?")
            params.append(request.phone)

        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        # Add current username to params for WHERE clause
        params.append(request.current_username)

        # Execute update
        query = f"UPDATE users SET {', '.join(updates)} WHERE username = ?"
        cursor.execute(query, params)
        conn.commit()

        # Get updated user
        final_username = request.new_username if request.new_username else request.current_username
        cursor.execute("SELECT * FROM users WHERE username = ?", (final_username,))
        updated_user = cursor.fetchone()

        # If username changed, create new token
        new_token = None
        if request.new_username:
            new_token = create_access_token({"sub": final_username})

        return {
            "message": "Profile updated successfully",
            "username": updated_user["username"],
            "email": updated_user["email"],
            "phone": updated_user.get("phone"),
            "role": updated_user.get("role", "user"),
            "token": new_token  # Only present if username changed
        }
