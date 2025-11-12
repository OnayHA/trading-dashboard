#!/bin/bash

# ============================================
# Reset Database Script
# Deletes and recreates BOTH databases
# - auth.db (users/authentication)
# - trading.db (trading data)
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
TRADING_DB="$BACKEND_DIR/data/trades_data/trading.db"
AUTH_DB="$BACKEND_DIR/data/auth/auth.db"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔄 Reset Trading Dashboard Databases${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if any database exists
DB_EXISTS=false
if [ -f "$TRADING_DB" ] || [ -f "$AUTH_DB" ]; then
    DB_EXISTS=true
fi

if [ "$DB_EXISTS" = true ]; then
    echo -e "${YELLOW}⚠${NC}  Bases de datos encontradas:"
    [ -f "$TRADING_DB" ] && echo "    - $TRADING_DB"
    [ -f "$AUTH_DB" ] && echo "    - $AUTH_DB"
    echo -e "${RED}   Esta operación eliminará TODOS los datos.${NC}"
    echo ""
    read -p "¿Estás seguro? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}✓${NC} Operación cancelada"
        exit 0
    fi

    echo -e "${BLUE}▶${NC} Eliminando bases de datos antiguas..."
    rm -f "$TRADING_DB"
    rm -f "$AUTH_DB"
    echo -e "${GREEN}✓${NC} Bases de datos eliminadas"
else
    echo -e "${BLUE}ℹ${NC}  No se encontraron bases de datos existentes"
fi

# Initialize databases
echo -e "${BLUE}▶${NC} Creando nuevas bases de datos..."
cd "$BACKEND_DIR"

# Check for conda environment
if command -v conda &> /dev/null; then
    echo -e "${BLUE}▶${NC} Activando entorno conda (ml-training)..."
    eval "$(conda shell.bash hook)"
    conda activate ml-training 2>/dev/null || echo "⚠️  Usando entorno base"
fi

python3 << 'EOF'
from services.database import init_database, init_auth_database
from services.auth_service import verify_password
import sqlite3

print("\n🔄 Inicializando bases de datos...")

# Initialize auth database first
init_auth_database()

# Initialize trading database
init_database()

# Verify admin user in auth.db
print("\n📋 Verificando usuario admin en auth.db...")
conn = sqlite3.connect("data/auth/auth.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT username, email, phone, role FROM users WHERE username = 'admin'")
user = cursor.fetchone()

if user:
    print(f"\n✅ Usuario admin creado en auth.db:")
    print(f"   Username: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Phone: {user['phone'] or '(no configurado)'}")
    print(f"   Role: {user['role']}")
    print(f"   Password: admin")
else:
    print("❌ ERROR: Usuario admin no encontrado en auth.db")

conn.close()

# Verify trading.db does NOT have users table
print("\n📋 Verificando trading.db...")
conn = sqlite3.connect("data/trades_data/trading.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
users_table = cursor.fetchone()

if users_table:
    print("❌ ERROR: Tabla 'users' encontrada en trading.db (NO DEBERÍA EXISTIR)")
else:
    print("✅ Correcto: trading.db NO tiene tabla 'users' (solo en auth.db)")

conn.close()

EOF

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Bases de datos reiniciadas correctamente${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📁 Estructura de bases de datos:"
echo -e "   ${BLUE}auth.db${NC}     → Usuarios y autenticación"
echo -e "   ${BLUE}trading.db${NC}  → Datos de trading"
echo ""
echo -e "Credenciales por defecto:"
echo -e "Usuario:   ${GREEN}admin${NC}"
echo -e "Password:  ${GREEN}admin${NC}"
echo -e "Rol:       ${GREEN}admin${NC}"
echo ""
