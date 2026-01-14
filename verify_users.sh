#!/bin/bash

# ============================================
# Verify Users Script
# Verifies database structure and allows adding users
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔍 Trading Dashboard - User Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$BACKEND_DIR"

# Check for conda environment
if command -v conda &> /dev/null; then
    eval "$(conda shell.bash hook)"
    conda activate ml-training 2>/dev/null || true
fi

# Menu
echo "Selecciona una opción:"
echo "1) Ver todos los usuarios"
echo "2) Añadir nuevo usuario"
echo "3) Verificar estructura de bases de datos"
echo ""
read -p "Opción: " option

case $option in
    1)
        echo ""
        echo -e "${BLUE}📋 Usuarios en auth.db:${NC}"
        python3 << 'EOF'
import sqlite3

try:
    conn = sqlite3.connect("data/auth/auth.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, phone, role, created_at FROM users")
    users = cursor.fetchall()

    if users:
        print(f"\n{'ID':<5} {'Username':<15} {'Email':<25} {'Phone':<15} {'Role':<10}")
        print("="*80)
        for user in users:
            phone = user['phone'] or '(no configurado)'
            print(f"{user['id']:<5} {user['username']:<15} {user['email']:<25} {phone:<15} {user['role']:<10}")
    else:
        print("No hay usuarios registrados")

    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
EOF
        ;;

    2)
        echo ""
        read -p "Nombre de usuario: " username
        read -p "Email: " email
        read -s -p "Contraseña: " password
        echo ""
        read -p "Teléfono (opcional): " phone
        read -p "Rol (admin/user) [user]: " role
        role=${role:-user}

        python3 << EOF
import sqlite3
from services.auth_service import get_password_hash
from datetime import datetime

try:
    conn = sqlite3.connect("data/auth/auth.db")
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE username = ?", ("$username",))
    if cursor.fetchone():
        print("❌ ERROR: El usuario '$username' ya existe")
    else:
        # Create user
        password_hash = get_password_hash("$password")
        cursor.execute("""
            INSERT INTO users (username, email, phone, password_hash, role, created_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "$username",
            "$email",
            "$phone" if "$phone" else None,
            password_hash,
            "$role",
            datetime.utcnow().isoformat(),
            1
        ))
        conn.commit()
        print(f"✅ Usuario '$username' creado exitosamente")
        print(f"   Email: $email")
        print(f"   Rol: $role")
        print(f"   Phone: $phone" if "$phone" else "   Phone: (no configurado)")

    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
EOF
        ;;

    3)
        echo ""
        echo -e "${BLUE}📋 Verificando estructura de bases de datos...${NC}"
        python3 << 'EOF'
import sqlite3
import os

print("\n" + "="*80)
print("AUTH.DB - Estructura")
print("="*80)

try:
    if os.path.exists("data/auth/auth.db"):
        conn = sqlite3.connect("data/auth/auth.db")
        cursor = conn.cursor()

        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()

        print(f"✅ auth.db existe")
        print(f"\nTablas encontradas:")
        for table in tables:
            print(f"  - {table[0]}")

            # Get columns for users table
            if table[0] == 'users':
                cursor.execute(f"PRAGMA table_info({table[0]})")
                columns = cursor.fetchall()
                print(f"\n    Columnas:")
                for col in columns:
                    print(f"      - {col[1]} ({col[2]})")

        conn.close()
    else:
        print("❌ auth.db NO existe")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*80)
print("TRADING.DB - Estructura")
print("="*80)

try:
    if os.path.exists("data/trades_data/trading.db"):
        conn = sqlite3.connect("data/trades_data/trading.db")
        cursor = conn.cursor()

        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()

        print(f"✅ trading.db existe")
        print(f"\nTablas encontradas:")
        for table in tables:
            print(f"  - {table[0]}")

        # Check if users table exists (it shouldn't!)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone():
            print(f"\n❌ ERROR: Tabla 'users' encontrada en trading.db")
            print(f"   Esta tabla NO debería existir aquí. Ejecuta ./reset_db.sh")
        else:
            print(f"\n✅ CORRECTO: Tabla 'users' NO existe en trading.db")

        conn.close()
    else:
        print("❌ trading.db NO existe")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*80)
EOF
        ;;

    *)
        echo "Opción no válida"
        exit 1
        ;;
esac

echo ""
