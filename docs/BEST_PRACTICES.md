# 🌟 Mejores Prácticas - GrupoVisualCont API

Guía de mejores prácticas para desarrollo, mantenimiento y escalado del backend.

## 📋 Índice

1. [Seguridad](#-seguridad)
2. [Performance](#-performance)
3. [Código Limpio](#-código-limpio)
4. [Base de Datos](#-base-de-datos)
5. [API Design](#-api-design)
6. [Testing](#-testing)
7. [Despliegue](#-despliegue)
8. [Monitoreo](#-monitoreo)

---

## 🔒 Seguridad

### 1. Variables de Entorno

**✅ Hacer**:
```javascript
// Usar dotenv para variables sensibles
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

**❌ Evitar**:
```javascript
// NUNCA hardcodear secrets
const JWT_SECRET = 'mi-secret-123';
const DB_PASSWORD = 'password123';
```

**Checklist**:
- [ ] Nunca commitear archivo `.env` (agregar a `.gitignore`)
- [ ] Usar `.env.example` con valores de ejemplo
- [ ] Rotar JWT_SECRET periódicamente
- [ ] Usar secrets managers en producción (AWS Secrets Manager, etc.)

---

### 2. Contraseñas

**✅ Hacer**:
```javascript
import bcrypt from 'bcryptjs';

// Al crear usuario
const hashedPassword = await bcrypt.hash(password, 10);

// Al verificar
const isValid = await bcrypt.compare(password, hashedPassword);
```

**❌ Evitar**:
```javascript
// NUNCA guardar passwords en texto plano
const password = req.body.password;
await query('INSERT INTO usuarios (password) VALUES (?)', [password]);

// NUNCA retornar passwords
const usuarios = await query('SELECT * FROM usuarios');
res.json(usuarios); // Incluye password hash
```

**Checklist**:
- [ ] Usar bcrypt con mínimo 10 rounds
- [ ] Remover password de respuestas
- [ ] Implementar políticas de contraseñas fuertes
- [ ] Nunca loggear contraseñas

---

### 3. JWT y Cookies

**✅ Hacer**:
```javascript
// Token seguro
res.cookie('token', token, {
  httpOnly: true,              // No accesible desde JS
  secure: process.env.NODE_ENV === 'production', // HTTPS en prod
  sameSite: 'lax',             // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
});

// Verificar token siempre
const payload = await verifyToken(token);
if (!payload) {
  return res.status(401).json({ error: 'Token inválido' });
}
```

**❌ Evitar**:
```javascript
// Cookie sin seguridad
res.cookie('token', token);

// Confiar en token sin verificar
const user = JSON.parse(atob(token.split('.')[1]));
```

**Checklist**:
- [ ] Usar httpOnly para cookies JWT
- [ ] Implementar expiración de tokens
- [ ] Verificar tokens en cada request protegido
- [ ] Invalidar tokens en logout

---

### 4. SQL Injection

**✅ Hacer**:
```javascript
// Prepared statements SIEMPRE
const usuarios = await query(
  'SELECT * FROM usuarios WHERE email = ?',
  [email]
);

const result = await query(
  'INSERT INTO noticias (titulo, contenido) VALUES (?, ?)',
  [titulo, contenido]
);
```

**❌ Evitar**:
```javascript
// NUNCA concatenar strings
const usuarios = await query(
  `SELECT * FROM usuarios WHERE email = '${email}'`
);

// PELIGROSO: SQL injection vulnerable
const query = `INSERT INTO noticias (titulo) VALUES ('${titulo}')`;
```

**Checklist**:
- [ ] Usar prepared statements (placeholders `?`)
- [ ] Validar y sanitizar entrada del usuario
- [ ] Nunca construir queries con concatenación de strings
- [ ] Usar ORM si el proyecto escala (Prisma, TypeORM)

---

### 5. CORS y Orígenes

**✅ Hacer**:
```javascript
// Whitelist de orígenes específicos
const allowedOrigins = [
  'https://tudominio.com',
  'https://www.tudominio.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
}));
```

**❌ Evitar**:
```javascript
// NUNCA permitir todos los orígenes con credentials
app.use(cors({
  origin: '*',
  credentials: true, // ⚠️ Inseguro
}));
```

**Checklist**:
- [ ] Usar whitelist de orígenes en producción
- [ ] Nunca usar `origin: '*'` con `credentials: true`
- [ ] Validar y loggear orígenes bloqueados
- [ ] Configurar orígenes por entorno (.env)

---

## ⚡ Performance

### 1. Paginación

**✅ Hacer**:
```javascript
// Siempre paginar resultados grandes
router.get('/noticias', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const noticias = await query(
    'SELECT * FROM noticias LIMIT ? OFFSET ?',
    [parseInt(limit), offset]
  );

  const [{ total }] = await query('SELECT COUNT(*) as total FROM noticias');

  res.json({
    noticias,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
```

**❌ Evitar**:
```javascript
// NUNCA retornar toda la tabla
router.get('/noticias', async (req, res) => {
  const noticias = await query('SELECT * FROM noticias');
  res.json(noticias); // Puede ser miles de registros
});
```

**Checklist**:
- [ ] Implementar paginación en todos los listados
- [ ] Límite máximo de resultados (e.g., 100)
- [ ] Retornar metadata de paginación
- [ ] Usar cursors para datasets muy grandes

---

### 2. Índices en Base de Datos

**✅ Hacer**:
```sql
-- Crear índices en columnas frecuentemente consultadas
CREATE INDEX idx_noticias_estado ON noticias(estado);
CREATE INDEX idx_noticias_fecha ON noticias(fecha_publicacion);
CREATE INDEX idx_noticias_slug ON noticias(slug);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Índices compuestos para queries específicas
CREATE INDEX idx_noticias_estado_fecha ON noticias(estado, fecha_publicacion);
```

**❌ Evitar**:
```sql
-- No crear índices innecesarios (ocupan espacio y ralentizan INSERT)
CREATE INDEX idx_noticias_contenido ON noticias(contenido); -- Muy grande

-- No sobre-indexar
-- Una tabla no necesita índices en TODAS las columnas
```

**Checklist**:
- [ ] Índices en FKs (id_categoria, id_autor, etc.)
- [ ] Índices en campos de búsqueda (slug, email)
- [ ] Índices en campos de filtrado (estado, fecha)
- [ ] Analizar planes de ejecución con `EXPLAIN`

---

### 3. Pool de Conexiones

**✅ Hacer**:
```javascript
// Configurar pool adecuadamente
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,      // Ajustar según carga
  queueLimit: 0,            // Sin límite de cola
  waitForConnections: true, // Esperar si no hay conexiones
  enableKeepAlive: true,    // Mantener conexiones vivas
});

// Siempre usar async/await correctamente
const [results] = await connection.execute(sql, params);
// La conexión se libera automáticamente
```

**❌ Evitar**:
```javascript
// No crear nueva conexión en cada request
export async function query(sql, params) {
  const connection = await mysql.createConnection({ // ❌ Malo
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    // ...
  });
  const [results] = await connection.execute(sql, params);
  await connection.end();
  return results;
}
```

**Checklist**:
- [ ] Usar pool de conexiones (no conexiones directas)
- [ ] Configurar límites apropiados (10-20 para apps pequeñas)
- [ ] Monitorear uso del pool
- [ ] Liberar conexiones correctamente con async/await

---

### 4. Caché

**✅ Hacer**:
```javascript
// Cachear datos estáticos o poco cambiantes
let categoriasCache = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

router.get('/categorias', async (req, res) => {
  const now = Date.now();
  
  if (categoriasCache && (now - cacheTime) < CACHE_TTL) {
    return res.json({ success: true, categorias: categoriasCache });
  }

  const categorias = await query('SELECT * FROM categorias WHERE estado = 1');
  categoriasCache = categorias;
  cacheTime = now;

  res.json({ success: true, categorias });
});
```

**Implementación avanzada**:
```javascript
// Usar Redis para caché distribuido
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

router.get('/noticias/:slug', async (req, res) => {
  const { slug } = req.params;
  
  // Intentar obtener de caché
  const cached = await redis.get(`noticia:${slug}`);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Si no está en caché, consultar BD
  const noticia = await query('SELECT * FROM noticias WHERE slug = ?', [slug]);
  
  // Guardar en caché (5 minutos)
  await redis.setex(`noticia:${slug}`, 300, JSON.stringify(noticia));
  
  res.json(noticia);
});
```

**Checklist**:
- [ ] Cachear datos estáticos (categorías, servicios)
- [ ] Implementar TTL (Time To Live) apropiado
- [ ] Invalidar caché al actualizar datos
- [ ] Usar Redis para caché distribuido en producción

---

## 🎨 Código Limpio

### 1. Estructura de Archivos

**✅ Hacer**:
```
src/
├── server.js              # Entry point
├── config/
│   ├── db.js              # Database config
│   └── constants.js       # Constants
├── middleware/
│   ├── auth.js            # Auth middleware
│   ├── validation.js      # Input validation
│   └── errorHandler.js    # Error handling
├── routes/
│   ├── auth.js
│   ├── noticias.js
│   └── ...
├── controllers/           # Opcional: separar lógica
│   ├── noticiasController.js
│   └── ...
├── services/              # Opcional: lógica de negocio
│   ├── noticiaService.js
│   └── ...
└── utils/
    ├── slugify.js
    └── htmlHelper.js
```

**Checklist**:
- [ ] Un archivo por módulo/funcionalidad
- [ ] Separar configuración de lógica
- [ ] Agrupar por feature (routes, controllers, services)
- [ ] Mantener archivos pequeños (<300 líneas)

---

### 2. Manejo de Errores

**✅ Hacer**:
```javascript
// Middleware global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ error: 'CORS no permitido' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error en el servidor' 
      : err.message
  });
});

// En controladores
router.post('/noticias', requireAuth, async (req, res) => {
  try {
    // Lógica
  } catch (error) {
    console.error('Error al crear noticia:', error);
    return res.status(500).json({ 
      error: 'Error al crear noticia',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

**❌ Evitar**:
```javascript
// No capturar errores
router.post('/noticias', async (req, res) => {
  const result = await query('INSERT INTO ...'); // ❌ Sin try/catch
  res.json(result);
});

// No exponer detalles en producción
catch (error) {
  res.status(500).json({ error: error.message }); // ❌ Expone stack trace
}
```

**Checklist**:
- [ ] Try/catch en todos los async handlers
- [ ] Middleware global de errores
- [ ] Logs detallados en servidor
- [ ] Mensajes genéricos al cliente en producción

---

### 3. Validación de Entrada

**✅ Hacer**:
```javascript
// Validar y sanitizar entrada
router.post('/noticias', requireAuth, async (req, res) => {
  const { titulo, contenido, id_categoria, id_autor } = req.body;

  // Validar campos requeridos
  if (!titulo || !contenido || !id_categoria || !id_autor) {
    return res.status(400).json({ 
      error: 'Campos requeridos: titulo, contenido, id_categoria, id_autor' 
    });
  }

  // Validar tipos
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ error: 'Título inválido' });
  }

  if (!Number.isInteger(id_categoria) || id_categoria <= 0) {
    return res.status(400).json({ error: 'ID de categoría inválido' });
  }

  // Continuar con lógica
});
```

**Usar librería de validación**:
```javascript
// Instalar: npm install joi
import Joi from 'joi';

const noticiaSchema = Joi.object({
  titulo: Joi.string().min(5).max(255).required(),
  contenido: Joi.string().min(20).required(),
  id_categoria: Joi.number().integer().positive().required(),
  id_autor: Joi.number().integer().positive().required(),
  estado: Joi.string().valid('publicada', 'borrador').default('borrador'),
  keywords: Joi.array().items(Joi.number().integer().positive()),
});

router.post('/noticias', requireAuth, async (req, res) => {
  const { error, value } = noticiaSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Usar 'value' (datos validados)
  const result = await query('INSERT INTO noticias ...', [value.titulo, ...]);
});
```

**Checklist**:
- [ ] Validar todos los inputs del usuario
- [ ] Validar tipos de datos
- [ ] Sanitizar strings (trim, escape)
- [ ] Validar límites (min/max length)
- [ ] Retornar mensajes de error claros

---

### 4. Nomenclatura

**✅ Hacer**:
```javascript
// Variables: camelCase
const userName = 'Juan';
const noticiasPublicadas = [];

// Funciones: camelCase, verbos
async function obtenerNoticias() {}
async function crearNoticia() {}
function validarEmail(email) {}

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_BASE_URL = 'http://localhost:3001';

// Clases: PascalCase
class NoticiaService {}
class DatabaseConnection {}

// Archivos: kebab-case
// generar-keywords.js
// noticia-service.js
```

**Checklist**:
- [ ] Nombres descriptivos y claros
- [ ] Seguir convenciones consistentes
- [ ] Evitar abreviaciones ambiguas
- [ ] Nombres en español o inglés (consistente)

---

## 🗄️ Base de Datos

### 1. Diseño de Schema

**✅ Hacer**:
- Normalización apropiada (3NF)
- Usar IDs autoincrementales
- Foreign keys con ON DELETE/UPDATE
- Timestamps (created_at, updated_at)
- Soft deletes (estado = 0) en lugar de DELETE

**Ejemplo**:
```sql
CREATE TABLE noticias (
    id_noticia INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    contenido TEXT NOT NULL,
    estado ENUM('publicada','borrador') DEFAULT 'borrador',
    id_categoria INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado TINYINT DEFAULT 0,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_noticias_estado ON noticias(estado);
CREATE INDEX idx_noticias_eliminado ON noticias(eliminado);
```

---

### 2. Queries Eficientes

**✅ Hacer**:
```javascript
// JOIN solo lo necesario
const noticias = await query(
  `SELECT n.id_noticia, n.titulo, n.slug, c.nombre as categoria
   FROM noticias n
   LEFT JOIN categorias c ON n.id_categoria = c.id_categoria
   WHERE n.estado = 'publicada'
   LIMIT 20`
);

// GROUP_CONCAT para relaciones N:M
const noticia = await query(
  `SELECT n.*, 
          GROUP_CONCAT(k.id_keyword, ':', k.nombre SEPARATOR '||') as keywords
   FROM noticias n
   LEFT JOIN noticia_keyword nk ON n.id_noticia = nk.id_noticia
   LEFT JOIN keywords k ON nk.id_keyword = k.id_keyword
   WHERE n.id_noticia = ?
   GROUP BY n.id_noticia`,
  [id]
);
```

**❌ Evitar**:
```javascript
// N+1 queries
const noticias = await query('SELECT * FROM noticias');
for (const noticia of noticias) {
  noticia.categoria = await query(
    'SELECT * FROM categorias WHERE id_categoria = ?',
    [noticia.id_categoria]
  ); // ❌ Query por cada noticia
}
```

---

## 📡 API Design

### 1. RESTful Conventions

**✅ Seguir**:
```
GET    /api/noticias          # Listar
GET    /api/noticias/:id      # Obtener uno
POST   /api/noticias          # Crear
PUT    /api/noticias/:id      # Actualizar completo
PATCH  /api/noticias/:id      # Actualizar parcial
DELETE /api/noticias/:id      # Eliminar
```

**Recursos anidados**:
```
GET    /api/noticias/:id/comentarios        # Comentarios de una noticia
POST   /api/noticias/:id/comentarios        # Crear comentario
GET    /api/categorias/:id/noticias         # Noticias de una categoría
```

---

### 2. Respuestas Consistentes

**✅ Hacer**:
```javascript
// Success
res.json({
  success: true,
  data: { ... },
  message: 'Operación exitosa',
});

// Error
res.status(400).json({
  success: false,
  error: 'Mensaje de error',
  details: { ... }, // Opcional
});

// Lista con paginación
res.json({
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
  },
});
```

---

### 3. Versionado

**Para futuro crecimiento**:
```
/api/v1/noticias
/api/v2/noticias  # Nueva versión con cambios breaking
```

---

## 📚 Recursos Relacionados

- [Documentación API](./API.md)
- [Ejemplos de Uso](./EXAMPLES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Autenticación](./AUTHENTICATION.md)

---

**Última actualización**: Febrero 2026
