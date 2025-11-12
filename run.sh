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
BACKEND_PORT=8000
FRONTEND_PORT=5173

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

# Check Node.js (required for frontend)
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js no encontrado"
    echo "Instala Node.js: sudo apt install nodejs npm"
    exit 1
fi

NODE_VERSION=$(node --version 2>&1)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗${NC} npm no encontrado"
    echo "Instala npm: sudo apt install npm"
    exit 1
fi

NPM_VERSION=$(npm --version 2>&1)
echo -e "${GREEN}✓${NC} npm $NPM_VERSION"

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

echo -e "${GREEN}✓${NC} Dependencias del backend instaladas"

# Install frontend dependencies
echo -e "${BLUE}▶${NC} Instalando dependencias del frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓${NC} node_modules ya existe, saltando instalación"
fi

echo -e "${GREEN}✓${NC} Dependencias del frontend instaladas"

# Database initialization is handled by main.py on startup
# No need to initialize manually here
echo -e "${GREEN}✓${NC} Database will be initialized on backend startup"

# Check if backend port is in use
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Puerto $BACKEND_PORT en uso. Cerrando proceso..."
    kill $(lsof -t -i:$BACKEND_PORT) 2>/dev/null || {
        echo -e "${RED}✗${NC} No se pudo liberar el puerto"
        echo "Ejecuta manualmente: sudo lsof -t -i:$BACKEND_PORT | xargs kill"
        exit 1
    }
    sleep 2
fi

# Check if frontend port is in use
if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Puerto $FRONTEND_PORT en uso. Cerrando proceso..."
    kill $(lsof -t -i:$FRONTEND_PORT) 2>/dev/null || {
        echo -e "${RED}✗${NC} No se pudo liberar el puerto"
        echo "Ejecuta manualmente: sudo lsof -t -i:$FRONTEND_PORT | xargs kill"
        exit 1
    }
    sleep 2
fi

# Start backend
echo -e "${GREEN}▶${NC} Iniciando backend..."
cd "$BACKEND_DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload > "$PROJECT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend PID: $BACKEND_PID"
echo -e "${BLUE}ℹ${NC}  Backend logs: $PROJECT_DIR/backend.log"

# Wait for backend to be ready
echo -n "Esperando backend"
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Start frontend
echo -e "${GREEN}▶${NC} Iniciando frontend..."
cd "$FRONTEND_DIR"
npm run dev > "$PROJECT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend PID: $FRONTEND_PID"
echo -e "${BLUE}ℹ${NC}  Frontend logs: $PROJECT_DIR/frontend.log"

# Wait for frontend to be ready
echo -n "Esperando frontend"
for i in {1..30}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Open browser
echo -e "${BLUE}▶${NC} Abriendo navegador..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$FRONTEND_PORT" &> /dev/null &
    echo -e "${GREEN}✓${NC} Navegador abierto"
elif command -v gnome-open &> /dev/null; then
    gnome-open "http://localhost:$FRONTEND_PORT" &> /dev/null &
    echo -e "${GREEN}✓${NC} Navegador abierto"
else
    echo -e "${YELLOW}⚠${NC} No se pudo abrir el navegador automáticamente"
    echo -e "    Abre manualmente: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Sistema iniciado correctamente${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Frontend:      ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "Backend API:   ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo -e "API Docs:      ${BLUE}http://localhost:$BACKEND_PORT/docs${NC}"
echo -e "Backend PID:   ${YELLOW}$BACKEND_PID${NC}"
echo -e "Frontend PID:  ${YELLOW}$FRONTEND_PID${NC}"
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
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓${NC} Backend detenido"
    echo -e "${GREEN}✓${NC} Frontend detenido"
    exit 0
}

trap cleanup INT TERM

# Keep running (wait for both processes)
wait -n $BACKEND_PID $FRONTEND_PID
