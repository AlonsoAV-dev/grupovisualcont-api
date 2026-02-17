# 🔐 Autenticación - JWT y Control de Acceso

## Descripción

Sistema de autenticación basado en **JWT (JSON Web Tokens)** con soporte de cookies HttpOnly y Bearer tokens. Implementa control de acceso basado en roles (RBAC) con niveles `admin` y `editor`.

Archivo principal: [`src/middleware/auth.js`](../src/middleware/auth.js)

## 🏗️ Arquitectura de Autenticación

### Flujo de Autenticación

```
1. Usuario envía credenciales
    ↓
2. Verificar email y password
    ↓
3. Generar JWT token
    ↓
4. Establecer cookie HttpOnly
    ↓
5. Retornar token + datos usuario
```

## 🔑 Gestión de Contraseñas

### 1. Hash de Contraseñas

```javascript
import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
```

**Características**:
- ✅ Algoritmo: bcrypt
- ✅ Salt rounds: 10
- ✅ Hash seguro de 60 caracteres

**Uso**:
```javascript
const hash = await hashPassword('miPassword123');
// $2a$10$rKZL8xqJYXZ5YQJ5YQJ5YOZqJYXZ5YQJ5YQJ5YOZqJYXZ5YQJ5YQJ
```

### 2. Verificación de Contraseñas

```javascript
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

**Returns**: `true` si coincide, `false` si no

---

## 🎫 JWT (JSON Web Tokens)

### Librería: jose

Se utiliza `jose` en lugar de `jsonwebtoken` por:
- ✅ Mejor soporte para ES Modules
- ✅ Más seguro y moderno
- ✅ API más simple

### Secret Key

```javascript
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
```

**⚠️ Importante**: El secret debe ser una cadena larga y aleatoria.

---

### 1. Crear Token

```javascript
import { SignJWT } from 'jose';

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}
```

**Configuración**:
- **Algoritmo**: HS256 (HMAC SHA-256)
- **Expiración**: 7 días
- **Issued At**: Timestamp de creación

**Payload típico**:
```javascript
{
  id: 1,
  email: 'admin@visualcont.com',
  nombre: 'Administrador',
  rol: 'admin'
}
```

### 2. Verificar Token

```javascript
import { jwtVerify } from 'jose';

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
```

**Returns**:
- `payload` si es válido
- `null` si es inválido o expirado

---

## 🍪 Gestión de Cookies

### Configuración de Cookie

```javascript
res.cookie('token', token, {
  httpOnly: true,                        // No accesible desde JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS en producción
  sameSite: 'lax',                       // Protección CSRF
  domain: 'localhost',                   // Dominio (sin puerto)
  path: '/',                             // Toda la aplicación
  maxAge: 24 * 60 * 60 * 1000           // 24 horas
});
```

**Características de seguridad**:
- ✅ **httpOnly**: Previene acceso XSS
- ✅ **secure**: Solo HTTPS en producción
- ✅ **sameSite**: Protección CSRF
- ✅ **maxAge**: Expiración automática

### Eliminar Cookie

```javascript
res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: 'localhost',
  path: '/'
});
```

---

## 🛡️ Middleware de Autenticación

### `requireAuth` - Proteger Rutas

```javascript
export async function requireAuth(req, res, next) {
  try {
    // 1. Obtener token desde cookie o header
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    // 2. Validar existencia de token
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    // 3. Verificar y decodificar token
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    // 4. Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en auth middleware:', error);
    return res.status(500).json({ error: 'Error en autenticación' });
  }
}
```

**Uso**:
```javascript
import { requireAuth } from '../middleware/auth.js';

// Ruta protegida
router.post('/noticias', requireAuth, async (req, res) => {
  // req.user contiene los datos del token
  console.log(req.user.email); // admin@visualcont.com
});
```

### Soporte Dual: Cookie + Bearer Token

El middleware acepta tokens desde:

1. **Cookie** (prioridad alta):
   ```http
   Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Authorization Header** (fallback):
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 👥 Control de Acceso por Roles

### Roles Disponibles

1. **admin**: Acceso completo (usuarios, servicios, noticias, etc.)
2. **editor**: Acceso limitado (noticias, categorías, keywords)

### Middleware de Admin

```javascript
const requireAdmin = async (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de admin.' });
  }
  next();
};
```

**Uso**:
```javascript
// Solo admins
router.post('/usuarios', requireAuth, requireAdmin, async (req, res) => {
  // Crear usuario
});
```

### Verificación en Controlador

```javascript
router.post('/servicios', requireAuth, async (req, res) => {
  // Verificar rol manualmente
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  // Lógica del controlador
});
```

---

## 🔐 Endpoints de Autenticación

### 1. `POST /api/auth/login`

Inicia sesión y retorna JWT token.

**Request**:
```json
{
  "email": "admin@visualcont.com",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "nombre": "Administrador",
    "email": "admin@visualcont.com",
    "rol": "admin",
    "estado": 1,
    "ultimo_login": "2024-01-15T10:30:00.000Z",
    "creado_en": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:
- `400`: Email y/o contraseña faltantes
- `401`: Credenciales inválidas
- `500`: Error del servidor

**Comportamiento**:
1. Valida credenciales
2. Actualiza `ultimo_login`
3. Genera JWT token
4. Establece cookie HttpOnly
5. Retorna token y datos del usuario (sin password)

---

### 2. `POST /api/auth/logout`

Cierra sesión eliminando la cookie JWT.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

**Comportamiento**:
1. Limpia cookie `token`
2. Cliente debe eliminar token del localStorage si lo usa

---

### 3. `GET /api/auth/me`

Obtiene datos del usuario autenticado actual.

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@visualcont.com",
    "nombre": "Administrador",
    "rol": "admin",
    "iat": 1705315800,
    "exp": 1705920600
  }
}
```

**Errores**:
- `401`: No autenticado o token inválido

**Uso**: Verificar sesión activa en el frontend

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. ✅ **Contraseñas hasheadas**: bcrypt con 10 rounds
2. ✅ **JWT firmados**: HS256 con secret seguro
3. ✅ **HttpOnly Cookies**: Protección contra XSS
4. ✅ **SameSite**: Protección CSRF
5. ✅ **Expiración de tokens**: 7 días máximo
6. ✅ **HTTPS en producción**: Cookies secure
7. ✅ **Validación de usuarios**: Estado activo (estado = 1)
8. ✅ **Separación de roles**: RBAC implementado

### Prevención de Vulnerabilidades

**XSS (Cross-Site Scripting)**:
- Cookies HttpOnly (no accesibles desde JS)

**CSRF (Cross-Site Request Forgery)**:
- SameSite cookies
- Validación de origin en CORS

**SQL Injection**:
- Prepared statements en todas las queries

**Brute Force**:
- Hash bcrypt (computacionalmente costoso)

---

## 🧪 Testing de Autenticación

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visualcont.com","password":"admin123"}' \
  -c cookies.txt
```

### Acceder con Cookie

```bash
curl http://localhost:3001/api/noticias \
  -b cookies.txt
```

### Acceder con Bearer Token

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:3001/api/noticias \
  -H "Authorization: Bearer $TOKEN"
```

### Verificar Usuario Actual

```bash
curl http://localhost:3001/api/auth/me \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

## 🔄 Flujo Completo de Autenticación

```
Frontend                     Backend                      Database
   |                            |                             |
   |-- POST /api/auth/login -->|                             |
   |   {email, password}        |                             |
   |                            |-- SELECT usuario -------->|
   |                            |<---- {usuario, hash} ------|
   |                            |                             |
   |                            |-- bcrypt.compare() -->     |
   |                            |<-- true/false --------     |
   |                            |                             |
   |                            |-- UPDATE ultimo_login -->  |
   |                            |<-- OK ------------------   |
   |                            |                             |
   |                            |-- createToken() ------>    |
   |                            |<-- JWT -------------        |
   |                            |                             |
   |<-- Set-Cookie: token       |                             |
   |    {usuario, token}        |                             |
   |                            |                             |
   |-- GET /api/noticias ------>|                             |
   |   Cookie: token=...        |                             |
   |                            |-- verifyToken() ------>    |
   |                            |<-- {id, rol} ----------    |
   |                            |                             |
   |                            |-- SELECT noticias ----->   |
   |                            |<-- [noticias] ----------   |
   |<-- {success, noticias}     |                             |
```

---

## 📚 Recursos Relacionados

- [Backend General](./BACKEND.md)
- [Servidor Express](./SERVER.md)
- [Documentación API](./API.md)
- [Base de Datos](./DATABASE.md)
