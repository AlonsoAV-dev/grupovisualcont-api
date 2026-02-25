# 📚 Documentación API - GrupoVisualCont

**Base URL:** `http://localhost:3001` (desarrollo) | `https://tu-dominio.com` (producción)

**Última actualización:** 23 de Febrero, 2026

---

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT que se obtiene al hacer login.

**Formato del Header:**
```
Authorization: Bearer <token>
```

**Contenido del Token JWT:**
```javascript
{
  id: number,           // ID del usuario
  email: string,        // Email del usuario
  nombre: string,       // Nombre del usuario
  rol: "admin" | "editor"  // Rol del usuario
}
```

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación-endpoints)
2. [Noticias](#noticias-endpoints)
3. [Comentarios](#comentarios-endpoints)
4. [Categorías](#categorías-endpoints)
5. [Autores](#autores-endpoints)
6. [Keywords](#keywords-endpoints)
7. [Usuarios](#usuarios-endpoints)
8. [Servicios](#servicios-endpoints)
9. [Pages Keywords](#pages-keywords-endpoints)
10. [Códigos de Estado](#códigos-de-estado)
11. [Permisos por Rol](#permisos-por-rol)

---

## 🔑 Autenticación Endpoints

### POST /api/auth/login
Inicia sesión y obtiene el token JWT.

**Acceso:** Público

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "nombre": "Usuario Admin",
    "email": "usuario@example.com",
    "rol": "admin",
    "estado": 1,
    "creado_en": "2024-01-15T10:00:00.000Z",
    "ultimo_login": "2024-02-23T14:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `400`: Email y contraseña son requeridos
- `401`: Credenciales inválidas

---

### POST /api/auth/logout
Cierra la sesión del usuario.

**Acceso:** Público

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

### GET /api/auth/me
Obtiene la información del usuario autenticado actual.

**Acceso:** 🔒 Requiere autenticación

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Usuario Admin",
    "rol": "admin"
  }
}
```

**Errores:**
- `401`: No autenticado / Token inválido

---

## 📰 Noticias Endpoints

### GET /api/noticias
Lista todas las noticias con paginación y filtros.

**Acceso:** Público

**Query Parameters:**
- `estado` (opcional): `publicada` | `borrador`
- `servicio` (opcional): ID del servicio
- `categoria` (opcional): ID de la categoría
- `orderBy` (opcional): `fecha_publicacion` | `creado_en` (default: `fecha_publicacion`)
- `page` (opcional): Número de página (default: `1`)
- `limit` (opcional): Resultados por página (default: `20`)

**Ejemplo:**
```
GET /api/noticias?estado=publicada&categoria=2&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "noticias": [
    {
      "id_noticia": 1,
      "cod_unico": "NOT-1234567890-abc123",
      "titulo": "Título de la noticia",
      "slug": "titulo-de-la-noticia",
      "descripcion_corta": "Resumen de la noticia...",
      "imagen_principal": "https://drive.google.com/thumbnail?sz=w1500-h1200&id=...",
      "estado": "publicada",
      "fecha_publicacion": "2024-02-20T10:00:00.000Z",
      "creado_en": "2024-02-18T08:30:00.000Z",
      "id_categoria": 2,
      "autor_nombre": "Juan Pérez",
      "autor_id_usuario": 5,
      "categoria_nombre": "Tecnología",
      "categoria_slug": "tecnologia"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### GET /api/noticias/slug/:slug
Obtiene una noticia por su slug (para páginas públicas).

**Acceso:** Público

**Ejemplo:**
```
GET /api/noticias/slug/titulo-de-la-noticia
```

**Response (200 OK):**
```json
{
  "success": true,
  "noticia": {
    "id_noticia": 1,
    "cod_unico": "NOT-1234567890-abc123",
    "titulo": "Título de la noticia",
    "slug": "titulo-de-la-noticia",
    "contenido": "<p>Contenido completo HTML...</p>",
    "descripcion_corta": "Resumen...",
    "imagen_principal": "https://...",
    "estado": "publicada",
    "fecha_publicacion": "2024-02-20T10:00:00.000Z",
    "creado_en": "2024-02-18T08:30:00.000Z",
    "id_categoria": 2,
    "autor_nombre": "Juan Pérez",
    "autor_email": "juan@example.com",
    "autor_id_usuario": 5,
    "categoria_nombre": "Tecnología",
    "categoria_slug": "tecnologia",
    "keywords": [
      { "id_keyword": 1, "nombre": "tecnología" },
      { "id_keyword": 5, "nombre": "innovación" }
    ]
  }
}
```

**Errores:**
- `404`: Noticia no encontrada

---

### GET /api/noticias/:id
Obtiene una noticia por su ID (para administración).

**Acceso:** Público

**Response (200 OK):**
```json
{
  "success": true,
  "noticia": {
    "id_noticia": 1,
    "cod_unico": "NOT-1234567890-abc123",
    "titulo": "Título de la noticia",
    "slug": "titulo-de-la-noticia",
    "contenido": "<p>Contenido completo...</p>",
    "descripcion_corta": "Resumen...",
    "imagen_principal": "https://...",
    "id_categoria": 2,
    "id_servicio": null,
    "id_autor": 3,
    "estado": "publicada",
    "fecha_publicacion": "2024-02-20T10:00:00.000Z",
    "creado_en": "2024-02-18T08:30:00.000Z",
    "autor_nombre": "Juan Pérez",
    "autor_id_usuario": 5,
    "categoria_nombre": "Tecnología",
    "categoria_slug": "tecnologia",
    "keywords": [
      { "id_keyword": 1, "nombre": "tecnología" },
      { "id_keyword": 5, "nombre": "innovación" }
    ]
  }
}
```

**Errores:**
- `404`: Noticia no encontrada

---

### POST /api/noticias
Crea una nueva noticia. El autor se asigna automáticamente según el usuario autenticado.

**Acceso:** 🔒 Requiere autenticación (Admin o Editor)

**Body:**
```json
{
  "titulo": "Título de la noticia",
  "contenido": "<p>Contenido HTML de la noticia...</p>",
  "imagen_principal": "https://drive.google.com/file/d/ABC123/view",
  "id_categoria": 2,
  "estado": "publicada",
  "keywords": [1, 5, "nueva keyword"]
}
```

**Campos:**
- `titulo` (requerido): Título de la noticia
- `contenido` (requerido): Contenido HTML
- `imagen_principal` (opcional): URL de la imagen (se convierte automáticamente si es Google Drive)
- `id_categoria` (opcional): ID de la categoría
- `estado` (opcional): `publicada` | `borrador` (default: `borrador`)
- `keywords` (opcional): Array de IDs de keywords existentes o nombres de nuevas keywords

**Nota:** El autor se obtiene automáticamente del usuario autenticado. El usuario debe tener un registro asociado en la tabla `autor`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Noticia creada correctamente",
  "id_noticia": 15
}
```

**Errores:**
- `400`: Campos requeridos faltantes, URL de imagen inválida, o usuario sin autor asociado
- `401`: No autenticado

---

### PUT /api/noticias/:id
Actualiza una noticia existente.

**Acceso:** 🔒 Requiere autenticación
- **Admin**: Puede editar cualquier noticia ✅
- **Editor**: Solo puede editar sus propias noticias ⚠️

**Body:**
```json
{
  "titulo": "Título actualizado",
  "contenido": "<p>Contenido actualizado...</p>",
  "imagen_principal": "https://...",
  "id_categoria": 3,
  "estado": "publicada",
  "keywords": [1, 2, "nueva"]
}
```

**Campos:**
- `titulo` (requerido): Título de la noticia
- `contenido` (requerido): Contenido HTML
- `imagen_principal` (opcional): URL de la imagen
- `id_categoria` (opcional): ID de la categoría
- `estado` (opcional): `publicada` | `borrador`
- `keywords` (opcional): Array de IDs de keywords existentes o nombres de nuevas keywords

**Nota:** El autor de la noticia no puede ser modificado. Se mantiene el autor original.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Noticia actualizada correctamente"
}
```

**Errores:**
- `400`: Título y contenido son requeridos
- `401`: No autenticado
- `403`: No tienes permiso para modificar esta noticia (Editor intentando editar noticia de otro)
- `404`: Noticia no encontrada

---

### DELETE /api/noticias/:id
Elimina una noticia.

**Acceso:** 🔒 Requiere autenticación
- **Admin**: Puede eliminar cualquier noticia ✅
- **Editor**: Solo puede eliminar sus propias noticias ⚠️

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Noticia eliminada correctamente"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No tienes permiso para modificar esta noticia
- `404`: Noticia no encontrada

---

## 💬 Comentarios Endpoints

### GET /api/comentarios
Lista todos los comentarios con filtros.

**Acceso:** Público

**Query Parameters:**
- `noticia` (opcional): ID de la noticia
- `estado` (opcional): Estado del comentario (1=Aprobado, 2=En espera, 3=Spam)
- `page` (opcional): Número de página (default: `1`)
- `limit` (opcional): Resultados por página (default: `20`)

**Ejemplo:**
```
GET /api/comentarios?noticia=5&estado=1&page=1
```

**Response (200 OK):**
```json
{
  "success": true,
  "comentarios": [
    {
      "id_comentario": 10,
      "id_noticia": 5,
      "id_autor": 8,
      "comentario": "Excelente artículo!",
      "estado": 1,
      "creado_en": "2024-02-22T15:30:00.000Z",
      "autor_nombre": "María López",
      "autor_email": "maria@example.com",
      "noticia_titulo": "Título de la noticia",
      "noticia_id_usuario": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### GET /api/comentarios/publicos
Obtiene comentarios aprobados de una noticia específica (para mostrar en el frontend público).

**Acceso:** Público

**Query Parameters:**
- `noticia` (requerido): ID de la noticia

**Ejemplo:**
```
GET /api/comentarios/publicos?noticia=5
```

**Response (200 OK):**
```json
{
  "success": true,
  "comentarios": [
    {
      "id_comentario": 10,
      "comentario": "Excelente artículo!",
      "creado_en": "2024-02-22T15:30:00.000Z",
      "autor_nombre": "María López",
      "autor_tipo": "externo"
    }
  ]
}
```

**Errores:**
- `400`: El ID de la noticia es requerido

---

### POST /api/comentarios
Crea un nuevo comentario en una noticia.

**Acceso:** Público (puede ser autenticado o anónimo)

**Body (Usuario anónimo):**
```json
{
  "id_noticia": 5,
  "nombre": "María López",
  "email": "maria@example.com",
  "comentario": "Excelente artículo!"
}
```

**Body (Usuario autenticado):**
```json
{
  "id_noticia": 5,
  "comentario": "Excelente artículo!"
}
```
*Nota: Si está autenticado, el nombre y email se toman del usuario logueado.*

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Comentario enviado. Será visible después de ser aprobado.",
  "id_comentario": 25
}
```

**Errores:**
- `400`: La noticia y el comentario son requeridos

---

### PUT /api/comentarios/:id
Actualiza el estado de un comentario (aprobar, rechazar, marcar como spam).

**Acceso:** 🔒 Requiere autenticación (Admin o Editor)

**Body:**
```json
{
  "estado": 1
}
```

**Estados:**
- `1`: Aprobado (visible en el frontend)
- `2`: En espera (pendiente de revisión)
- `3`: Spam (oculto)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentario actualizado correctamente"
}
```

**Errores:**
- `400`: Estado inválido
- `401`: No autenticado

---

### DELETE /api/comentarios/:id
Elimina un comentario.

**Acceso:** 🔒 Requiere autenticación
- **Admin**: Puede eliminar cualquier comentario ✅
- **Editor**: Solo puede eliminar comentarios en sus propias noticias ⚠️

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentario eliminado correctamente"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No tienes permiso para eliminar este comentario
- `404`: Comentario no encontrado

---

## 📑 Categorías Endpoints

### GET /api/categorias
Lista todas las categorías.

**Acceso:** Público

**Query Parameters:**
- `estado` (opcional): `1` (activas) | `0` (inactivas)

**Response (200 OK):**
```json
{
  "success": true,
  "categorias": [
    {
      "id_categoria": 1,
      "nombre": "Tecnología",
      "slug": "tecnologia",
      "descripcion": "Artículos sobre tecnología",
      "estado": 1,
      "creado_en": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/categorias
Crea una nueva categoría.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "Innovación",
  "descripcion": "Artículos sobre innovación"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Categoría creada correctamente",
  "id_categoria": 10
}
```

---

### PUT /api/categorias/:id
Actualiza una categoría.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "Innovación y Tecnología",
  "descripcion": "Descripción actualizada",
  "estado": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categoría actualizada correctamente"
}
```

---

### DELETE /api/categorias/:id
Elimina una categoría.

**Acceso:** 🔒 Requiere autenticación

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categoría eliminada correctamente"
}
```

---

## 👤 Autores Endpoints

### GET /api/autores
Lista todos los autores.

**Acceso:** Público

**Query Parameters:**
- `estado` (opcional): `activo` | `inactivo`
- `tipo` (opcional): `interno` | `externo`

**Response (200 OK):**
```json
{
  "success": true,
  "autores": [
    {
      "id_autor": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "estado": "activo",
      "tipo": "interno",
      "id_usuario": 5,
      "creado_en": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/autores
Crea un nuevo autor.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "María García",
  "email": "maria@example.com",
  "tipo": "externo"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Autor creado correctamente",
  "id_autor": 15
}
```

---

### PUT /api/autores/:id
Actualiza un autor.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "María García López",
  "email": "maria.garcia@example.com",
  "estado": "activo",
  "tipo": "interno",
  "id_usuario": 8
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Autor actualizado correctamente"
}
```

---

### DELETE /api/autores/:id
Elimina un autor.

**Acceso:** 🔒 Requiere autenticación

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Autor eliminado correctamente"
}
```

---

## 🏷️ Keywords Endpoints

### GET /api/keywords
Lista todas las keywords.

**Acceso:** Público

**Response (200 OK):**
```json
{
  "success": true,
  "keywords": [
    {
      "id_keyword": 1,
      "nombre": "tecnología"
    },
    {
      "id_keyword": 2,
      "nombre": "innovación"
    }
  ]
}
```

---

### POST /api/keywords
Crea una nueva keyword.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "inteligencia artificial"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Keyword creada correctamente",
  "id_keyword": 25
}
```

---

### POST /api/keywords/generar
Genera keywords automáticamente para una noticia usando IA (si está configurado).

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "titulo": "Título de la noticia",
  "contenido": "Contenido de la noticia..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "keywords": ["tecnología", "innovación", "desarrollo"]
}
```

---

## 👥 Usuarios Endpoints

### GET /api/usuarios
Lista todos los usuarios.

**Acceso:** 🔒 Requiere autenticación

**Response (200 OK):**
```json
{
  "success": true,
  "usuarios": [
    {
      "id_usuario": 1,
      "nombre": "Admin User",
      "email": "admin@example.com",
      "rol": "admin",
      "estado": 1,
      "ultimo_login": "2024-02-23T10:00:00.000Z",
      "creado_en": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/usuarios
Crea un nuevo usuario.

**Acceso:** 🔒 Requiere autenticación (generalmente solo Admin)

**Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "email": "nuevo@example.com",
  "password": "contraseña123",
  "rol": "editor"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario creado correctamente",
  "id_usuario": 5
}
```

---

### PUT /api/usuarios/:id
Actualiza un usuario.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "Usuario Actualizado",
  "email": "actualizado@example.com",
  "rol": "admin",
  "estado": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuario actualizado correctamente"
}
```

---

### DELETE /api/usuarios/:id
Elimina un usuario.

**Acceso:** 🔒 Requiere autenticación

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente"
}
```

---

## 🛠️ Servicios Endpoints

### GET /api/servicios
Lista todos los servicios.

**Acceso:** Público

**Response (200 OK):**
```json
{
  "success": true,
  "servicios": [
    {
      "id_servicio": 1,
      "nombre": "Consultoría",
      "descripcion": "Servicios de consultoría empresarial",
      "estado": 1
    }
  ]
}
```

---

### POST /api/servicios
Crea un nuevo servicio.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "Desarrollo Web",
  "descripcion": "Servicios de desarrollo web"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Servicio creado correctamente",
  "id_servicio": 8
}
```

---

### PUT /api/servicios/:id
Actualiza un servicio.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "nombre": "Desarrollo Web y Mobile",
  "descripcion": "Descripción actualizada",
  "estado": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Servicio actualizado correctamente"
}
```

---

### DELETE /api/servicios/:id
Elimina un servicio.

**Acceso:** 🔒 Requiere autenticación

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Servicio eliminado correctamente"
}
```

---

## 🔖 Pages Keywords Endpoints

### GET /api/pages/keywords/:page
Obtiene las keywords asociadas a una página específica.

**Acceso:** Público

**Ejemplo:**
```
GET /api/pages/keywords/home
```

**Response (200 OK):**
```json
{
  "success": true,
  "keywords": [
    {
      "id_keyword": 1,
      "nombre": "tecnología"
    },
    {
      "id_keyword": 5,
      "nombre": "innovación"
    }
  ]
}
```

---

### PUT /api/pages/keywords/:page
Actualiza las keywords de una página.

**Acceso:** 🔒 Requiere autenticación

**Body:**
```json
{
  "keywords": [1, 5, 8, "nueva keyword"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Keywords de la página actualizadas correctamente"
}
```

---

## 🚨 Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos o faltantes |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 🔐 Permisos por Rol

### Noticias

| Acción | Público | Editor | Admin |
|--------|---------|--------|-------|
| Ver noticias | ✅ | ✅ | ✅ |
| Crear noticia | ❌ | ✅ | ✅ |
| Editar cualquier noticia | ❌ | ❌ | ✅ |
| Editar su propia noticia | ❌ | ✅ | ✅ |
| Eliminar cualquier noticia | ❌ | ❌ | ✅ |
| Eliminar su propia noticia | ❌ | ✅ | ✅ |

**Regla de propiedad para Editor:**
- El editor solo puede editar/eliminar noticias donde: `noticias.id_autor → autor.id_usuario = id_usuario del token`

### Comentarios

| Acción | Público | Editor | Admin |
|--------|---------|--------|-------|
| Ver comentarios | ✅ | ✅ | ✅ |
| Crear comentario | ✅ | ✅ | ✅ |
| Aprobar/rechazar comentario | ❌ | ✅ | ✅ |
| Eliminar cualquier comentario | ❌ | ❌ | ✅ |
| Eliminar comentarios en sus noticias | ❌ | ✅ | ✅ |

**Regla de propiedad para Editor:**
- El editor solo puede eliminar comentarios en noticias que le pertenecen

### Otros Recursos

| Recurso | Crear | Editar | Eliminar | Ver |
|---------|-------|--------|----------|-----|
| Categorías | 🔒 Auth | 🔒 Auth | 🔒 Auth | 👁️ Público |
| Autores | 🔒 Auth | 🔒 Auth | 🔒 Auth | 👁️ Público |
| Keywords | 🔒 Auth | 🔒 Auth | 🔒 Auth | 👁️ Público |
| Usuarios | 🔒 Auth | 🔒 Auth | 🔒 Auth | 🔒 Auth |
| Servicios | 🔒 Auth | 🔒 Auth | 🔒 Auth | 👁️ Público |

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Login y Crear Noticia

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'editor@example.com',
    password: 'password123'
  })
});

const { token, usuario } = await loginResponse.json();

// 2. Crear noticia (el autor se asigna automáticamente)
const noticiaResponse = await fetch('http://localhost:3001/api/noticias', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    titulo: 'Nueva noticia desde el frontend',
    contenido: '<p>Contenido de la noticia...</p>',
    imagen_principal: 'https://example.com/imagen.jpg',
    id_categoria: 2,
    estado: 'publicada',
    keywords: ['tecnología', 'innovación']
  })
});

const noticia = await noticiaResponse.json();
console.log('Noticia creada:', noticia);
```

### Ejemplo 2: Listar Noticias con Filtros

```javascript
const params = new URLSearchParams({
  estado: 'publicada',
  categoria: '2',
  page: '1',
  limit: '10'
});

const response = await fetch(`http://localhost:3001/api/noticias?${params}`);
const { noticias, pagination } = await response.json();

console.log(`Mostrando ${noticias.length} de ${pagination.total} noticias`);
```

### Ejemplo 3: Editor Intenta Editar Noticia Ajena

```javascript
// Este request fallará con 403 si la noticia no le pertenece al editor
const response = await fetch('http://localhost:3001/api/noticias/15', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${editorToken}`
  },
  body: JSON.stringify({
    titulo: 'Intentando editar',
    contenido: '<p>Contenido...</p>'
  })
});

if (response.status === 403) {
  console.error('No tienes permiso para editar esta noticia');
}
```

### Ejemplo 4: Mostrar Comentarios Públicos

```javascript
const noticiaId = 5;
const response = await fetch(
  `http://localhost:3001/api/comentarios/publicos?noticia=${noticiaId}`
);

const { comentarios } = await response.json();

comentarios.forEach(comentario => {
  console.log(`${comentario.autor_nombre}: ${comentario.comentario}`);
});
```

---

## 🔄 Manejo de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

**Ejemplo de manejo en el frontend:**

```javascript
try {
  const response = await fetch('http://localhost:3001/api/noticias/999', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 401:
        // Redirigir al login
        window.location.href = '/login';
        break;
      case 403:
        alert('No tienes permisos para realizar esta acción');
        break;
      case 404:
        alert('Recurso no encontrado');
        break;
      default:
        alert(error.error || 'Error al procesar la solicitud');
    }
    return;
  }

  const data = await response.json();
  console.log('Éxito:', data);
} catch (error) {
  console.error('Error de red:', error);
  alert('Error de conexión con el servidor');
}
```

---

## 📌 Notas Importantes

1. **Relación Usuario-Autor-Noticia**: 
   - Cuando creas una noticia, el autor se asigna automáticamente según el usuario autenticado
   - La relación es: `usuarios.id_usuario → autor.id_usuario → autor.id_autor → noticias.id_autor`
   - El usuario debe tener un registro en la tabla `autor` para poder crear noticias
   - Si no tienes un autor asociado, contacta al administrador

2. **Imágenes de Google Drive**: Si usas URLs de Google Drive, se convertirán automáticamente al formato de thumbnail optimizado.

3. **Slugs**: Se generan automáticamente desde el título, eliminando acentos y caracteres especiales.

4. **Descripción Corta**: Se genera automáticamente desde el contenido HTML si no se proporciona.

5. **Keywords**: Pueden ser IDs de keywords existentes (números) o nombres de nuevas keywords (strings).

6. **Paginación**: Por defecto se devuelven 20 resultados por página. Máximo recomendado: 100.

7. **Tokens**: Los tokens JWT expiran en 7 días. Debes renovarlos haciendo login nuevamente.

8. **CORS**: La API está configurada para aceptar requests desde los dominios permitidos en las variables de entorno.

9. **Estados de Comentarios**:
   - `1`: Aprobado (visible públicamente)
   - `2`: En espera (pendiente de moderación)
   - `3`: Spam (oculto)

---

## 🆘 Soporte

Para reportar problemas o solicitar ayuda, contacta al equipo de desarrollo.

**Última actualización:** 23 de Febrero, 2026
