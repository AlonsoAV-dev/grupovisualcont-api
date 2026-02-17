# 🗄️ Base de Datos - MySQL Schema y Configuración

## Descripción

Base de datos MySQL para el sistema de blog y gestión de contenido de GrupoVisualCont. Incluye gestión de noticias, keywords SEO, categorías, usuarios, autores y comentarios.

**Schema**: [`database/schema.sql`](../database/schema.sql)  
**Configuración**: [`src/config/db.js`](../src/config/db.js)

## 🏗️ Arquitectura de la Base de Datos

### Nombre de la Base de Datos

```sql
CREATE DATABASE visualcont_blog
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

- **Charset**: `utf8mb4` (soporte completo de emojis y caracteres especiales)
- **Collation**: `utf8mb4_unicode_ci` (comparación insensible a mayúsculas)

## 📊 Estructura de Tablas

### 1. **usuarios** (Autenticación Backend)

Usuarios con acceso al panel de administración.

```sql
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin','editor') NOT NULL,
    estado TINYINT DEFAULT 1,
    ultimo_login TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id_usuario`: ID único autoincremental
- `nombre`: Nombre completo del usuario
- `email`: Email único para login
- `password`: Hash bcrypt de la contraseña
- `rol`: Tipo de usuario (`admin` o `editor`)
- `estado`: 1=Activo, 0=Inactivo
- `ultimo_login`: Última sesión iniciada
- `creado_en`: Fecha de creación

**Índices**:
- PRIMARY KEY: `id_usuario`
- UNIQUE: `email`

---

### 2. **autor** (Autores de Noticias y Comentarios)

Autores que escriben noticias o realizan comentarios.

```sql
CREATE TABLE autor (
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    tipo ENUM('interno','externo') DEFAULT 'externo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `id_autor`: ID único del autor
- `nombre`: Nombre del autor
- `email`: Email opcional
- `estado`: Estado del autor
- `tipo`: Interno (equipo) o Externo (invitado)
- `creado_en`: Fecha de creación

**Diferencia con usuarios**:
- `usuarios`: Acceso al backend
- `autor`: Firma de contenido público

---

### 3. **servicios** (Servicios de la Empresa)

Servicios ofrecidos por GrupoVisualCont.

```sql
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado TINYINT DEFAULT 1
);
```

**Ejemplos**:
- Sistema Contable
- Sistema ERP
- Facturador Electrónico
- Sistema de Planillas

---

### 4. **keywords** (Keywords SEO)

Palabras clave para optimización SEO.

```sql
CREATE TABLE keywords (
    id_keyword INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
```

**Uso**:
- SEO de noticias
- SEO de servicios
- SEO de páginas estáticas (home, contable, etc.)

**Índices**:
- UNIQUE: `nombre`

---

### 5. **categorias** (Categorías de Noticias)

Categorías para organizar noticias.

```sql
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado TINYINT DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos**:
- `slug`: URL-friendly (e.g., `contabilidad`, `tributacion`)
- `estado`: 1=Activa, 0=Inactiva

**Ejemplos**:
- Contabilidad
- Tributación
- Laboral
- Tecnología

---

### 6. **noticias** (Artículos del Blog)

Contenido principal del blog.

```sql
CREATE TABLE noticias (
    id_noticia INT AUTO_INCREMENT PRIMARY KEY,
    cod_unico VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    contenido TEXT NOT NULL,
    descripcion_corta VARCHAR(500),
    imagen_principal VARCHAR(255),
    id_categoria INT,
    id_servicio INT,
    id_autor INT NOT NULL,
    estado ENUM('publicada','borrador') DEFAULT 'borrador',
    fecha_publicacion DATETIME,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
);
```

**Campos**:
- `cod_unico`: Código único de noticia (e.g., `NOT-2024-001`)
- `slug`: URL SEO-friendly (auto-generado)
- `contenido`: HTML del artículo
- `descripcion_corta`: Meta description (auto-generada o manual)
- `imagen_principal`: URL de imagen destacada
- `estado`: `publicada` o `borrador`
- `fecha_publicacion`: Fecha de publicación programada

**Relaciones**:
- N:1 con `categorias`
- N:1 con `servicios`
- N:1 con `autor`
- N:M con `keywords` (via `noticia_keyword`)

---

### 7. **noticia_keyword** (Relación N:M)

Asociación entre noticias y keywords.

```sql
CREATE TABLE noticia_keyword (
    id_noticia INT,
    id_keyword INT,
    PRIMARY KEY (id_noticia, id_keyword),
    FOREIGN KEY (id_noticia) REFERENCES noticias(id_noticia),
    FOREIGN KEY (id_keyword) REFERENCES keywords(id_keyword)
);
```

**Uso**: Una noticia puede tener múltiples keywords.

---

### 8. **servicio_keyword** (Relación N:M)

Asociación entre servicios y keywords.

```sql
CREATE TABLE servicio_keyword (
    id_servicio INT,
    id_keyword INT,
    PRIMARY KEY (id_servicio, id_keyword),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_keyword) REFERENCES keywords(id_keyword)
);
```

---

### 9. **page_keywords** (Keywords por Página)

Keywords SEO para páginas estáticas del sitio web.

```sql
CREATE TABLE page_keywords (
    page_name VARCHAR(50) NOT NULL,
    id_keyword INT NOT NULL,
    PRIMARY KEY (page_name, id_keyword),
    FOREIGN KEY (id_keyword) REFERENCES keywords(id_keyword)
);
```

**Páginas soportadas**:
- `home`
- `contable`
- `erp`
- `facturador`
- `planilla`
- `nosotros`

---

### 10. **comentarios** (Comentarios de Noticias)

Sistema de comentarios con moderación.

```sql
CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_noticia INT NOT NULL,
    id_autor INT NOT NULL,
    comentario TEXT NOT NULL,
    estado TINYINT NOT NULL DEFAULT 2,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_noticia) REFERENCES noticias(id_noticia),
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
);
```

**Estados**:
- `1`: Aprobado (visible públicamente)
- `2`: En espera (pendiente de moderación)
- `3`: Spam (rechazado)

**Relaciones**:
- N:1 con `noticias`
- N:1 con `autor`

---

## 🔗 Diagrama de Relaciones

```
usuarios (backend auth)

autor ────┐
          ├──→ noticias ←── categorias
servicios ┘        │
                   └──→ noticia_keyword ←── keywords
                                             │
                   ┌──→ servicio_keyword ────┘
servicios ─────────┘                         │
                                             │
                   ┌──→ page_keywords ────────┘
                   │
comentarios ───────┴──→ autor
    │
    └──→ noticias
```

## 🔧 Configuración del Pool de Conexiones

Archivo: [`src/config/db.js`](../src/config/db.js)

### Funciones

#### `getConnection()`

Crea y retorna un pool de conexiones MySQL reutilizable.

```javascript
export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,           // Máximo 10 conexiones simultáneas
      queueLimit: 0,                 // Sin límite de cola
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}
```

**Características**:
- ✅ **Singleton**: Una sola instancia de pool
- ✅ **Pooling**: Reutilización de conexiones
- ✅ **Keep-Alive**: Mantiene conexiones activas
- ✅ **Límite**: 10 conexiones simultáneas
- ✅ **Cola**: Espera automática si no hay conexiones disponibles

#### `query(sql, params)`

Ejecuta queries con prepared statements (prevención de SQL injection).

```javascript
export async function query(sql, params) {
  const connection = await getConnection();
  const [results] = await connection.execute(sql, params);
  return results;
}
```

**Uso**:
```javascript
import { query } from './config/db.js';

// SELECT
const usuarios = await query(
  'SELECT * FROM usuarios WHERE email = ?',
  [email]
);

// INSERT
const result = await query(
  'INSERT INTO noticias (titulo, contenido) VALUES (?, ?)',
  [titulo, contenido]
);
```

## 🔐 Seguridad

### Prepared Statements

Todas las queries usan `?` placeholders:

```javascript
// ✅ SEGURO
await query('SELECT * FROM usuarios WHERE email = ?', [email]);

// ❌ INSEGURO (SQL Injection)
await query(`SELECT * FROM usuarios WHERE email = '${email}'`);
```

### Hash de Contraseñas

```javascript
import bcrypt from 'bcryptjs';

// Crear hash
const hash = await bcrypt.hash(password, 10);

// Verificar
const isValid = await bcrypt.compare(password, hash);
```

## 📝 Datos de Ejemplo

El schema incluye datos iniciales:

```sql
-- Usuario admin (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@visualcont.com', '$2a$10$...', 'admin');

-- Autor interno
INSERT INTO autor (nombre, email, tipo) VALUES 
('Equipo VisualCont', 'blog@visualcont.com', 'interno');

-- Servicios
INSERT INTO servicios (nombre, descripcion) VALUES 
('Sistema Contable', 'Software de contabilidad empresarial'),
('Sistema ERP', 'Sistema de planificación de recursos empresariales');

-- Keywords
INSERT INTO keywords (nombre) VALUES 
('contabilidad'), ('tributación'), ('facturación');

-- Categorías
INSERT INTO categorias (nombre, slug) VALUES 
('Contabilidad', 'contabilidad'),
('Tributación', 'tributacion');
```

## 🧪 Queries Comunes

### Obtener noticia con keywords

```sql
SELECT 
  n.*, 
  GROUP_CONCAT(k.nombre) as keywords
FROM noticias n
LEFT JOIN noticia_keyword nk ON n.id_noticia = nk.id_noticia
LEFT JOIN keywords k ON nk.id_keyword = k.id_keyword
WHERE n.slug = ?
GROUP BY n.id_noticia;
```

### Comentarios aprobados

```sql
SELECT c.*, a.nombre as autor_nombre
FROM comentarios c
INNER JOIN autor a ON c.id_autor = a.id_autor
WHERE c.id_noticia = ? AND c.estado = 1
ORDER BY c.creado_en DESC;
```

## 🔄 Migraciones

Para actualizar el schema:

```bash
mysql -u usuario -p database_name < database/schema.sql
```

**⚠️ Advertencia**: Esto elimina y recrea toda la base de datos.

## 📊 Índices y Optimización

- ✅ PRIMARY KEYS en todas las tablas
- ✅ UNIQUE en campos únicos (email, slug, nombre)
- ✅ FOREIGN KEYS con integridad referencial
- ✅ Índices automáticos en FKs

## 📚 Recursos Relacionados

- [Backend General](./BACKEND.md)
- [Configuración del Servidor](./SERVER.md)
- [Documentación API](./API.md)
