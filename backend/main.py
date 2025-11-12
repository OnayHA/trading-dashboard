"""
Trading Dashboard Backend - FastAPI Application
Main entry point for the API server
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

from routers import auth, system, positions, trades, config as config_router, manual
from services.websocket import ws_manager
from services.database import init_database, init_auth_database
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Iniciando Trading Dashboard Backend...")
    print(f"📊 Trading Database: {settings.DATABASE_PATH}")
    print(f"🔐 Auth Database: {settings.AUTH_DATABASE_PATH}")

    # Initialize databases
    try:
        init_auth_database()
        print("✅ Auth database initialized")
    except Exception as e:
        print(f"⚠️  Auth database initialization warning: {e}")

    try:
        init_database()
        print("✅ Trading database initialized")
    except Exception as e:
        print(f"⚠️  Trading database initialization warning: {e}")

    yield

    # Shutdown
    print("👋 Cerrando Trading Dashboard Backend...")


# Create FastAPI application
app = FastAPI(
    title="Trading Dashboard API",
    description="Backend API for automated trading dashboard",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(system.router, prefix="/api/system", tags=["System"])
app.include_router(positions.router, prefix="/api/positions", tags=["Positions"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])
app.include_router(config_router.router, prefix="/api/config", tags=["Configuration"])
app.include_router(manual.router, prefix="/api/manual", tags=["Manual Trading"])


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates

    Events:
    - signal_detected: New trading signal
    - position_update: Position price update
    - position_closed: Position closed
    - system_status: System status update
    - notification: General notification
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages if needed
            data = await websocket.receive_text()
            # Handle client messages here if needed
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "trading-dashboard-backend",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Trading Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "websocket": "/ws"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    )
