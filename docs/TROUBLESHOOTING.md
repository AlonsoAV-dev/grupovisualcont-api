# 🔧 Solución de Problemas - GrupoVisualCont API

Guía para resolver problemas comunes y errores frecuentes.

## 📋 Índice

1. [Problemas de Conexión](#-problemas-de-conexión)
2. [Errores de Autenticación](#-errores-de-autenticación)
3. [Errores de Base de Datos](#-errores-de-base-de-datos)
4. [Problemas de CORS](#-problemas-de-cors)
5. [Errores de Permisos](#-errores-de-permisos)
6. [Problemas de Despliegue](#-problemas-de-despliegue)

---

## 🌐 Problemas de Conexión

### Problema 1: "Error: connect ECONNREFUSED"

**Síntoma**: El servidor no puede conectarse a la base de datos MySQL.

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Causas posibles**:
1. MySQL no está corriendo
2. Puerto incorrecto
3. Host incorrecto
4. Firewall bloqueando conexión

**Soluciones**:

```bash
# 1. Verificar que MySQL esté corriendo
# Windows
net start MySQL

# Linux/Mac
sudo service mysql start
# O
brew services start mysql

# 2. Verificar puerto MySQL
mysql -u root -p -e "SHOW VARIABLES LIKE 'port';"

# 3. Verificar configuración en .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=visualcont_blog

# 4. Probar conexión manual
mysql -h localhost -P 3306 -u tu_usuario -p visualcont_blog
```

---

### Problema 2: "Error: Cannot find module"

**Síntoma**: Error al iniciar el servidor.

```
Error: Cannot find module 'express'
```

**Solución**:

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de npm
npm cache clean --force
npm install
```

---

### Problema 3: Puerto 3001 ya en uso

**Síntoma**: El servidor no puede iniciar en el puerto 3001.

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Soluciones**:

```bash
# Opción 1: Encontrar y matar el proceso
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti :3001 | xargs kill -9

# Opción 2: Cambiar puerto en .env
PORT=3002
```

---

## 🔐 Errores de Autenticación

### Problema 1: "Token inválido o expirado"

**Síntoma**: Requests autenticados fallan con 401.

```json
{
  "error": "Token inválido o expirado"
}
```

**Causas**:
- Token expirado (7 días)
- JWT_SECRET incorrecto
- Token mal formateado

**Soluciones**:

```javascript
// 1. Hacer login nuevamente
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});

// 2. Verificar formato del token
// Debe ser: Bearer <token>
headers: {
  'Authorization': `Bearer ${token}` // ✅ Correcto
  // 'Authorization': token          // ❌ Incorrecto
}

// 3. Verificar JWT_SECRET en .env
JWT_SECRET=tu-secret-super-seguro-aqui
```

---

### Problema 2: "No autorizado"

**Síntoma**: Error 401 en rutas protegidas.

```json
{
  "error": "No autorizado"
}
```

**Causas**:
- Token no enviado
- Cookie no configurada correctamente
- CORS bloqueando cookies

**Soluciones**:

```javascript
// 1. Asegurar que se envían credenciales
fetch('http://localhost:3001/api/noticias', {
  credentials: 'include', // ✅ Importante
});

// 2. Verificar cookie en DevTools
// Application → Cookies → localhost

// 3. O usar Bearer token
const token = localStorage.getItem('token');
fetch('http://localhost:3001/api/noticias', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// 4. Verificar CORS permite credentials
// En servidor: credentials: true
```

---

### Problema 3: "Credenciales inválidas"

**Síntoma**: Login falla con 401.

```json
{
  "error": "Credenciales inválidas"
}
```

**Causas**:
- Email o password incorrectos
- Usuario inactivo (estado = 0)
- Password hash incorrecto

**Soluciones**:

```bash
# 1. Verificar usuario en base de datos
mysql -u usuario -p visualcont_blog
SELECT * FROM usuarios WHERE email = 'admin@visualcont.com';

# 2. Verificar estado del usuario
SELECT email, estado FROM usuarios;
# estado debe ser 1

# 3. Resetear password si es necesario
# Generar hash en Node.js
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('nuevaPassword', 10).then(console.log);"

# Actualizar en BD
UPDATE usuarios SET password = '$2a$10$...' WHERE email = 'admin@visualcont.com';
```

---

## 🗄️ Errores de Base de Datos

### Problema 1: "Access denied for user"

**Síntoma**: Error de permisos en MySQL.

```
Error: Access denied for user 'usuario'@'localhost'
```

**Soluciones**:

```sql
-- 1. Crear usuario con permisos correctos
CREATE USER 'usuario'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON visualcont_blog.* TO 'usuario'@'localhost';
FLUSH PRIVILEGES;

-- 2. Verificar permisos
SHOW GRANTS FOR 'usuario'@'localhost';

-- 3. Si usas '%' en lugar de 'localhost'
CREATE USER 'usuario'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON visualcont_blog.* TO 'usuario'@'%';
FLUSH PRIVILEGES;
```

---

### Problema 2: "Unknown database"

**Síntoma**: La base de datos no existe.

```
Error: Unknown database 'visualcont_blog'
```

**Solución**:

```bash
# Crear base de datos y ejecutar schema
mysql -u usuario -p -e "CREATE DATABASE IF NOT EXISTS visualcont_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u usuario -p visualcont_blog < database/schema.sql

# O ejecutar manualmente
mysql -u usuario -p
CREATE DATABASE visualcont_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE visualcont_blog;
SOURCE database/schema.sql;
```

---

### Problema 3: "Too many connections"

**Síntoma**: Pool de conexiones agotado.

```
Error: Too many connections
```

**Soluciones**:

```javascript
// 1. Aumentar connectionLimit en db.js
pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 20, // Aumentar de 10 a 20
  queueLimit: 0,
});

// 2. Verificar que queries usan await correctamente
// ❌ Incorrecto (no libera conexión)
const query = pool.query('SELECT * FROM noticias');

// ✅ Correcto
const [results] = await pool.execute('SELECT * FROM noticias');

// 3. Aumentar max_connections en MySQL
mysql -u root -p -e "SET GLOBAL max_connections = 200;"
```

---

## 🌐 Problemas de CORS

### Problema 1: "No permitido por CORS"

**Síntoma**: Request bloqueado por CORS.

```
Access to fetch at 'http://localhost:3001/api/noticias' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Causas**:
- Origen no autorizado
- Credentials no configurados
- Preflight fallando

**Soluciones**:

```javascript
// 1. Agregar origen al .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

// 2. O agregar en server.js
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://tudominio.com',
];

// 3. Verificar credentials en cliente
fetch('http://localhost:3001/api/noticias', {
  credentials: 'include', // ✅ Importante
});

// 4. Verificar OPTIONS request
// DevTools → Network → Ver request OPTIONS
```

---

### Problema 2: Cookies no se envían entre dominios

**Síntoma**: Cookie JWT no se incluye en requests.

**Causas**:
- SameSite bloqueando cookie
- Credentials no configurados
- Dominios diferentes

**Soluciones**:

```javascript
// 1. En el servidor (server.js)
res.cookie('token', token, {
  httpOnly: true,
  secure: false, // false en desarrollo
  sameSite: 'lax', // 'lax' para desarrollo, 'none' para producción cross-domain
  domain: 'localhost',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
});

// 2. En el cliente
fetch('http://localhost:3001/api/noticias', {
  credentials: 'include', // ✅ Siempre incluir
});

// 3. Para producción con dominios diferentes
// Backend
res.cookie('token', token, {
  httpOnly: true,
  secure: true, // HTTPS requerido
  sameSite: 'none', // Permite cross-domain
});

// Frontend
fetch('https://api.tudominio.com/api/noticias', {
  credentials: 'include',
});
```

---

## 🔒 Errores de Permisos

### Problema 1: "Acceso denegado"

**Síntoma**: Error 403 en rutas de admin.

```json
{
  "error": "Acceso denegado. Se requiere rol de admin."
}
```

**Causas**:
- Usuario no es admin
- Token de usuario con rol incorrecto

**Soluciones**:

```sql
-- 1. Verificar rol del usuario
SELECT email, rol FROM usuarios WHERE email = 'tu@email.com';

-- 2. Cambiar rol a admin
UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@email.com';

-- 3. Hacer login nuevamente para obtener nuevo token
```

---

### Problema 2: "Cannot read property 'rol' of undefined"

**Síntoma**: Error al verificar rol del usuario.

**Causa**: `req.user` no está disponible (middleware de auth no ejecutado).

**Solución**:

```javascript
// Verificar que requireAuth esté antes del controlador
// ✅ Correcto
router.post('/usuarios', requireAuth, requireAdmin, async (req, res) => {
  // req.user está disponible
});

// ❌ Incorrecto
router.post('/usuarios', async (req, res) => {
  if (req.user?.rol !== 'admin') { // req.user es undefined
    return res.status(403).json({ error: 'Acceso denegado' });
  }
});
```

---

## 🚀 Problemas de Despliegue

### Problema 1: Error en Vercel - "Cannot find module"

**Síntoma**: Build falla en Vercel.

**Causas**:
- Dependencias en devDependencies
- Import paths incorrectos

**Soluciones**:

```json
// 1. Mover dependencias necesarias a dependencies
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.16.0"
    // NO en devDependencies
  }
}

// 2. Verificar imports usan .js
import { query } from '../config/db.js'; // ✅ Con .js
import { query } from '../config/db';    // ❌ Sin .js puede fallar

// 3. Verificar vercel.json
{
  "version": 2,
  "builds": [{ "src": "src/server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.js" }]
}
```

---

### Problema 2: Variables de entorno no funcionan en producción

**Síntoma**: Conexión a BD falla en producción.

**Soluciones**:

```bash
# 1. En Vercel Dashboard
# Project Settings → Environment Variables
# Agregar todas las variables:
DATABASE_URL=mysql://...
JWT_SECRET=...
ALLOWED_ORIGINS=https://tudominio.com
NODE_ENV=production

# 2. Redeploy después de agregar variables
vercel --prod

# 3. Verificar que están disponibles
console.log('DB_HOST:', process.env.DB_HOST);
```

---

### Problema 3: Timeout en requests a base de datos

**Síntoma**: Requests tardan mucho o timeout en producción.

**Causas**:
- Base de datos en región diferente
- Límites de conexión
- Queries lentas

**Soluciones**:

```javascript
// 1. Agregar timeout a pool de conexiones
pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  connectTimeout: 10000, // 10 segundos
  queueLimit: 0,
});

// 2. Optimizar queries
// ❌ Lento
SELECT * FROM noticias n
LEFT JOIN noticia_keyword nk ON n.id_noticia = nk.id_noticia
LEFT JOIN keywords k ON nk.id_keyword = k.id_keyword;

// ✅ Rápido con LIMIT
SELECT * FROM noticias n
LEFT JOIN noticia_keyword nk ON n.id_noticia = nk.id_noticia
LEFT JOIN keywords k ON nk.id_keyword = k.id_keyword
LIMIT 20;

// 3. Agregar índices en BD
CREATE INDEX idx_noticias_estado ON noticias(estado);
CREATE INDEX idx_noticias_fecha ON noticias(fecha_publicacion);
```

---

## 🧪 Herramientas de Debugging

### 1. Logs Detallados

```javascript
// Agregar logs en puntos críticos
console.log('📊 Variables de entorno:', {
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET ? '✅ Configurado' : '❌ Falta',
});

console.log('🔍 Request:', {
  method: req.method,
  url: req.url,
  headers: req.headers,
  body: req.body,
});
```

### 2. Testing de Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visualcont.com","password":"admin123"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Test con token
TOKEN="tu-token-aqui"
curl http://localhost:3001/api/noticias \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"
```

### 3. Verificar Estado del Sistema

```bash
# Verificar Node.js
node --version  # Debe ser >=18

# Verificar MySQL
mysql --version
mysql -u usuario -p -e "SELECT VERSION();"

# Verificar puerto servidor
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# Verificar procesos Node
tasklist | findstr node       # Windows
ps aux | grep node            # Linux/Mac
```

---

## 📚 Recursos Adicionales

- [Documentación API](./API.md)
- [Autenticación](./AUTHENTICATION.md)
- [Base de Datos](./DATABASE.md)
- [Ejemplos de Uso](./EXAMPLES.md)

---

## 🆘 Soporte

Si el problema persiste después de probar estas soluciones:

1. Revisar logs del servidor (`console.log` o logs de Vercel)
2. Verificar logs de MySQL
3. Probar en ambiente local antes de producción
4. Revisar configuración de CORS y autenticación
5. Verificar variables de entorno

---

**Última actualización**: Febrero 2026
