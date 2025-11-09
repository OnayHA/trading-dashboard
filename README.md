# 🤖 Trading Dashboard

Dashboard web moderno para monitoreo y control de sistema de trading automatizado de opciones.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Platform](https://img.shields.io/badge/platform-linux-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)

---

## 📋 Descripción

Sistema de monitoreo en tiempo real para operaciones de opciones automatizadas. Proporciona visibilidad completa del sistema de trading, control de riesgo, ejecución manual de operaciones y análisis histórico de rendimiento.

### Características Principales

- 🔒 **Autenticación segura** con lock screen (Ctrl+L)
- 📊 **Dashboard en tiempo real** con WebSockets
- 🎯 **Control de riesgo** configurable por ticker
- 📈 **Monitoreo de posiciones** activas con P&L en vivo
- 🎨 **Interfaz moderna** y responsive
- 🔧 **Operaciones manuales** con configuración avanzada
- 📉 **Historial completo** de trades con analytics

---

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes modernos
- **Recharts** - Visualización de datos
- **WebSocket** - Actualizaciones en tiempo real

### Backend
- **FastAPI** - API framework
- **Uvicorn** - ASGI server
- **SQLite** - Base de datos (migración a PostgreSQL planeada)
- **JWT** - Autenticación

---

## 🚀 Quick Start

### Requisitos Previos

#### Linux (Recomendado - Testeado en Pop!_OS 22.04)
```bash
# Python 3.10+
python --version

# Conda (opcional pero recomendado)
conda --version

# Git
git --version
```

#### Windows
```batch
REM Python 3.10+
python --version

REM Git
git --version
```

⚠️ **Nota:** El desarrollo y testing se realiza principalmente en Linux. Para mejor experiencia y estabilidad, se recomienda usar **Pop!_OS/Ubuntu**.

---

### Instalación

#### 1. Clonar el repositorio
```bash
git clone https://github.com/OnayHA/trading-dashboard.git
cd trading-dashboard
```

#### 2. Configurar entorno (Linux)
```bash
# Si usas conda (recomendado)
conda activate ml-training

# Instalar dependencias del backend
cd backend
pip install -r requirements.txt --break-system-packages
cd ..
```

#### 3. Ejecutar el sistema

**Linux:**
```bash
chmod +x run.sh
./run.sh
```

El script automáticamente:
- ✅ Activa el environment de conda
- ✅ Verifica dependencias
- ✅ Inicia el backend en puerto 8000
- ✅ Abre el navegador automáticamente

**Windows:**
```batch
run.bat
```

⚠️ **Nota Windows:** El script es básico. Para producción, considera usar **WSL2** o migrar a Linux.

---

### 4. Acceder al dashboard
```
http://localhost:8000
```

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin`

🔒 **Cambiar credenciales** después del primer login.

---

## 📚 Documentación

La documentación completa del proyecto está en la carpeta `docs/`:

- 📋 **[PROJECT_SPEC.md](docs/PROJECT_SPEC.md)** - Especificación completa del sistema
- ✅ **[COMPONENT_CHECKLIST.md](docs/COMPONENT_CHECKLIST.md)** - Estado de implementación
- 🔌 **[API_ENDPOINTS.md](docs/API_ENDPOINTS.md)** - Referencia de API endpoints

---

## 🎯 Arquitectura
```
┌─────────────────────────────────────────┐
│      Trading Dashboard (React)          │
│     WebSocket + REST API Client         │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│       FastAPI Backend                   │
│   REST API + WebSocket Server           │
└─────────────┬───────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   SQLite Database                       │
│   (trades | signals | users)            │
└─────────────┬───────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   Trading System (Python)               │
│   Signal + Trading + Monitor            │
└─────────────────────────────────────────┘
```

### Principios de Diseño

- ✅ **Modular y desacoplado** - Componentes independientes
- ✅ **Error boundaries** - Fallos aislados
- ✅ **CSS Modules** - Estilos encapsulados
- ✅ **Mock-first** - Frontend funcional antes de backend completo
- ✅ **Progressive enhancement** - Conexión incremental con sistema real

---

## 🔧 Configuración Avanzada

### Ejecutar como servicio (Linux)
```bash
# Copiar service file
sudo cp scripts/trading-dashboard.service /etc/systemd/system/

# Editar paths según tu instalación
sudo nano /etc/systemd/system/trading-dashboard.service

# Habilitar y arrancar
sudo systemctl enable trading-dashboard
sudo systemctl start trading-dashboard

# Ver status
sudo systemctl status trading-dashboard
```

### Variables de entorno

Crear `.env` en la carpeta `backend/`:
```env
# Base de datos
DATABASE_PATH=data/trades_data/trading.db

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# Server
HOST=0.0.0.0
PORT=8000
```

---

## 🐛 Troubleshooting

### Linux

**Puerto 8000 ocupado:**
```bash
# Ver qué proceso usa el puerto
lsof -i :8000

# Matar el proceso
kill $(lsof -t -i:8000)
```

**Problemas con conda:**
```bash
# Verificar environments
conda env list

# Activar environment correcto
conda activate ml-training
```

**Permisos en run.sh:**
```bash
chmod +x run.sh
```

### Windows

Si experimentas problemas en Windows:
1. Considera usar **WSL2** (Windows Subsystem for Linux)
2. O migrar a Linux para mejor compatibilidad

**Instalar WSL2:**
```powershell
wsl --install -d Ubuntu-22.04
```

---

## 🔐 Seguridad

- ✅ Autenticación con JWT tokens
- ✅ Lock screen (Ctrl+L) sin cerrar sesión
- ✅ Contraseñas hasheadas (bcrypt)
- ✅ Variables sensibles en `.env` (no commiteadas)
- ✅ CORS configurado para localhost

⚠️ **Para producción:** 
- Cambiar `JWT_SECRET_KEY`
- Usar HTTPS
- Configurar firewall
- Restringir CORS

---

## 📊 Estado del Proyecto

### Fase Actual: **Desarrollo Inicial**

Ver [COMPONENT_CHECKLIST.md](docs/COMPONENT_CHECKLIST.md) para estado detallado.

### Roadmap

- [x] Especificación completa
- [ ] Frontend base (React + Tailwind)
- [ ] Backend con endpoints mock
- [ ] Autenticación funcional
- [ ] Dashboard con datos en tiempo real
- [ ] Integración con sistema de trading real
- [ ] Testing y optimización
- [ ] Migración a PostgreSQL

---

## 🤝 Contribución

Este es un proyecto privado para el equipo de trading. 

Para modificaciones:
1. Lee `docs/PROJECT_SPEC.md` completo
2. Sigue la arquitectura modular establecida
3. Actualiza `COMPONENT_CHECKLIST.md` conforme avances
4. Documenta nuevos endpoints en `API_ENDPOINTS.md`

---

## 📝 Notas

### Compatibilidad
- ✅ **Linux:** Totalmente soportado y testeado
- ⚠️ **Windows:** Funcional pero sin optimizaciones
- ✅ **WSL2:** Recomendado para usuarios de Windows

### Base de Datos
Actualmente usa **SQLite** para desarrollo. La migración a **PostgreSQL** está planeada para producción.

### Sistema de Trading
El dashboard se conecta a un sistema de trading existente que:
- Detecta señales (ELITE_2, ELITE_1, NORMAL_1)
- Ejecuta operaciones automáticamente
- Monitorea posiciones en tiempo real
- Gestiona riesgo y targets

---

## 📧 Contacto

Para issues o consultas del equipo, contactar a Onay.

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

**Desarrollado con ☕ y 🐧 en Pop!_OS**