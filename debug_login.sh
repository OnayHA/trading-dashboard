#!/bin/bash

# ============================================
# Debug Login Script
# Tests login for a specific user
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

cd "$BACKEND_DIR"

# Check for conda environment
if command -v conda &> /dev/null; then
    eval "$(conda shell.bash hook)"
    conda activate ml-training 2>/dev/null || true
fi

read -p "Username: " username
read -s -p "Password: " password
echo ""

python3 << EOF
import sqlite3
from services.auth_service import verify_password

try:
    conn = sqlite3.connect("data/auth/auth.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get user
    cursor.execute("SELECT * FROM users WHERE username = ?", ("$username",))
    user = cursor.fetchone()

    if not user:
        print(f"❌ Usuario '$username' NO existe en la base de datos")
    else:
        print(f"\n✅ Usuario encontrado:")
        print(f"   ID: {user['id']}")
        print(f"   Username: {user['username']}")
        print(f"   Email: {user['email']}")
        print(f"   Phone: {user['phone'] or '(no configurado)'}")
        print(f"   Role: {user['role']}")
        print(f"   Active: {user['is_active']}")
        print(f"   Password Hash: {user['password_hash'][:50]}...")

        # Test password
        print(f"\n🔑 Verificando contraseña...")
        is_valid = verify_password("$password", user['password_hash'])

        if is_valid:
            print("✅ Contraseña CORRECTA")
        else:
            print("❌ Contraseña INCORRECTA")

    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
EOF
