# 🚀 Inicio Rápido - Trading Dashboard

## Ejecutar el Dashboard

### Linux / macOS:
```bash
./run.sh
```

### Primera vez:
El script automáticamente:
1. ✅ Instala dependencias de Python
2. ✅ Crea el entorno virtual
3. ✅ Inicializa la base de datos
4. ✅ Inicia el servidor backend

## Acceso

Una vez iniciado, abre tu navegador en:

**API Backend:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

## Credenciales por Defecto

```
Usuario:   admin
Password:  admin
```

⚠️ **IMPORTANTE:** Cambia estas credenciales en producción

## Estructura del Proyecto

```
trading-dashboard/
├── backend/          # API FastAPI
│   ├── routers/      # Endpoints
│   ├── services/     # Lógica de negocio
│   └── data/         # Base de datos
├── frontend/         # React Dashboard
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── docs/             # Documentación
```

## Funcionalidades Principales

### 1. Dashboard (`/dashboard`)
- ✅ Posiciones activas en tiempo real
- ✅ Métricas de P&L
- ✅ Botón de cierre de emergencia

### 2. Ajustes de Riesgo (`/risk-settings`)
- ✅ Kill Switch (activar/desactivar trading)
- ✅ Parámetros de riesgo
- ✅ Configuración de límites

### 3. Operaciones Manuales (`/manual-trades`)
- ✅ Ejecutar trades manualmente
- ✅ Configurar monitor automático
- ✅ Establecer targets y stop loss

### 4. Historial (`/history`)
- ✅ Ver todas las operaciones
- ✅ Estadísticas de rendimiento
- ✅ Exportar a CSV

## Atajos de Teclado

- **Ctrl+L**: Bloquear pantalla

## Próximos Pasos

### Conectar con tu sistema de trading:

1. **Leer datos de SQLite:**
   - Las funciones en `backend/services/database.py` ya están listas
   - Solo apuntan a tu base de datos existente

2. **Notificaciones en tiempo real:**
   - Importa funciones desde `backend/services/websocket.py`
   - Llama `notify_signal_detected()` cuando detectes señales
   - Llama `notify_position_update()` cuando actualices precios

3. **Kill Switch real:**
   - Conecta `backend/routers/system.py` con tu Trading Controller
   - Implementa la lógica para pausar ejecución de órdenes

## Documentación Completa

Lee los siguientes archivos en orden:

1. `docs/PROJECT_SPEC.md` - Especificación completa
2. `docs/API_ENDPOINTS.md` - Referencia de API
3. `docs/COMPONENT_CHECKLIST.md` - Lista de componentes

## Soporte

Para problemas o preguntas:
1. Revisa `docs/PROJECT_SPEC.md`
2. Consulta los logs del backend
3. Verifica que el puerto 8000 esté libre

## Estado Actual

✅ **Backend:** Completamente funcional con mock data
✅ **Frontend:** Dashboard funcional (React + Vite + Tailwind)
⏳ **Integración:** Listo para conectar con tu sistema de trading

---

**Versión:** 1.0.0
**Última actualización:** Noviembre 2025
