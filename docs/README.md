# 📚 Documentación - GrupoVisualCont API

Bienvenido a la documentación completa del backend API de GrupoVisualCont.

## 📖 Guías Disponibles

### 1. [BACKEND.md](./BACKEND.md) - Resumen General
**Descripción**: Vista general del proyecto, arquitectura, stack tecnológico y características principales.

**Contenido**:
- Descripción del proyecto
- Estructura de carpetas
- Stack tecnológico
- Variables de entorno
- Instrucciones de instalación
- Características principales
- Seguridad implementada
- Despliegue

**Ideal para**: Empezar a entender el proyecto desde cero.

---

### 2. [SERVER.md](./SERVER.md) - Configuración del Servidor
**Descripción**: Documentación detallada del servidor Express, middleware y configuraciones.

**Contenido**:
- Inicialización del servidor
- Configuración CORS avanzada
- Middleware global (body parser, cookie parser)
- Registro de rutas
- Health checks
- Logging y debugging
- Variables de entorno del servidor

**Ideal para**: Entender cómo funciona el servidor y configurar CORS.

---

### 3. [DATABASE.md](./DATABASE.md) - Base de Datos
**Descripción**: Esquema completo de MySQL, relaciones entre tablas y configuración del pool de conexiones.

**Contenido**:
- Estructura de todas las tablas
- Relaciones (foreign keys)
- Índices y optimizaciones
- Pool de conexiones MySQL
- Queries comunes
- Seguridad (prepared statements)
- Datos de ejemplo

**Ideal para**: Entender el modelo de datos y las relaciones.

---

### 4. [AUTHENTICATION.md](./AUTHENTICATION.md) - Sistema de Autenticación
**Descripción**: Implementación completa del sistema de autenticación JWT con roles y permisos.

**Contenido**:
- Generación y verificación de JWT
- Hash de contraseñas con bcrypt
- Middleware de autenticación
- Gestión de cookies HttpOnly
- Control de acceso por roles (RBAC)
- Endpoints de login/logout
- Seguridad y mejores prácticas

**Ideal para**: Implementar autenticación en el frontend o entender el flujo de seguridad.

---

### 5. [API.md](./API.md) - Documentación de Endpoints
**Descripción**: Referencia completa de todos los endpoints REST disponibles con ejemplos de request/response.

**Contenido**:
- **Autenticación**: Login, logout, verificar sesión
- **Noticias**: CRUD completo, búsqueda por slug, paginación
- **Keywords**: Gestión de keywords SEO, búsqueda, generación con IA
- **Categorías**: CRUD de categorías de noticias
- **Autores**: Lista de autores
- **Usuarios**: Gestión de usuarios del sistema (admin)
- **Servicios**: CRUD de servicios de la empresa
- **Comentarios**: Sistema de comentarios con moderación
- **Page Keywords**: Keywords SEO por página estática
- **Health Check**: Verificación del estado del servidor

**Ideal para**: Consumir la API desde el frontend o herramientas como Postman.

---

## 🚀 Guía de Inicio Rápido

### 1. Configurar el Entorno

```bash
# Clonar e instalar
git clone <repo-url>
cd grupovisualcont-api
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Iniciar Base de Datos

```bash
# Ejecutar schema.sql
mysql -u usuario -p database_name < database/schema.sql
```

### 3. Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 4. Verificar Funcionamiento

```bash
# Health check
curl http://localhost:3001/health

# Info del API
curl http://localhost:3001/
```

---

## 📡 Endpoints Principales

| Módulo | Endpoint Base | Auth | Descripción |
|--------|---------------|------|-------------|
| Auth | `/api/auth` | ❌ | Login, logout, sesión |
| Noticias | `/api/noticias` | ✅ | CRUD de artículos |
| Keywords | `/api/keywords` | ✅ | Gestión SEO keywords |
| Categorías | `/api/categorias` | ✅ | Categorías blog |
| Autores | `/api/autores` | ❌ | Lista autores |
| Usuarios | `/api/usuarios` | ✅ Admin | Gestión usuarios |
| Servicios | `/api/servicios` | ✅ Admin | Servicios empresa |
| Comentarios | `/api/comentarios` | ⚡ | Sistema comentarios |
| Pages | `/api/pages/keywords` | ✅ | SEO páginas |

**Leyenda**: 
- ❌ Público
- ✅ Requiere autenticación
- ⚡ Híbrido (público + admin)

---

## 🔐 Autenticación

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visualcont.com","password":"admin123"}'
```

### Usar Token

```bash
# Método 1: Bearer Token
curl http://localhost:3001/api/noticias \
  -H "Authorization: Bearer <token>"

# Método 2: Cookie
curl http://localhost:3001/api/noticias \
  -b "token=<token>"
```

---

## 🗄️ Modelo de Datos

```
usuarios (backend auth)
    ↓
autor → noticias ← categorias
           ↓
    noticia_keyword
           ↓
       keywords ← servicio_keyword → servicios
           ↓
    page_keywords
           ↓
    comentarios → autor
```

**Relaciones clave**:
- Noticias N:1 Categorías
- Noticias N:1 Autor
- Noticias N:M Keywords
- Servicios N:M Keywords
- Comentarios N:1 Noticias

---

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js >=18.x
- **Framework**: Express.js 4.18
- **Base de Datos**: MySQL (mysql2)
- **Autenticación**: JWT (jose) + bcryptjs
- **CORS**: cors middleware
- **Cookies**: cookie-parser

---

## 🔒 Seguridad

✅ **Implementado**:
- Contraseñas hasheadas (bcrypt)
- JWT firmados (HS256)
- HttpOnly cookies
- CORS con whitelist
- Prepared statements (SQL injection)
- Roles y permisos (RBAC)
- Validación de entrada

---

## 📦 Scripts Disponibles

```json
{
  "dev": "nodemon src/server.js",      // Desarrollo con hot-reload
  "start": "node src/server.js",       // Producción
  "vercel-build": "echo 'Build complete'"
}
```

---

## 🌐 URLs

- **Local**: http://localhost:3001
- **Producción**: https://api.grupovisualcont.com (si aplica)

---

## 📞 Soporte

Para preguntas o problemas, consulta:
1. [BACKEND.md](./BACKEND.md) - Overview general
2. [API.md](./API.md) - Documentación de endpoints
3. [AUTHENTICATION.md](./AUTHENTICATION.md) - Sistema de autenticación
4. [DATABASE.md](./DATABASE.md) - Estructura de datos
5. [SERVER.md](./SERVER.md) - Configuración del servidor

---

## 📄 Licencia

Propietario: GrupoVisualCont

---

## 🗺️ Flujo de Lectura Recomendado

### Para Desarrolladores Backend:
1. [BACKEND.md](./BACKEND.md) - Entender la arquitectura
2. [DATABASE.md](./DATABASE.md) - Modelo de datos
3. [SERVER.md](./SERVER.md) - Configuración del servidor
4. [AUTHENTICATION.md](./AUTHENTICATION.md) - Sistema de seguridad
5. [API.md](./API.md) - Endpoints completos

### Para Desarrolladores Frontend:
1. [API.md](./API.md) - Endpoints disponibles
2. [AUTHENTICATION.md](./AUTHENTICATION.md) - Cómo autenticarse
3. [DATABASE.md](./DATABASE.md) - Entender el modelo de datos

### Para DevOps:
1. [BACKEND.md](./BACKEND.md) - Stack y dependencias
2. [SERVER.md](./SERVER.md) - Variables de entorno
3. [DATABASE.md](./DATABASE.md) - Schema y configuración de BD

---

**Última actualización**: Febrero 2026  
**Versión API**: 1.0.0  
**Node.js requerido**: >=18.x
