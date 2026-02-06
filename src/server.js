import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import keywordsRoutes from './routes/keywords.js';
import noticiasRoutes from './routes/noticias.js';
import categoriasRoutes from './routes/categorias.js';
import autoresRoutes from './routes/autores.js';
import usuariosRoutes from './routes/usuarios.js';
import pagesRoutes from './routes/pages.js';
import serviciosRoutes from './routes/servicios.js';
import comentariosRoutes from './routes/comentarios.js';
import generarKeywordsRoutes from './routes/generar-keywords.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // importante para enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordsRoutes);
app.use('/api/keywords', generarKeywordsRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/autores', autoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/pages/keywords', pagesRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
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
      pageKeywords: '/api/pages/keywords',
      health: '/health'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Error en el servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor solo si no estamos en Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Exportar para Vercel
export default app;
