# 📚 Backend - GrupoVisualCont API

## Descripción General

Backend API RESTful construido con **Express.js** y **MySQL** para la plataforma de blog y gestión de contenido de GrupoVisualCont. Proporciona servicios para la administración de noticias, keywords SEO, categorías, usuarios y comentarios.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Runtime**: Node.js >=18.x
- **Framework**: Express.js 4.18.2
- **Base de Datos**: MySQL 2 (mysql2)
- **Autenticación**: JWT (jose 6.1.3) + bcryptjs
- **Middleware**: CORS, Cookie Parser, dotenv

### Estructura del Proyecto

```
grupovisualcont-api/
├── src/
│   ├── server.js                 # Punto de entrada del servidor
│   ├── config/
│   │   └── db.js                 # Configuración del pool de conexiones MySQL
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación JWT
│   └── routes/
│       ├── auth.js               # Endpoints de autenticación
│       ├── autores.js            # Gestión de autores
│       ├── categorias.js         # Gestión de categorías
│       ├── comentarios.js        # Gestión de comentarios
│       ├── generar-keywords.js   # Generación de keywords con IA
│       ├── keywords.js           # CRUD de keywords
│       ├── noticias.js           # CRUD de noticias
│       ├── pages.js              # Keywords por página (SEO)
│       ├── servicios.js          # Gestión de servicios
│       └── usuarios.js           # Gestión de usuarios
├── database/
│   └── schema.sql                # Esquema completo de la BD
├── docs/                         # Documentación
├── package.json
├── vercel.json                   # Configuración de despliegue Vercel
└── .env                          # Variables de entorno
```

## 🔧 Configuración

### Variables de Entorno

```env
# Base de Datos
DATABASE_URL=mysql://usuario:password@host:puerto/database
# O separadas:
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=password
DB_NAME=visualcont_blog

# Autenticación
JWT_SECRET=tu-secret-super-seguro-aqui

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://grupovisualcont.com

# Servidor
PORT=3001
NODE_ENV=development
```

### Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd grupovisualcont-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar base de datos (ejecutar schema.sql)
mysql -u usuario -p database_name < database/schema.sql

# 5. Iniciar servidor
npm run dev  # Desarrollo con nodemon
npm start    # Producción
```

## 🚀 Características Principales

### 1. **Gestión de Noticias**
- CRUD completo de noticias
- Sistema de borradores y publicaciones
- Generación automática de slugs SEO-friendly
- Generación automática de descripciones cortas
- Asociación con categorías, servicios y keywords
- Búsqueda por slug público

### 2. **Sistema de Keywords SEO**
- Gestión centralizada de keywords
- Asociación keywords ↔ noticias (N:M)
- Asociación keywords ↔ servicios (N:M)
- Keywords por página (home, contable, erp, etc.)
- Generación inteligente con IA (Groq API)
- Búsqueda y autocomplete

### 3. **Autenticación y Autorización**
- Login con JWT y cookies HttpOnly
- Roles: admin y editor
- Protección de rutas con middleware
- Soporte para Bearer Token y cookies
- Expiración de tokens (7 días)
- Hash de contraseñas con bcrypt

### 4. **Gestión de Comentarios**
- Sistema de moderación (aprobado/pendiente/spam)
- Comentarios públicos y privados
- Asociación con noticias y autores
- Estados: 1=Aprobado, 2=En espera, 3=Spam

### 5. **Sistema Multi-Autor**
- Autores internos y externos
- Gestión independiente de usuarios backend

### 6. **CORS Avanzado**
- Lista de orígenes permitidos configurable
- Soporte de credenciales (cookies)
- Manejo de preflight requests
- Logs detallados de CORS

## 📦 Dependencias Principales

```json
{
  "express": "^4.18.2",        // Framework web
  "mysql2": "^3.16.0",         // Cliente MySQL con soporte async/await
  "jose": "^6.1.3",            // JWT moderno y seguro
  "bcryptjs": "^3.0.3",        // Hash de contraseñas
  "cors": "^2.8.5",            // CORS middleware
  "cookie-parser": "^1.4.7",   // Parsing de cookies
  "dotenv": "^17.2.3"          // Variables de entorno
}
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT firmados con HS256
- ✅ Tokens en cookies HttpOnly
- ✅ Validación de entrada en todos los endpoints
- ✅ CORS configurado con whitelist
- ✅ Pool de conexiones con límites
- ✅ Separación de roles (admin/editor)
- ✅ Protección contra SQL injection (prepared statements)

## 📊 Flujo de Datos

```
Cliente (Frontend)
    ↓
[CORS Middleware]
    ↓
[Cookie Parser]
    ↓
[Body Parser]
    ↓
[Rutas]
    ↓
[Auth Middleware] (si requiere autenticación)
    ↓
[Controlador]
    ↓
[Database Pool]
    ↓
MySQL Database
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/health

# Info del API
curl http://localhost:3001/

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visualcont.com","password":"admin123"}'
```

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Manual

```bash
# Build
npm install --production

# Iniciar
NODE_ENV=production node src/server.js
```

## 📈 Monitoreo

- **Health Check**: `GET /health`
- **Logs**: Console.log en desarrollo
- **Métricas**: Pool de conexiones (max 10 conexiones)

## 🔄 Versionado

- Versión actual: **1.0.0**
- Node.js requerido: **>=18.x**

## 📝 Módulos Relacionados

- [Servidor Express](./SERVER.md)
- [Documentación API](./API.md)
- [Base de Datos](./DATABASE.md)
- [Autenticación](./AUTHENTICATION.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Propietario: GrupoVisualCont
