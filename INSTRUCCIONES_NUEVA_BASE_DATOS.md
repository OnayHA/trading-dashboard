# 🔄 Instrucciones - Nueva Estructura de Bases de Datos

## ✅ Cambios Realizados

### 1. **Separación Completa de Bases de Datos**

**ANTES (Problemático):**
```
data/trades_data/trading.db
  ├── users (tabla de autenticación) ❌
  ├── trades
  └── signals
```

**AHORA (Correcto):**
```
data/auth/auth.db
  └── users (autenticación ÚNICAMENTE) ✅
      - id
      - username
      - email
      - phone
      - password_hash
      - role (admin/user) 🆕
      - created_at
      - is_active

data/trades_data/trading.db
  └── system_config (solo configuración de trading) ✅
```

### 2. **Sistema de Roles Implementado**

Ahora cada usuario tiene un campo `role`:
- `admin` - Acceso completo (futuro: todas las funcionalidades)
- `user` - Acceso limitado (futuro: solo visualización)

### 3. **Limpieza Automática**

El backend ahora **elimina automáticamente** la tabla `users` de `trading.db` si existe al iniciar.

---

## 🚀 Cómo Probar (Desde Cero)

### Paso 1: Descargar la rama actualizada

```bash
cd /media/desarrollo/Frontend-web/web_v-1.0/
rm -rf trading-dashboard-claude-greeting-session-011CV4BscLzxzBr7VCDAKjaV/

git clone -b claude/greeting-session-011CV4BscLzxzBr7VCDAKjaV \
  https://github.com/OnayHA/trading-dashboard.git \
  trading-dashboard-claude-greeting-session-011CV4BscLzxzBr7VCDAKjaV

cd trading-dashboard-claude-greeting-session-011CV4BscLzxzBr7VCDAKjaV/
```

### Paso 2: Limpiar bases de datos antiguas

```bash
# Eliminar cualquier base de datos vieja
rm -rf backend/data/

# Opcional: Usar el script de reset
./reset_db.sh
```

### Paso 3: Iniciar el sistema

```bash
./run.sh
```

**El sistema automáticamente:**
- ✅ Creará `data/auth/auth.db` con tabla `users`
- ✅ Creará `data/trades_data/trading.db` SIN tabla `users`
- ✅ Creará usuario `admin` con contraseña `admin` y rol `admin`

### Paso 4: Login

```
Usuario: admin
Contraseña: admin
```

---

## 🔍 Scripts de Verificación

### 1. **Verificar Estructura de Bases de Datos**

```bash
./verify_users.sh
# Selecciona opción: 3
```

**Debe mostrar:**
```
✅ auth.db existe
Tablas encontradas:
  - users

✅ trading.db existe
Tablas encontradas:
  - system_config

✅ CORRECTO: Tabla 'users' NO existe en trading.db
```

### 2. **Ver Todos los Usuarios**

```bash
./verify_users.sh
# Selecciona opción: 1
```

### 3. **Añadir Nuevo Usuario**

```bash
./verify_users.sh
# Selecciona opción: 2
```

Ejemplo:
```
Nombre de usuario: juan
Email: juan@trading.com
Contraseña: ******
Teléfono: +1234567890
Rol (admin/user) [user]: user
```

---

## 🧪 Probar Actualización de Perfil

1. Inicia el sistema con `./run.sh`
2. Login con `admin` / `admin`
3. Click en el dropdown de usuario (arriba derecha)
4. Click en "Editar Perfil"
5. Cambia el nombre de usuario a `admin_nuevo`
6. Guarda los cambios

**Resultado esperado:**
- ✅ El nombre se actualiza en el Header inmediatamente
- ✅ Se crea un nuevo token JWT
- ✅ La página se recarga automáticamente
- ✅ Al volver a abrir el dropdown, muestra `admin_nuevo`

---

## 🐛 Solución de Problemas

### Problema: "Sigue creando tabla users en trading.db"

**Solución:**
```bash
# 1. Detener el backend si está corriendo
pkill -f uvicorn

# 2. Eliminar TODAS las bases de datos
rm -rf backend/data/

# 3. Reiniciar desde cero
./run.sh
```

### Problema: "El nombre de usuario no se actualiza en el Header"

**Verificar:**
1. El backend está usando `auth.db` (revisa logs del backend)
2. El frontend está recibiendo el `role` en el login (abre DevTools → Network → login)
3. El localStorage tiene el usuario actualizado (DevTools → Application → Local Storage)

**Solución temporal:**
```javascript
// En el navegador, abre la consola y ejecuta:
localStorage.clear()
// Luego recarga la página
```

### Problema: "No puedo añadir usuarios con verify_users.sh"

**Verificar:**
```bash
# Asegúrate de estar en el entorno conda correcto
conda activate ml-training

# Verifica que auth.db existe
ls -la backend/data/auth/auth.db
```

---

## 📝 Cambios en el Código

### Archivos Modificados:

1. **`backend/config.py`**
   - ✅ Añadido `AUTH_DATABASE_PATH`

2. **`backend/services/database.py`**
   - ✅ Añadido `get_auth_db_connection()`
   - ✅ Añadido `init_auth_database()`
   - ✅ `init_database()` ahora **elimina** tabla `users` si existe

3. **`backend/routers/auth.py`**
   - ✅ Todos los endpoints usan `get_auth_db_connection()`
   - ✅ Login devuelve campo `role`
   - ✅ Profile devuelve campo `role`

4. **`backend/main.py`**
   - ✅ Inicializa AMBAS bases de datos al arrancar

5. **`reset_db.sh`**
   - ✅ Maneja ambas bases de datos
   - ✅ Verifica que users NO esté en trading.db

6. **`verify_users.sh`** (NUEVO)
   - ✅ Ver usuarios
   - ✅ Añadir usuarios
   - ✅ Verificar estructura

---

## 🎯 Próximos Pasos

Una vez que confirmes que todo funciona:

1. **Implementar Control de Acceso por Roles**
   - Restringir ciertas funcionalidades a `admin` solamente
   - Ejemplo: solo admin puede crear usuarios, cambiar configuraciones críticas

2. **Arreglar Dropdown de Usuario (si sigue el problema)**
   - Asegurar que el Header se re-renderiza cuando cambia el usuario
   - Mejorar la sincronización entre AuthContext y componentes

3. **Migrar a PostgreSQL** (opcional, para producción)
   - Mejor rendimiento
   - Mejor manejo de concurrencia

---

## 📞 Reportar Problemas

Si encuentras algún problema:

1. Ejecuta `./verify_users.sh` (opción 3) y comparte el output
2. Comparte los logs del backend (lo que sale en la terminal)
3. Revisa el DevTools del navegador (Console y Network tabs)

**¡Todo debe funcionar correctamente ahora!** 🎉
