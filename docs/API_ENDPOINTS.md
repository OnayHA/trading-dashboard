¡Perfecto! Vamos con el último documento. 🔌

---

## **ARCHIVO 4: `docs/API_ENDPOINTS.md`**


```markdown
# API Endpoints Reference

**Proyecto:** Trading Dashboard  
**Base URL:** `http://localhost:8000`  
**Versión:** 1.0.0

---

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Sistema](#sistema)
3. [Posiciones](#posiciones)
4. [Trades](#trades)
5. [Configuración](#configuración)
6. [Operaciones Manuales](#operaciones-manuales)
7. [WebSocket](#websocket)

---

## 🔐 Autenticación

### POST `/auth/login`

**Status:** ✅ Implementado (con users.json)

**Descripción:** Autentica usuario y retorna JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "email": "admin@trading.com"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

**Notas:**
- Token expira en 24 horas
- Guardar token en localStorage
- Incluir en header: `Authorization: Bearer {token}`

---

### POST `/auth/verify-password`

**Status:** ✅ Implementado

**Descripción:** Verifica contraseña para desbloquear pantalla (Lock Screen). NO invalida la sesión.

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response (200 OK):**
```json
{
  "valid": true
}
```

**Response (contraseña incorrecta):**
```json
{
  "valid": false
}
```

**Notas:**
- Solo valida contraseña
- No genera nuevo token
- No cierra sesión

---

### POST `/auth/register`

**Status:** ✅ Implementado

**Descripción:** Registra nuevo usuario.

**Request:**
```json
{
  "username": "newuser",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "message": "User created successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Username already exists"
}
```

**TODO:**
- Agregar restricción de admin-only
- Aceptar email en request
- Validación de password strength

---

### GET `/auth/profile`

**Status:** ✅ Implementado

**Descripción:** Obtiene perfil del usuario.

**Query Parameters:**
- `username` (string) - Username del usuario

**Response (200 OK):**
```json
{
  "username": "admin",
  "email": "admin@trading.com",
  "created_at": "2025-11-09T10:00:00Z"
}
```

**TODO:**
- Extraer username del JWT token en lugar de query param
- Agregar campos adicionales (roles, preferences)

---

## 🖥️ Sistema

### GET `/api/system/status`

**Status:** 🚧 MOCK (TODO: Conectar con sistema real)

**Descripción:** Estado general del sistema de trading.

**Response (200 OK):**
```json
{
  "overall": "operational",
  "signal_controller": "active",
  "trading_controller": "active",
  "monitor": "active",
  "ib_api": "connected",
  "database": "connected",
  "live_trading": true,
  "last_heartbeat": "2025-11-09T14:30:00Z"
}
```

**Posibles valores:**
- `overall`: `operational`, `degraded`, `error`
- `*_controller`: `active`, `inactive`, `error`
- `ib_api`: `connected`, `disconnected`, `error`
- `database`: `connected`, `disconnected`, `error`
- `live_trading`: `true`, `false`

**TODO:**
- Conectar con Signal Controller real
- Conectar con Trading Controller real
- Conectar con Monitor real
- Verificar conexión IB API real
- Verificar conexión DB real

**Frecuencia de polling recomendada:** 5 segundos

---

### POST `/api/system/kill-switch`

**Status:** 🚧 MOCK (TODO: Conectar con Trading Controller)

**Descripción:** Activa/desactiva trading en vivo. Cuando está OFF, el sistema genera señales pero NO ejecuta órdenes.

**Request:**
```json
{
  "enabled": false
}
```

**Response (200 OK):**
```json
{
  "live_trading_enabled": false,
  "message": "Trading pausado - solo señales"
}
```

**TODO:**
- Conectar con Trading Controller
- Agregar confirmación de seguridad
- Log de cambios de estado
- Notificar via WebSocket a todos los clientes

---

### GET `/api/system/heartbeat`

**Status:** ✅ Implementado

**Descripción:** Simple health check.

**Response (200 OK):**
```json
{
  "status": "alive",
  "timestamp": "2025-11-09T14:30:00Z"
}
```

---

## 📊 Posiciones

### GET `/api/positions/active`

**Status:** 🚧 MOCK (TODO: Conectar con Monitor o SQLite)

**Descripción:** Obtiene todas las posiciones abiertas actualmente.

**Response (200 OK):**
```json
[
  {
    "id": "SPY_580C_20251109",
    "ticker": "SPY",
    "option_type": "CALL",
    "strike": 580.0,
    "contracts": 10,
    "entry_time": "2025-11-07T09:35:00",
    "entry_price": 3.20,
    "current_price": 4.15,
    "unrealized_pnl": 950.00,
    "delta": 0.42,
    "signal_type": "ELITE_2",
    "strategy": "gaps",
    "hold_type": "multi_day",
    "days_held": 2,
    "status": "OPEN"
  },
  {
    "id": "QQQ_495P_20251109",
    "ticker": "QQQ",
    "option_type": "PUT",
    "strike": 495.0,
    "contracts": 5,
    "entry_time": "2025-11-09T10:15:00",
    "entry_price": 2.80,
    "current_price": 2.65,
    "unrealized_pnl": -75.00,
    "delta": -0.30,
    "signal_type": "ELITE_1",
    "strategy": "patterns",
    "hold_type": "intraday",
    "days_held": 0,
    "status": "OPEN"
  }
]
```

**TODO:**
- Leer de tabla `active_positions` cuando se cree
- O conectar directamente con Monitor module
- Updates en tiempo real via WebSocket

**Frecuencia de polling:** NO hacer polling, usar WebSocket para updates

---

### POST `/api/positions/close/{position_id}`

**Status:** 🚧 MOCK (TODO: Conectar con Trading Controller)

**Descripción:** Cierra una posición (parcial o totalmente).

**Path Parameters:**
- `position_id` (string) - ID de la posición

**Request:**
```json
{
  "percentage": 100
}
```

**Valores de `percentage`:**
- `100` - Cerrar toda la posición
- `50` - Cerrar 50%
- `25` - Cerrar 25%
- etc.

**Response (200 OK):**
```json
{
  "position_id": "SPY_580C_20251109",
  "percentage_closed": 100,
  "message": "Orden de cierre enviada para 100% de la posición"
}
```

**TODO:**
- Enviar orden real al Trading Controller
- Validar que posición existe
- Verificar que percentage es válido
- Notificar via WebSocket cuando se ejecute el cierre

---

### POST `/api/positions/close-all`

**Status:** 🚧 MOCK (TODO: Conectar con Trading Controller)

**Descripción:** 🚨 EMERGENCIA: Cierra TODAS las posiciones abiertas.

**Request:** (sin body)

**Response (200 OK):**
```json
{
  "message": "Cerrando todas las posiciones...",
  "positions_affected": 5
}
```

**TODO:**
- Conectar con emergency shutdown del Trading Controller
- Agregar confirmación de seguridad
- Log detallado de la acción
- Notificar via WebSocket

**⚠️ IMPORTANTE:** Esta acción es irreversible y debe usarse solo en emergencias.

---

## 📈 Trades

### GET `/api/trades/history`

**Status:** 🚧 MOCK (TODO: Conectar con SQLite)

**Descripción:** Obtiene historial de trades con filtros opcionales.

**Query Parameters:**
- `start_date` (string, opcional) - Fecha inicio (YYYY-MM-DD)
- `end_date` (string, opcional) - Fecha fin (YYYY-MM-DD)
- `ticker` (string, opcional) - Filtrar por ticker (`all` = todos)
- `strategy` (string, opcional) - Filtrar por estrategia (`all` = todas)
- `type` (string, opcional) - Tipo de opción: `call`, `put`, `stock`, `all`
- `status` (string, opcional) - Estado: `open`, `closed`, `all`
- `min_pnl` (float, opcional) - P&L mínimo
- `max_pnl` (float, opcional) - P&L máximo

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "signal_id": 123,
    "entry_time": "2025-11-08T09:35:00",
    "exit_time": "2025-11-08T15:45:00",
    "ticker": "SPY",
    "strike": 580.0,
    "option_type": "CALL",
    "contracts": 10,
    "entry_price": 3.20,
    "exit_price": 4.50,
    "pnl": 650.00,
    "delta": 0.35,
    "strategy": "gaps",
    "days_held": 0
  },
  {
    "id": 2,
    "signal_id": 124,
    "entry_time": "2025-11-07T10:15:00",
    "exit_time": "2025-11-08T14:20:00",
    "ticker": "NVDA",
    "strike": 148.0,
    "option_type": "CALL",
    "contracts": 15,
    "entry_price": 1.95,
    "exit_price": 2.40,
    "pnl": 450.00,
    "delta": 0.40,
    "strategy": "patterns",
    "days_held": 1
  }
]
```

**TODO:**
- Conectar con tabla `trades` de SQLite
- Implementar todos los filtros
- Agregar paginación para grandes volúmenes
- Ordenamiento configurable

---

### GET `/api/trades/{trade_id}/lifecycle`

**Status:** 🚧 MOCK (TODO: Conectar con SQLite)

**Descripción:** Obtiene el ciclo de vida completo de un trade (eventos).

**Path Parameters:**
- `trade_id` (integer) - ID del trade

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "trade_id": 1,
    "event_type": "SIGNAL",
    "timestamp": "2025-11-08T09:30:00",
    "details": "{\"signal_type\": \"ELITE_2\", \"confidence\": 0.87}",
    "pnl": null,
    "reason": null
  },
  {
    "id": 2,
    "trade_id": 1,
    "event_type": "ALLOCATED",
    "timestamp": "2025-11-08T09:32:00",
    "details": "{\"amount\": 3200, \"contracts\": 10}",
    "pnl": null,
    "reason": null
  },
  {
    "id": 3,
    "trade_id": 1,
    "event_type": "EXECUTED",
    "timestamp": "2025-11-08T09:35:00",
    "details": "{\"price\": 3.20, \"fill\": \"complete\"}",
    "pnl": null,
    "reason": null
  },
  {
    "id": 4,
    "trade_id": 1,
    "event_type": "PARTIAL_CLOSE",
    "timestamp": "2025-11-08T13:45:00",
    "details": "{\"percentage\": 50, \"price\": 4.00}",
    "pnl": 400.00,
    "reason": "TARGET_1"
  },
  {
    "id": 5,
    "trade_id": 1,
    "event_type": "FULL_CLOSE",
    "timestamp": "2025-11-08T15:45:00",
    "details": "{\"percentage\": 50, \"price\": 4.50}",
    "pnl": 250.00,
    "reason": "TARGET_2"
  }
]
```

**Event Types:**
- `SIGNAL` - Señal detectada
- `ALLOCATED` - Capital asignado
- `EXECUTED` - Orden ejecutada
- `PARTIAL_CLOSE` - Cierre parcial
- `FULL_CLOSE` - Cierre total

**Reasons:**
- `TARGET_1` - Target 1 alcanzado
- `TARGET_2` - Target 2 alcanzado
- `STOP_LOSS` - Stop loss activado
- `EOD` - Fin del día (intraday)
- `MAX_DAYS` - Máximo de días alcanzado
- `MANUAL` - Cierre manual
- `TRAILING_STOP` - Trailing stop activado

**TODO:**
- Crear tabla `trade_lifecycle` en SQLite
- Registrar eventos desde Trading System
- Formatear `details` JSON adecuadamente

---

### GET `/api/trades/export`

**Status:** 🚧 MOCK (TODO: Implementar export CSV)

**Descripción:** Exporta trades a CSV con los mismos filtros que `/history`.

**Query Parameters:** (mismos que `/api/trades/history`)

**Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="trades_2025-11-01_2025-11-09.csv"

id,entry_time,exit_time,ticker,option_type,strike,contracts,entry_price,exit_price,pnl,delta,strategy
1,2025-11-08T09:35:00,2025-11-08T15:45:00,SPY,CALL,580,10,3.20,4.50,650.00,0.35,gaps
2,2025-11-07T10:15:00,2025-11-08T14:20:00,NVDA,CALL,148,15,1.95,2.40,450.00,0.40,patterns
...
```

**TODO:**
- Implementar generación de CSV
- Usar pandas para formato limpio
- Incluir todos los campos relevantes
- Respetar filtros del query

---

## ⚙️ Configuración

### GET `/api/config/global`

**Status:** 🚧 MOCK (TODO: Conectar con SQLite)

**Descripción:** Obtiene configuración global del sistema.

**Response (200 OK):**
```json
{
  "live_trading_enabled": true,
  "hold_type": "smart",
  "allocation_mode": "per_ticker"
}
```

**Valores posibles:**
- `hold_type`: `intraday`, `multi_day`, `smart`
- `allocation_mode`: `per_ticker`, `fixed`, `percentage`

**TODO:**
- Leer de tabla `system_config`
- Cachear configuración

---

### PUT `/api/config/global`

**Status:** 🚧 MOCK (TODO: Conectar con SQLite)

**Descripción:** Actualiza configuración global.

**Request:**
```json
{
  "live_trading_enabled": true,
  "hold_type": "smart",
  "allocation_mode": "per_ticker"
}
```

**Response (200 OK):**
```json
{
  "message": "Configuration updated successfully"
}
```

**TODO:**
- Escribir a tabla `system_config`
- Validar valores
- Notificar cambios al Trading System
- Invalidar cache

---

### GET `/api/config/tickers`

**Status:** 🚧 MOCK (TODO: Implementar)

**Descripción:** Obtiene configuración de todos los tickers.

**Response (200 OK):**
```json
[
  {
    "symbol": "SPY",
    "enabled": true,
    "max_allocation": 5000,
    "max_positions": 5,
    "open_positions": 2
  },
  {
    "symbol": "QQQ",
    "enabled": true,
    "max_allocation": 4000,
    "max_positions": 5,
    "open_positions": 1
  },
  {
    "symbol": "NVDA",
    "enabled": true,
    "max_allocation": 3000,
    "max_positions": 3,
    "open_positions": 1
  }
]
```

**TODO:**
- Crear tabla `ticker_config`
- Leer de SQLite
- Incluir `open_positions` en tiempo real

---

### PUT `/api/config/tickers/{symbol}`

**Status:** 🚧 MOCK (TODO: Implementar)

**Descripción:** Actualiza configuración de un ticker específico.

**Path Parameters:**
- `symbol` (string) - Ticker symbol (e.g., "SPY")

**Request:**
```json
{
  "enabled": true,
  "max_allocation": 5000,
  "max_positions": 5
}
```

**Response (200 OK):**
```json
{
  "message": "Ticker configuration updated"
}
```

**TODO:**
- Escribir a tabla `ticker_config`
- Validar valores
- Aplicar cambios en Trading System

---

### GET `/api/config/strategies`

**Status:** 🚧 MOCK (TODO: Implementar)

**Descripción:** Obtiene configuración de todas las estrategias.

**Response (200 OK):**
```json
[
  {
    "id": "gaps",
    "name": "Gap Strategy",
    "enabled": true,
    "priority": 1,
    "hold_type": "multi_day",
    "max_hold_days": 3,
    "target_1_pct": 20,
    "target_2_pct": 40,
    "stop_loss_pct": 15,
    "partial_close_t1": 25,
    "trailing_stop_trigger": 40
  },
  {
    "id": "patterns",
    "name": "Pattern Finder",
    "enabled": true,
    "priority": 2,
    "hold_type": "intraday",
    "max_hold_days": 0,
    "target_1_pct": 15,
    "target_2_pct": 25,
    "stop_loss_pct": 12,
    "partial_close_t1": 50,
    "trailing_stop_trigger": null
  }
]
```

**TODO:**
- Crear tabla `strategy_config`
- Leer de SQLite
- Aplicar configuración al Trading System

---

### PUT `/api/config/strategies/{strategy_id}`

**Status:** 🚧 MOCK (TODO: Implementar)

**Descripción:** Actualiza configuración de una estrategia.

**Path Parameters:**
- `strategy_id` (string) - ID de la estrategia

**Request:**
```json
{
  "enabled": true,
  "priority": 1,
  "hold_type": "multi_day",
  "max_hold_days": 3,
  "target_1_pct": 20,
  "target_2_pct": 40,
  "stop_loss_pct": 15,
  "partial_close_t1": 25,
  "trailing_stop_trigger": 40
}
```

**Response (200 OK):**
```json
{
  "message": "Strategy configuration updated"
}
```

**TODO:**
- Escribir a tabla `strategy_config`
- Validar valores
- Aplicar al Trading System

---

### GET `/api/config/risk-parameters`

**Status:** 🚧 MOCK (TODO: Implementar)

**Descripción:** Obtiene parámetros de riesgo globales.

**Response (200 OK):**
```json
{
  "delta_min": 0.25,
  "delta_max": 0.45,
  "dte_min": 3,
  "dte_max": 14,
  "max_daily_loss": 1000,
  "max_open_trades": 15
}
```

**TODO:**
- Leer de tabla `system_config` o tabla dedicada
- Aplicar límites en Trading System

---

### PUT `/api/config/risk-parameters`

**Status:** 🚧 MOCK (TODO: Implementar)

**Descripción:** Actualiza parámetros de riesgo.

**Request:**
```json
{
  "delta_min": 0.25,
  "delta_max": 0.45,
  "dte_min": 3,
  "dte_max": 14,
  "max_daily_loss": 1000,
  "max_open_trades": 15
}
```

**Response (200 OK):**
```json
{
  "message": "Risk parameters updated"
}
```

**TODO:**
- Escribir a SQLite
- Validar rangos
- Aplicar al Trading System

---

## 🎯 Operaciones Manuales

### POST `/api/manual/execute`

**Status:** 🚧 MOCK (TODO: Conectar con Trading Controller)

**Descripción:** Ejecuta una operación manual (opción o stock).

**Request:**
```json
{
  "ticker": "SPY",
  "type": "call",
  "strike": 580,
  "delta": 0.35,
  "dte": 7,
  "contracts": 10,
  "hold_type": "until_targets",
  "max_hold_days": 3,
  "monitor_enabled": true,
  "target_1_pct": 20,
  "target_2_pct": 40,
  "stop_loss_pct": 15,
  "partial_close_t1": 50,
  "trailing_stop_enabled": true
}
```

**Campos:**
- `type`: `call`, `put`, `stock`
- `hold_type`: `intraday`, `multi_day`, `until_targets`

**Response (200 OK):**
```json
{
  "position_id": "SPY_580C_20251109_MANUAL",
  "message": "Orden ejecutada exitosamente",
  "entry_price": 3.25,
  "cost": 3250.00
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Capital insuficiente"
}
```

**TODO:**
- Conectar con Trading Controller
- Validar capital disponible
- Buscar strike óptimo según delta
- Ejecutar orden real via IB API
- Registrar en SQLite
- Activar Monitor si `monitor_enabled = true`
- Notificar via WebSocket

---

### POST `/api/manual/close-all`

**Status:** 🚧 MOCK (TODO: Conectar con Trading Controller)

**Descripción:** Cierra TODAS las operaciones manuales abiertas.

**Request:** (sin body)

**Response (200 OK):**
```json
{
  "message": "Cerrando todas las operaciones manuales...",
  "positions_affected": 3
}
```

**TODO:**
- Identificar posiciones manuales
- Enviar órdenes de cierre
- Notificar via WebSocket

---

## 🔌 WebSocket

### WS `/ws`

**Status:** ✅ Implementado (estructura, mock updates)

**Descripción:** WebSocket endpoint para actualizaciones en tiempo real.

**Conexión:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  // Handle based on data.type
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
  // Implement reconnection logic
};
```

---

### Eventos WebSocket

#### `signal_detected`

**Descripción:** Nueva señal detectada.

**Payload:**
```json
{
  "type": "signal_detected",
  "payload": {
    "id": "signal_12345",
    "timestamp": "2025-11-09T14:35:00",
    "ticker": "SPY",
    "signal_type": "ELITE_2",
    "direction": "CALL",
    "confidence": 0.87,
    "status": "pending"
  }
}
```

**TODO:** Enviar desde Signal Controller cuando se detecte señal

---

#### `position_update`

**Descripción:** Actualización de precio de posición.

**Payload:**
```json
{
  "type": "position_update",
  "payload": {
    "position_id": "SPY_580C_20251109",
    "current_price": 4.15,
    "unrealized_pnl": 950.00,
    "delta": 0.42
  }
}
```

**TODO:** Enviar desde Monitor cada vez que actualice precios

---

#### `position_closed`

**Descripción:** Posición cerrada.

**Payload:**
```json
{
  "type": "position_closed",
  "payload": {
    "position_id": "SPY_580C_20251109",
    "pnl": 650.00,
    "reason": "TARGET_2"
  }
}
```

**TODO:** Enviar desde Monitor cuando cierre posición

---

#### `system_status`

**Descripción:** Actualización de estado del sistema.

**Payload:**
```json
{
  "type": "system_status",
  "payload": {
    "signal_controller": "active",
    "trading_controller": "active",
    "monitor": "active",
    "ib_api": "connected",
    "database": "connected",
    "live_trading": true,
    "last_heartbeat": "2025-11-09T14:35:00"
  }
}
```

**TODO:** Enviar periódicamente (cada 10 segundos) desde sistema

---

#### `notification`

**Descripción:** Notificación general para el usuario.

**Payload:**
```json
{
  "type": "notification",
  "payload": {
    "id": "notif_12345",
    "type": "position_closed",
    "title": "Posición Cerrada",
    "message": "SPY 580C cerrada con P&L: +$650.00 (TARGET_2)",
    "timestamp": "2025-11-09T14:35:00"
  }
}
```

**Notification Types:**
- `signal` - Nueva señal
- `position_opened` - Posición abierta
- `position_closed` - Posición cerrada
- `alert` - Alerta del sistema
- `stop_loss_triggered` - Stop loss activado
- `target_reached` - Target alcanzado

**TODO:** Enviar notificaciones desde eventos relevantes del sistema

---

## 📝 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Request exitoso |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Request inválido |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - No autorizado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 🔒 Autenticación en Headers

Para endpoints protegidos (todos excepto `/auth/*`):

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**TODO:** Implementar middleware de autenticación en FastAPI

---

## 📊 Rate Limiting

**Status:** ⏸️ No implementado

**TODO para producción:**
- Implementar rate limiting
- Límites sugeridos:
  - Login: 5 requests/minuto
  - Otros endpoints: 100 requests/minuto
  - WebSocket connections: 5 por usuario

---

## 🧪 Testing Endpoints

### Con cURL

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Get system status
curl http://localhost:8000/api/system/status

# Get active positions (con auth)
curl http://localhost:8000/api/positions/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Con Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "admin", "password": "admin"}
)
token = response.json()["token"]

# Get active positions
response = requests.get(
    "http://localhost:8000/api/positions/active",
    headers={"Authorization": f"Bearer {token}"}
)
positions = response.json()
print(positions)
```

### Con JavaScript (Frontend)

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get active positions
const getActivePositions = async () => {
  const response = await api.get('/api/positions/active');
  return response.data;
};
```

---

## 📈 API Versioning

**Versión actual:** 1.0.0

**TODO para futuro:**
- Implementar versionado de API
- Formato sugerido: `/api/v1/...`, `/api/v2/...`
- Mantener backwards compatibility

---

## 🚀 Endpoints en Desarrollo

Estos endpoints están planeados pero no implementados:

### Análisis y Reporting
- `GET /api/analytics/daily` - Analytics diarios
- `GET /api/analytics/weekly` - Analytics semanales
- `GET /api/analytics/strategy/{id}` - Performance por estrategia
- `GET /api/reports/generate` - Generar reporte PDF

### Backtesting
- `POST /api/backtest/run` - Ejecutar backtest
- `GET /api/backtest/{id}/results` - Resultados de backtest
- `GET /api/backtest/history` - Historial de backtests

### Alertas
- `GET /api/alerts` - Obtener alertas configuradas
- `POST /api/alerts` - Crear nueva alerta
- `DELETE /api/alerts/{id}` - Eliminar alerta

---

## 📝 Notas para Desarrollo

### Prioridades de Implementación

1. **Fase 1 - Core (Hacer primero)**
   - Auth endpoints (login, verify-password)
   - System status (mock)
   - Active positions (mock)
   - WebSocket estructura

2. **Fase 2 - Lectura de Datos**
   - Conectar trades/history a SQLite
   - Conectar signals a SQLite
   - System config desde SQLite

3. **Fase 3 - Escritura y Control**
   - Kill switch funcional
   - Close positions
   - Manual trades execution

4. **Fase 4 - Advanced**
   - Configuración de tickers
   - Configuración de estrategias
   - Risk parameters
   - Export CSV

### Testing Checklist

- [ ] Todos los endpoints responden (aunque sea mock)
- [ ] Auth funciona correctamente
- [ ] JWT tokens se validan
- [ ] CORS configurado
- [ ] WebSocket se conecta
- [ ] Error handling consistente
- [ ] API docs en `/docs` accesibles

---

**Última actualización:** 2025-11-09  
**Próxima revisión:** Después de implementación inicial
