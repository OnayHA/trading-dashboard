#!/bin/bash

# ============================================
# Trading Dashboard Launcher
# Optimizado para Linux (Pop!_OS/Ubuntu)
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PORT=8000

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🤖 Trading Dashboard Launcher${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗${NC} Python 3 no encontrado"
    echo "Instala Python 3: sudo apt install python3 python3-pip"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION"

# Check Node.js (optional for development)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Node.js no encontrado (opcional para desarrollo frontend)"
fi

echo ""

# Install backend dependencies
echo -e "${BLUE}▶${NC} Instalando dependencias del backend..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo -e "${BLUE}▶${NC} Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo -e "${GREEN}✓${NC} Dependencias instaladas"

# Initialize database
echo -e "${BLUE}▶${NC} Inicializando base de datos..."
python3 -c "from services.database import init_database; init_database()" 2>/dev/null || echo -e "${YELLOW}⚠${NC} Base de datos ya inicializada"

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Puerto $PORT en uso. Cerrando proceso..."
    kill $(lsof -t -i:$PORT) 2>/dev/null || {
        echo -e "${RED}✗${NC} No se pudo liberar el puerto"
        echo "Ejecuta manualmente: sudo lsof -t -i:$PORT | xargs kill"
        exit 1
    }
    sleep 2
fi

# Start backend
echo -e "${GREEN}▶${NC} Iniciando backend..."
cd "$BACKEND_DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo -n "Esperando backend"
for i in {1..30}; do
    if curl -s http://localhost:$PORT/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Sistema iniciado correctamente${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Dashboard API: ${BLUE}http://localhost:$PORT${NC}"
echo -e "API Docs:      ${BLUE}http://localhost:$PORT/docs${NC}"
echo -e "Backend PID:   ${YELLOW}$BACKEND_PID${NC}"
echo ""
echo -e "${YELLOW}Credenciales por defecto:${NC}"
echo -e "Usuario:   ${GREEN}admin${NC}"
echo -e "Password:  ${GREEN}admin${NC}"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener el sistema${NC}"
echo ""

# Cleanup handler
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo sistema...${NC}"
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✓${NC} Sistema detenido"
    exit 0
}

trap cleanup INT TERM

# Keep running
wait $BACKEND_PID
