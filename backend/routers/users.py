"""
User Management Router
Admin-only endpoints for managing users
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import secrets
import string

from services.auth_service import get_password_hash
from services.database import get_auth_db_connection
from middleware.auth import get_current_user


router = APIRouter()


# Request/Response Models
class CreateUserRequest(BaseModel):
    username: str
    email: str
    phone: Optional[str] = None
    password: Optional[str] = None  # If None, generates temporary password
    role: str = "user"


class ResetPasswordRequest(BaseModel):
    new_password: Optional[str] = None  # If None, generates temporary password


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: str
    temp_password: Optional[str] = None  # Only returned when creating/resetting


def generate_temp_password(length=8):
    """Generate a random temporary password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def get_user_role(username: str) -> str:
    """Get user role from database"""
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(user).get("role", "user")


def require_admin(current_user: str = Depends(get_current_user)):
    """Dependency to require admin role"""
    role = get_user_role(current_user)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=List[UserResponse])
async def list_users(current_user: str = Depends(require_admin)):
    """
    List all users (admin only)
    """
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, phone, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
        """)
        users = cursor.fetchall()

    return [
        UserResponse(
            id=dict(user)["id"],
            username=dict(user)["username"],
            email=dict(user)["email"],
            phone=dict(user).get("phone"),
            role=dict(user).get("role", "user"),
            is_active=bool(dict(user)["is_active"]),
            created_at=dict(user)["created_at"]
        )
        for user in users
    ]


@router.post("/users/create", response_model=UserResponse)
async def create_user(request: CreateUserRequest, current_user: str = Depends(require_admin)):
    """
    Create a new user (admin only)
    Returns the temporary password if generated
    """
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()

        # Check if username exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")

        # Check if email exists
        cursor.execute("SELECT * FROM users WHERE email = ?", (request.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already exists")

        # Generate password if not provided
        temp_password = None
        if request.password:
            password = request.password
        else:
            password = generate_temp_password()
            temp_password = password  # Return this to admin

        # Create user
        password_hash = get_password_hash(password)
        cursor.execute("""
            INSERT INTO users (username, email, phone, password_hash, role, created_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            request.username,
            request.email,
            request.phone,
            password_hash,
            request.role,
            datetime.utcnow().isoformat(),
            1
        ))
        conn.commit()

        # Get created user
        cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()
        user_dict = dict(user)

    return UserResponse(
        id=user_dict["id"],
        username=user_dict["username"],
        email=user_dict["email"],
        phone=user_dict.get("phone"),
        role=user_dict.get("role", "user"),
        is_active=bool(user_dict["is_active"]),
        created_at=user_dict["created_at"],
        temp_password=temp_password
    )


@router.put("/users/{username}/reset-password", response_model=UserResponse)
async def reset_password(
    username: str,
    request: ResetPasswordRequest,
    current_user: str = Depends(require_admin)
):
    """
    Reset user password (admin only)
    Returns the temporary password if generated
    """
    with get_auth_db_connection() as conn:
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Generate password if not provided
        temp_password = None
        if request.new_password:
            password = request.new_password
        else:
            password = generate_temp_password()
            temp_password = password  # Return this to admin

        # Update password
        password_hash = get_password_hash(password)
        cursor.execute("""
            UPDATE users SET password_hash = ? WHERE username = ?
        """, (password_hash, username))
        conn.commit()

        # Get updated user
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        user_dict = dict(user)

    return UserResponse(
        id=user_dict["id"],
        username=user_dict["username"],
        email=user_dict["email"],
        phone=user_dict.get("phone"),
        role=user_dict.get("role", "user"),
        is_active=bool(user_dict["is_active"]),
        created_at=user_dict["created_at"],
        temp_password=temp_password
    )


@router.delete("/users/{username}")
async def delete_user(username: str, current_user: str = Depends(require_admin)):
    """
    Delete a user (admin only)
    Cannot delete yourself or the last admin
    """
    if username == current_user:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    with get_auth_db_connection() as conn:
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_dict = dict(user)

        # Check if trying to delete last admin
        if user_dict.get("role") == "admin":
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
            admin_count = cursor.fetchone()["count"]
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete the last admin user"
                )

        # Delete user
        cursor.execute("DELETE FROM users WHERE username = ?", (username,))
        conn.commit()

    return {"message": f"User {username} deleted successfully"}
