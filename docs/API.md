# 📡 API - Documentación de Endpoints

## Descripción

Documentación completa de todos los endpoints REST disponibles en la API de GrupoVisualCont.

**Base URL**: `http://localhost:3001` (desarrollo) | `https://api.grupovisualcont.com` (producción)

## 📋 Índice de Módulos

1. [Autenticación](#-autenticación)
2. [Noticias](#-noticias)
3. [Keywords](#-keywords)
4. [Categorías](#-categorías)
5. [Autores](#-autores)
6. [Usuarios](#-usuarios)
7. [Servicios](#-servicios)
8. [Comentarios](#-comentarios)
9. [Page Keywords](#-page-keywords)
10. [Health Check](#-health-check)

---

## 🔐 Autenticación

Base: `/api/auth`

### `POST /api/auth/login`

Inicia sesión y retorna JWT token.

**Request**:
```json
{
  "email": "admin@visualcont.com",
  "password": "admin123"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "nombre": "Administrador",
    "email": "admin@visualcont.com",
    "rol": "admin",
    "estado": 1,
    "ultimo_login": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:
- `400`: Email o contraseña faltantes
- `401`: Credenciales inválidas
- `500`: Error del servidor

---

### `POST /api/auth/logout`

Cierra sesión eliminando la cookie JWT.

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

### `GET /api/auth/me`

Obtiene datos del usuario autenticado actual.

**Headers**:
```
Cookie: token=...
# O
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** `200 OK`:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@visualcont.com",
    "nombre": "Administrador",
    "rol": "admin"
  }
}
```

**Errores**:
- `401`: No autenticado o token inválido

---

## 📰 Noticias

Base: `/api/noticias`

### `GET /api/noticias`

Lista noticias con paginación y filtros.

**Query Params**:
- `estado`: `publicada` | `borrador`
- `servicio`: ID del servicio
- `categoria`: ID de la categoría
- `orderBy`: `fecha_publicacion` (default) | `creado_en`
- `page`: Página actual (default: `1`)
- `limit`: Elementos por página (default: `20`)

**Response** `200 OK`:
```json
{
  "success": true,
  "noticias": [
    {
      "id_noticia": 1,
      "cod_unico": "NOT-2024-001",
      "titulo": "Nueva regulación tributaria 2024",
      "slug": "nueva-regulacion-tributaria-2024",
      "descripcion_corta": "La SUNAT anuncia cambios importantes...",
      "imagen_principal": "https://...",
      "estado": "publicada",
      "fecha_publicacion": "2024-01-15T10:00:00.000Z",
      "creado_en": "2024-01-10T08:00:00.000Z",
      "id_categoria": 2,
      "autor_nombre": "Equipo VisualCont",
      "categoria_nombre": "Tributación",
      "categoria_slug": "tributacion"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### `GET /api/noticias/slug/:slug`

Obtiene noticia por slug (para frontend público).

**Params**:
- `slug`: Slug de la noticia (e.g., `nueva-regulacion-tributaria-2024`)

**Response** `200 OK`:
```json
{
  "success": true,
  "noticia": {
    "id_noticia": 1,
    "cod_unico": "NOT-2024-001",
    "titulo": "Nueva regulación tributaria 2024",
    "slug": "nueva-regulacion-tributaria-2024",
    "contenido": "<p>Contenido HTML completo...</p>",
    "descripcion_corta": "La SUNAT anuncia cambios importantes...",
    "imagen_principal": "https://...",
    "estado": "publicada",
    "fecha_publicacion": "2024-01-15T10:00:00.000Z",
    "autor_nombre": "Equipo VisualCont",
    "autor_email": "blog@visualcont.com",
    "categoria_nombre": "Tributación",
    "categoria_slug": "tributacion",
    "keywords": [
      { "id_keyword": 1, "nombre": "tributación" },
      { "id_keyword": 4, "nombre": "SUNAT" }
    ]
  }
}
```

**Errores**:
- `404`: Noticia no encontrada

---

### `GET /api/noticias/:id`

Obtiene noticia por ID con keywords (admin).

**Params**:
- `id`: ID de la noticia

**Auth**: Requerido

**Response** `200 OK`:
```json
{
  "success": true,
  "noticia": {
    "id_noticia": 1,
    "cod_unico": "NOT-2024-001",
    "titulo": "Nueva regulación tributaria 2024",
    "slug": "nueva-regulacion-tributaria-2024",
    "contenido": "<p>Contenido HTML completo...</p>",
    "descripcion_corta": "La SUNAT anuncia cambios importantes...",
    "imagen_principal": "https://...",
    "id_categoria": 2,
    "id_servicio": 1,
    "id_autor": 1,
    "estado": "borrador",
    "fecha_publicacion": null,
    "creado_en": "2024-01-10T08:00:00.000Z",
    "autor_nombre": "Equipo VisualCont",
    "categoria_nombre": "Tributación",
    "keywords": [
      { "id_keyword": 1, "nombre": "tributación" },
      { "id_keyword": 4, "nombre": "SUNAT" }
    ]
  }
}
```

---

### `POST /api/noticias`

Crea una nueva noticia.

**Auth**: Requerido (Editor o Admin)

**Request**:
```json
{
  "titulo": "Nueva regulación tributaria 2024",
  "contenido": "<p>Contenido HTML completo...</p>",
  "descripcion_corta": "La SUNAT anuncia cambios...",
  "imagen_principal": "https://...",
  "id_categoria": 2,
  "id_servicio": 1,
  "id_autor": 1,
  "estado": "borrador",
  "fecha_publicacion": "2024-01-15T10:00:00.000Z",
  "keywords": [1, 4, 5]
}
```

**Campos opcionales**:
- `descripcion_corta` (se genera automáticamente si no se proporciona)
- `slug` (se genera automáticamente desde el título)
- `imagen_principal`
- `id_servicio`
- `fecha_publicacion`
- `keywords`

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Noticia creada correctamente",
  "noticia": {
    "id_noticia": 15,
    "cod_unico": "NOT-2024-015",
    "slug": "nueva-regulacion-tributaria-2024"
  }
}
```

**Errores**:
- `400`: Datos faltantes o inválidos
- `401`: No autenticado
- `500`: Error del servidor

---

### `PUT /api/noticias/:id`

Actualiza una noticia existente.

**Auth**: Requerido (Editor o Admin)

**Params**:
- `id`: ID de la noticia

**Request**:
```json
{
  "titulo": "Nueva regulación tributaria 2024 - Actualizado",
  "contenido": "<p>Contenido actualizado...</p>",
  "id_categoria": 2,
  "id_servicio": 1,
  "estado": "publicada",
  "fecha_publicacion": "2024-01-15T10:00:00.000Z",
  "keywords": [1, 4, 5, 8]
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Noticia actualizada correctamente"
}
```

---

### `DELETE /api/noticias/:id`

Elimina una noticia.

**Auth**: Requerido (Admin)

**Params**:
- `id`: ID de la noticia

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Noticia eliminada correctamente"
}
```

---

## 🔑 Keywords

Base: `/api/keywords`

### `GET /api/keywords/all`

Obtiene todas las keywords sin paginación (para dropdowns).

**Response** `200 OK`:
```json
{
  "success": true,
  "keywords": [
    { "id_keyword": 1, "nombre": "contabilidad" },
    { "id_keyword": 2, "nombre": "tributación" },
    { "id_keyword": 3, "nombre": "facturación" }
  ]
}
```

---

### `GET /api/keywords/search`

Búsqueda de keywords con autocomplete (max 10 resultados).

**Query Params**:
- `q`: Término de búsqueda

**Response** `200 OK`:
```json
{
  "success": true,
  "keywords": [
    { "id_keyword": 1, "nombre": "contabilidad" },
    { "id_keyword": 5, "nombre": "contable" }
  ]
}
```

---

### `GET /api/keywords`

Lista keywords con paginación (para administración).

**Query Params**:
- `page`: Página actual (default: `1`)
- `limit`: Elementos por página (default: `15`)

**Response** `200 OK`:
```json
{
  "success": true,
  "keywords": [
    { "id_keyword": 10, "nombre": "software" },
    { "id_keyword": 9, "nombre": "empresas" }
  ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 50,
    "totalPages": 4
  }
}
```

---

### `GET /api/keywords/:id`

Obtiene una keyword por ID.

**Params**:
- `id`: ID de la keyword

**Response** `200 OK`:
```json
{
  "success": true,
  "keyword": {
    "id_keyword": 1,
    "nombre": "contabilidad"
  }
}
```

**Errores**:
- `404`: Keyword no encontrada

---

### `POST /api/keywords`

Crea una nueva keyword.

**Auth**: Requerido

**Request**:
```json
{
  "nombre": "facturación electrónica"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Keyword creada correctamente",
  "keyword": {
    "id_keyword": 15,
    "nombre": "facturación electrónica"
  }
}
```

**Errores**:
- `400`: Nombre requerido o keyword ya existe
- `401`: No autenticado

---

### `PUT /api/keywords/:id`

Actualiza una keyword existente.

**Auth**: Requerido

**Params**:
- `id`: ID de la keyword

**Request**:
```json
{
  "nombre": "facturación electrónica SUNAT"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Keyword actualizada correctamente"
}
```

---

### `DELETE /api/keywords/:id`

Elimina una keyword.

**Auth**: Requerido

**Params**:
- `id`: ID de la keyword

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Keyword eliminada correctamente"
}
```

---

### `POST /api/keywords/generar`

Genera keywords inteligentes con IA (Groq API).

**Auth**: Requerido

**Request**:
```json
{
  "texto": "Artículo sobre la nueva regulación tributaria de la SUNAT para el 2024",
  "cantidad": 5
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "keywords": [
    "regulación tributaria",
    "SUNAT",
    "tributación 2024",
    "impuestos",
    "normativa fiscal"
  ]
}
```

---

## 📁 Categorías

Base: `/api/categorias`

### `GET /api/categorias`

Lista todas las categorías activas.

**Response** `200 OK`:
```json
{
  "success": true,
  "categorias": [
    {
      "id_categoria": 1,
      "nombre": "Contabilidad",
      "slug": "contabilidad",
      "descripcion": "Noticias sobre contabilidad empresarial",
      "estado": 1
    },
    {
      "id_categoria": 2,
      "nombre": "Tributación",
      "slug": "tributacion",
      "descripcion": "Novedades y actualizaciones tributarias",
      "estado": 1
    }
  ]
}
```

---

### `GET /api/categorias/:id`

Obtiene una categoría por ID.

**Params**:
- `id`: ID de la categoría

**Response** `200 OK`:
```json
{
  "success": true,
  "categoria": {
    "id_categoria": 1,
    "nombre": "Contabilidad",
    "slug": "contabilidad",
    "descripcion": "Noticias sobre contabilidad empresarial",
    "estado": 1
  }
}
```

---

### `POST /api/categorias`

Crea una nueva categoría.

**Auth**: Requerido

**Request**:
```json
{
  "nombre": "Recursos Humanos",
  "descripcion": "Gestión de personal y planillas"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Categoría creada correctamente",
  "categoria": {
    "id_categoria": 5,
    "nombre": "Recursos Humanos",
    "slug": "recursos-humanos",
    "descripcion": "Gestión de personal y planillas",
    "estado": 1
  }
}
```

**Nota**: El slug se genera automáticamente desde el nombre.

---

### `PUT /api/categorias/:id`

Actualiza una categoría existente.

**Auth**: Requerido

**Params**:
- `id`: ID de la categoría

**Request**:
```json
{
  "nombre": "Recursos Humanos y Planillas",
  "descripcion": "Gestión de personal, planillas y beneficios",
  "estado": 1
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Categoría actualizada correctamente"
}
```

---

### `DELETE /api/categorias/:id`

Elimina una categoría (soft delete: estado = 0).

**Auth**: Requerido

**Params**:
- `id`: ID de la categoría

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Categoría eliminada correctamente"
}
```

---

## ✍️ Autores

Base: `/api/autores`

### `GET /api/autores`

Lista todos los autores activos.

**Response** `200 OK`:
```json
{
  "success": true,
  "autores": [
    {
      "id_autor": 1,
      "nombre": "Equipo VisualCont",
      "email": "blog@visualcont.com",
      "estado": "activo",
      "tipo": "interno",
      "creado_en": "2024-01-01T00:00:00.000Z"
    },
    {
      "id_autor": 2,
      "nombre": "María García",
      "email": "maria@example.com",
      "estado": "activo",
      "tipo": "externo",
      "creado_en": "2024-01-05T00:00:00.000Z"
    }
  ]
}
```

---

## 👤 Usuarios

Base: `/api/usuarios`

### `GET /api/usuarios`

Lista todos los usuarios del sistema.

**Auth**: Requerido (Admin)

**Response** `200 OK`:
```json
{
  "success": true,
  "usuarios": [
    {
      "id_usuario": 1,
      "nombre": "Administrador",
      "email": "admin@visualcont.com",
      "rol": "admin",
      "estado": 1,
      "ultimo_login": "2024-01-15T10:30:00.000Z",
      "creado_en": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/usuarios`

Crea un nuevo usuario.

**Auth**: Requerido (Admin)

**Request**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@visualcont.com",
  "password": "password123",
  "rol": "editor"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Usuario creado correctamente",
  "usuario": {
    "id_usuario": 5,
    "nombre": "Juan Pérez",
    "email": "juan@visualcont.com",
    "rol": "editor",
    "estado": 1
  }
}
```

**Errores**:
- `400`: Datos faltantes, rol inválido o email duplicado
- `401`: No autenticado
- `403`: No es admin

---

### `PUT /api/usuarios/:id`

Actualiza un usuario existente.

**Auth**: Requerido (Admin)

**Params**:
- `id`: ID del usuario

**Request**:
```json
{
  "nombre": "Juan Pérez Editor",
  "email": "juan@visualcont.com",
  "password": "newPassword123",
  "rol": "admin",
  "estado": 1
}
```

**Nota**: El campo `password` es opcional. Si se omite, no se actualiza.

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Usuario actualizado correctamente"
}
```

---

### `DELETE /api/usuarios/:id`

Elimina un usuario (soft delete: estado = 0).

**Auth**: Requerido (Admin)

**Params**:
- `id`: ID del usuario

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente"
}
```

---

## 🏢 Servicios

Base: `/api/servicios`

### `GET /api/servicios`

Lista todos los servicios activos.

**Response** `200 OK`:
```json
{
  "success": true,
  "servicios": [
    {
      "id_servicio": 1,
      "nombre": "Sistema Contable",
      "descripcion": "Software de contabilidad empresarial",
      "estado": 1
    },
    {
      "id_servicio": 2,
      "nombre": "Sistema ERP",
      "descripcion": "Sistema de planificación de recursos empresariales",
      "estado": 1
    }
  ]
}
```

---

### `GET /api/servicios/:id`

Obtiene un servicio por ID.

**Params**:
- `id`: ID del servicio

**Response** `200 OK`:
```json
{
  "success": true,
  "servicio": {
    "id_servicio": 1,
    "nombre": "Sistema Contable",
    "descripcion": "Software de contabilidad empresarial",
    "estado": 1
  }
}
```

---

### `POST /api/servicios`

Crea un nuevo servicio.

**Auth**: Requerido (Admin)

**Request**:
```json
{
  "nombre": "Sistema de Inventarios",
  "descripcion": "Control de stock y almacenes"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Servicio creado correctamente",
  "id_servicio": 5
}
```

---

### `PUT /api/servicios/:id`

Actualiza un servicio existente.

**Auth**: Requerido (Admin)

**Params**:
- `id`: ID del servicio

**Request**:
```json
{
  "nombre": "Sistema de Inventarios y Almacenes",
  "descripcion": "Control completo de stock, almacenes y logística",
  "estado": 1
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Servicio actualizado correctamente"
}
```

---

### `DELETE /api/servicios/:id`

Elimina un servicio (soft delete: estado = 0).

**Auth**: Requerido (Admin)

**Params**:
- `id`: ID del servicio

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Servicio eliminado correctamente"
}
```

---

## 💬 Comentarios

Base: `/api/comentarios`

### `GET /api/comentarios`

Lista comentarios con filtros y paginación (admin).

**Auth**: Requerido

**Query Params**:
- `noticia`: ID de la noticia
- `estado`: `1` (aprobado) | `2` (en espera) | `3` (spam)
- `page`: Página actual (default: `1`)
- `limit`: Elementos por página (default: `20`)

**Response** `200 OK`:
```json
{
  "success": true,
  "comentarios": [
    {
      "id_comentario": 1,
      "id_noticia": 1,
      "id_autor": 2,
      "comentario": "Excelente artículo, muy informativo",
      "estado": 1,
      "creado_en": "2024-01-15T12:00:00.000Z",
      "autor_nombre": "María García",
      "autor_email": "maria@example.com",
      "noticia_titulo": "Nueva regulación tributaria 2024"
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

### `GET /api/comentarios/publicos`

Obtiene comentarios aprobados de una noticia (público).

**Query Params**:
- `noticia`: ID de la noticia (requerido)

**Response** `200 OK`:
```json
{
  "success": true,
  "comentarios": [
    {
      "id_comentario": 1,
      "comentario": "Excelente artículo, muy informativo",
      "creado_en": "2024-01-15T12:00:00.000Z",
      "autor_nombre": "María García",
      "autor_tipo": "externo"
    }
  ]
}
```

**Errores**:
- `400`: ID de noticia requerido

---

### `POST /api/comentarios`

Crea un nuevo comentario.

**Request**:
```json
{
  "id_noticia": 1,
  "id_autor": 2,
  "comentario": "Muy buen artículo, gracias por la información"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "Comentario creado correctamente. Está pendiente de moderación.",
  "comentario": {
    "id_comentario": 10,
    "estado": 2
  }
}
```

**Nota**: Los comentarios nuevos tienen `estado = 2` (en espera).

---

### `PUT /api/comentarios/:id`

Cambia el estado de un comentario (moderación).

**Auth**: Requerido

**Params**:
- `id`: ID del comentario

**Request**:
```json
{
  "estado": 1
}
```

**Estados**:
- `1`: Aprobado
- `2`: En espera
- `3`: Spam

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Estado del comentario actualizado correctamente"
}
```

---

### `DELETE /api/comentarios/:id`

Elimina un comentario.

**Auth**: Requerido (Admin)

**Params**:
- `id`: ID del comentario

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Comentario eliminado correctamente"
}
```

---

## 🔖 Page Keywords

Base: `/api/pages/keywords`

### `GET /api/pages/keywords`

Obtiene keywords de una página específica.

**Query Params**:
- `page`: Nombre de la página (requerido)

**Páginas válidas**:
- `home`
- `contable`
- `erp`
- `facturador`
- `planilla`
- `nosotros`

**Response** `200 OK`:
```json
{
  "success": true,
  "keywords": [
    { "id_keyword": 1, "nombre": "contabilidad" },
    { "id_keyword": 2, "nombre": "software contable" },
    { "id_keyword": 5, "nombre": "empresas" }
  ]
}
```

**Errores**:
- `400`: Nombre de página requerido

---

### `POST /api/pages/keywords`

Actualiza keywords de una página (reemplaza todas).

**Auth**: Requerido

**Request**:
```json
{
  "page": "contable",
  "keywords": [1, 2, 5, 8, 10]
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Keywords actualizadas correctamente para la página contable"
}
```

---

## 🏥 Health Check

### `GET /health`

Verifica el estado del servidor.

**Response** `200 OK`:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### `GET /`

Información general del API.

**Response** `200 OK`:
```json
{
  "message": "API GrupoVisualCont",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "keywords": "/api/keywords",
    "noticias": "/api/noticias",
    "categorias": "/api/categorias",
    "autores": "/api/autores",
    "usuarios": "/api/usuarios",
    "servicios": "/api/servicios",
    "comentarios": "/api/comentarios",
    "pageKeywords": "/api/pages/keywords"
  }
}
```

---

## 🔒 Autenticación en Requests

### Método 1: Cookie (Recomendado para Web)

```bash
curl -X POST http://localhost:3001/api/noticias \
  -H "Content-Type: application/json" \
  -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"titulo":"..."}'
```

### Método 2: Bearer Token (Para APIs/Mobile)

```bash
curl -X POST http://localhost:3001/api/noticias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"titulo":"..."}'
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado correctamente |
| `400` | Bad Request | Datos inválidos o faltantes |
| `401` | Unauthorized | No autenticado o token inválido |
| `403` | Forbidden | Autenticado pero sin permisos |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error del servidor |

---

## 🧪 Ejemplos de Testing

### Login y Guardar Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visualcont.com","password":"admin123"}' \
  | jq -r '.token' > token.txt
```

### Crear Noticia

```bash
TOKEN=$(cat token.txt)

curl -X POST http://localhost:3001/api/noticias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titulo": "Mi primera noticia",
    "contenido": "<p>Contenido de la noticia</p>",
    "id_categoria": 1,
    "id_autor": 1,
    "estado": "borrador"
  }'
```

### Buscar Keywords

```bash
curl "http://localhost:3001/api/keywords/search?q=conta"
```

### Obtener Noticia Pública

```bash
curl "http://localhost:3001/api/noticias/slug/nueva-regulacion-tributaria-2024"
```

---

## 📚 Recursos Relacionados

- [Backend General](./BACKEND.md)
- [Servidor Express](./SERVER.md)
- [Autenticación JWT](./AUTHENTICATION.md)
- [Base de Datos](./DATABASE.md)
