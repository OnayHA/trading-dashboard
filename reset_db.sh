#!/bin/bash

# ============================================
# Reset Database Script
# Deletes and recreates the database
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
DB_FILE="$BACKEND_DIR/data/trades_data/trading.db"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔄 Reset Trading Dashboard Database${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if database exists
if [ -f "$DB_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  Base de datos encontrada: $DB_FILE"
    echo -e "${RED}   Esta operación eliminará TODOS los datos.${NC}"
    echo ""
    read -p "¿Estás seguro? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}✓${NC} Operación cancelada"
        exit 0
    fi

    echo -e "${BLUE}▶${NC} Eliminando base de datos antigua..."
    rm -f "$DB_FILE"
    echo -e "${GREEN}✓${NC} Base de datos eliminada"
else
    echo -e "${BLUE}ℹ${NC}  No se encontró base de datos existente"
fi

# Initialize database
echo -e "${BLUE}▶${NC} Creando nueva base de datos..."
cd "$BACKEND_DIR"

if [ -d "venv" ]; then
    source venv/bin/activate
    python3 << 'EOF'
from services.database import init_database
from services.auth_service import verify_password
import sqlite3

print("🔄 Inicializando base de datos...")
init_database()

# Verify admin user
conn = sqlite3.connect("data/trades_data/trading.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT username, email, phone FROM users WHERE username = 'admin'")
user = cursor.fetchone()

if user:
    print(f"\n✅ Usuario admin creado:")
    print(f"   Username: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Phone: {user['phone']}")
    print(f"   Password: admin")
else:
    print("❌ ERROR: Usuario admin no encontrado")

conn.close()
EOF
else
    echo -e "${RED}✗${NC} No se encontró el entorno virtual (venv)"
    echo "Ejecuta primero: ./run.sh"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Base de datos reiniciada correctamente${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Credenciales por defecto:"
echo -e "Usuario:   ${GREEN}admin${NC}"
echo -e "Password:  ${GREEN}admin${NC}"
echo ""
