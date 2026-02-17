# 🖥️ Servidor Express - Configuración y Middleware

## Descripción

Servidor HTTP construido con Express.js que maneja todas las peticiones del API, configuración de CORS, middleware de autenticación y rutas.

Archivo principal: [`src/server.js`](../src/server.js)

## 🔧 Configuración del Servidor

### Inicialización

```javascript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3001;
```

### Puerto

- **Por defecto**: 3001
- **Configurable**: Variable `PORT` en `.env`
- **Producción**: Automático en Vercel

## 🌐 Configuración CORS

### Orígenes Permitidos

El servidor implementa CORS avanzado con lista blanca de orígenes:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://grupovisualcont-admin.vercel.app',
      'https://grupovisualcont.com',
      'https://www.grupovisualcont.com',
      'https://grupovisualcont-prueba-ifjx.vercel.app',
      'https://pagina-web-grupo-visual-cont.vercel.app'
    ];
```

### Opciones CORS

```javascript
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // Devolver el origen específico
    } else {
      return callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,                    // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

### Características CORS

- ✅ **Whitelist de orígenes**: Solo dominios autorizados
- ✅ **Credenciales**: Soporte para cookies cross-origin
- ✅ **Métodos HTTP**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- ✅ **Headers**: Content-Type y Authorization
- ✅ **Logs**: Registro detallado de peticiones CORS
- ✅ **Herramientas**: Permite Postman/curl sin origin

## 📦 Middleware Global

### 1. Cookie Parser

Parsea cookies de las peticiones HTTP:

```javascript
app.use(cookieParser());
```

**Uso**: Obtener token JWT desde cookies

### 2. Body Parser (JSON)

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

**Límite**: 10MB para subida de imágenes base64

## 🛣️ Rutas Registradas

### Registro de Rutas

```javascript
// Autenticación
app.use('/api/auth', authRoutes);

// Keywords
app.use('/api/keywords', keywordsRoutes);
app.use('/api/keywords', generarKeywordsRoutes);

// Noticias
app.use('/api/noticias', noticiasRoutes);

// Categorías
app.use('/api/categorias', categoriasRoutes);

// Autores
app.use('/api/autores', autoresRoutes);

// Usuarios
app.use('/api/usuarios', usuariosRoutes);

// Servicios
app.use('/api/servicios', serviciosRoutes);

// Comentarios
app.use('/api/comentarios', comentariosRoutes);

// Page Keywords
app.use('/api/pages/keywords', pagesRoutes);
```

## 🏥 Health Check

### Endpoint de Salud

```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
```

**Respuesta**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

**Uso**: Monitoreo de disponibilidad del servidor

## 📋 Endpoint de Información

### Ruta Raíz

```javascript
app.get('/', (req, res) => {
  res.json({
    message: 'API GrupoVisualCont',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      keywords: '/api/keywords',
      keywordsGenerar: '/api/keywords/generar',
      noticias: '/api/noticias',
      noticiasPorSlug: '/api/noticias/slug/:slug',
      categorias: '/api/categorias',
      autores: '/api/autores',
      usuarios: '/api/usuarios',
      servicios: '/api/servicios',
      comentarios: '/api/comentarios',
      comentariosPublicos: '/api/comentarios/publicos',
      pageKeywords: '/api/pages/keywords'
    }
  });
});
```

## 🚀 Inicio del Servidor

### Código de Arranque

```javascript
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});
```

### Scripts NPM

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",      // Desarrollo con auto-reload
    "start": "node src/server.js",       // Producción
    "vercel-build": "echo 'Build complete'"
  }
}
```

## 🔍 Logging

### Logs CORS

```javascript
console.log('CORS - Orígenes permitidos:', allowedOrigins);
console.log('✅ CORS permitido para:', origin);
console.log('❌ CORS bloqueado para:', origin);
```

### Logs de Errores

Cada ruta implementa manejo de errores:

```javascript
catch (error) {
  console.error('Error:', error);
  return res.status(500).json({ error: 'Error en el servidor' });
}
```

## ⚙️ Variables de Entorno

### Variables del Servidor

```env
# Puerto del servidor
PORT=3001

# Entorno de ejecución
NODE_ENV=development

# Orígenes permitidos (separados por coma)
ALLOWED_ORIGINS=http://localhost:3000,https://tudominio.com

# JWT Secret
JWT_SECRET=tu-secret-super-seguro

# Base de datos
DATABASE_URL=mysql://user:pass@host:port/database
```

## 🔒 Seguridad

### Medidas Implementadas

1. **CORS Restrictivo**: Solo orígenes autorizados
2. **Límite de Payload**: 10MB máximo
3. **HttpOnly Cookies**: Tokens en cookies seguras
4. **Validación de Origin**: Logs y rechazo de orígenes no autorizados
5. **Headers Seguros**: Solo Content-Type y Authorization

## 📊 Flujo de Request

```
1. Cliente envía request
    ↓
2. [CORS Middleware] - Verifica origen
    ↓
3. [Cookie Parser] - Parsea cookies
    ↓
4. [Body Parser] - Parsea JSON/FormData
    ↓
5. [Router] - Encuentra ruta coincidente
    ↓
6. [Auth Middleware] - Verifica autenticación (si aplica)
    ↓
7. [Controlador] - Procesa lógica de negocio
    ↓
8. [Response] - Envía respuesta JSON
```

## 🧪 Testing del Servidor

### Verificar disponibilidad

```bash
curl http://localhost:3001/health
```

### Verificar CORS

```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:3001/api/noticias
```

### Info del API

```bash
curl http://localhost:3001/
```

## 🚢 Despliegue

### Vercel

El servidor funciona como Serverless Function en Vercel:

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

### Variables en Vercel

Configurar en: **Project Settings → Environment Variables**

- `DATABASE_URL`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `NODE_ENV=production`

## 🔄 Hot Reload (Desarrollo)

```bash
npm run dev
```

Nodemon detecta cambios en:
- `src/**/*.js`
- `.env`

Auto-reinicia el servidor.

## 📚 Recursos Relacionados

- [Configuración de Base de Datos](./DATABASE.md)
- [Middleware de Autenticación](./AUTHENTICATION.md)
- [Documentación de API](./API.md)
