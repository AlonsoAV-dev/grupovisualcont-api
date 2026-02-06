# GrupoVisualCont API

Backend API Express para GrupoVisualCont. Consume la misma base de datos MySQL que la aplicación Next.js.

## 🚀 Desarrollo Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:

```env
DATABASE_HOST=tu-servidor.banahosting.com
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password
DATABASE_NAME=tu_base_datos

JWT_SECRET=tu-secret-muy-seguro

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

PORT=3001
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor estará en `http://localhost:3001`

## 📡 Endpoints Disponibles

### Auth
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual

### Keywords
- `GET /api/keywords` - Listar keywords (con paginación y búsqueda)
- `GET /api/keywords/:id` - Obtener keyword
- `POST /api/keywords` - Crear keyword (requiere auth)
- `PUT /api/keywords/:id` - Actualizar keyword (requiere auth)
- `DELETE /api/keywords/:id` - Eliminar keyword (requiere auth)
- `POST /api/keywords/generar` - Generar keywords con IA Groq

### Noticias
- `GET /api/noticias` - Listar noticias (con paginación y filtros)
- `GET /api/noticias/:id` - Obtener noticia con keywords
- `GET /api/noticias/slug/:slug` - Obtener noticia por slug (público)
- `POST /api/noticias` - Crear noticia (requiere auth)
- `PUT /api/noticias/:id` - Actualizar noticia (requiere auth)
- `DELETE /api/noticias/:id` - Eliminar noticia (requiere auth)

### Categorías
- `GET /api/categorias` - Listar categorías
- `GET /api/categorias/:id` - Obtener categoría
- `POST /api/categorias` - Crear categoría (requiere auth)
- `PUT /api/categorias/:id` - Actualizar categoría (requiere auth)
- `DELETE /api/categorias/:id` - Eliminar categoría (requiere auth)

### Autores
- `GET /api/autores` - Listar autores activos

### Usuarios
- `GET /api/usuarios` - Listar usuarios (requiere auth admin)
- `POST /api/usuarios` - Crear usuario (requiere auth admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (requiere auth admin)
- `DELETE /api/usuarios/:id` - Eliminar usuario (requiere auth admin)

### Servicios
- `GET /api/servicios` - Listar servicios
- `GET /api/servicios/:id` - Obtener servicio
- `POST /api/servicios` - Crear servicio (requiere auth admin)
- `PUT /api/servicios/:id` - Actualizar servicio (requiere auth admin)
- `DELETE /api/servicios/:id` - Eliminar servicio (requiere auth admin)

### Comentarios
- `GET /api/comentarios` - Listar comentarios (admin)
- `GET /api/comentarios/publicos?noticia=1` - Comentarios públicos aprobados
- `POST /api/comentarios` - Crear comentario (público/autenticado)
- `PUT /api/comentarios/:id` - Cambiar estado (requiere auth)
- `DELETE /api/comentarios/:id` - Eliminar comentario (requiere auth admin)

### Page Keywords
- `GET /api/pages/keywords?page=contable` - Obtener keywords de página
- `POST /api/pages/keywords` - Actualizar keywords de página (requiere auth)

### Health
- `GET /health` - Health check
- `GET /` - Info del API y lista de endpoints

## 🔐 Autenticación

Las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

El token se obtiene del endpoint `/api/auth/login`.

## 🌐 Deploy en Vercel

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configura las variables de entorno en Vercel Dashboard:
   - `DATABASE_HOST`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` (incluye tus dominios de producción)

## 📁 Estructura

```
grupovisualcont-api/
├── src/
│   ├── config/
│   │   └── db.js          # Conexión a MySQL
│   ├── middleware/
│   │   └── auth.js        # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.js        # Rutas de autenticación
│   │   └── keywords.js    # Rutas de keywords
│   └── server.js          # Servidor Express
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

## 🔄 Rutas API Pendientes de Migración

Rutas que faltan migrar desde Next.js API:
- [ ] `/api/noticias/slug/:slug` - Obtener noticia por slug (web pública)
- [ ] `/api/servicios` - CRUD de servicios
- [ ] `/api/comentarios` - CRUD de comentarios
- [ ] `/api/comentarios/publicos` - Comentarios públicos
- [ ] `/api/keywords/generar` - Generar keywords con Gemini AI

## 📝 Notas

- El backend usa la misma base de datos que el proyecto Next.js actual
- Los tokens JWT tienen validez de 7 días
- CORS está configurado para permitir requests desde los frontends web y admin
- En desarrollo, también permite requests sin origin (Postman, curl)
