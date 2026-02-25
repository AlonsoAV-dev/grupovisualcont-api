import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { query } from '../config/db.js';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Hash de contraseña
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Verificar contraseña
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Crear JWT token
export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verificar JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// Middleware para proteger rutas
export async function requireAuth(req, res, next) {
  try {
    // Intentar obtener token desde cookie o header Authorization
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const payload = await verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado' });
  }
}

// Middleware para requerir rol de admin
export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  
  next();
}

// Middleware para verificar permisos sobre una noticia
// Admin puede editar/eliminar cualquier noticia
// Editor solo puede editar/eliminar sus propias noticias
export async function checkNoticiaPermission(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;
    
    // Si es admin, permitir acceso
    if (userRole === 'admin') {
      return next();
    }
    
    // Si es editor, verificar si la noticia le pertenece
    if (userRole === 'editor') {
      const result = await query(
        `SELECT n.id_noticia 
         FROM noticias n
         INNER JOIN autor a ON n.id_autor = a.id_autor
         WHERE n.id_noticia = ? AND a.id_usuario = ?`,
        [id, userId]
      );
      
      if (result.length === 0) {
        return res.status(403).json({ 
          error: 'No tienes permiso para modificar esta noticia' 
        });
      }
      
      return next();
    }
    
    // Rol no reconocido
    return res.status(403).json({ error: 'Acceso denegado' });
  } catch (error) {
    console.error('Error al verificar permisos de noticia:', error);
    return res.status(500).json({ error: 'Error al verificar permisos' });
  }
}

// Middleware para verificar permisos sobre comentarios
// Admin puede eliminar cualquier comentario
// Editor solo puede eliminar comentarios en noticias que le pertenecen
export async function checkComentarioPermission(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;
    
    // Si es admin, permitir acceso
    if (userRole === 'admin') {
      return next();
    }
    
    // Si es editor, verificar si el comentario está en una noticia que le pertenece
    if (userRole === 'editor') {
      const result = await query(
        `SELECT c.id_comentario 
         FROM comentarios c
         INNER JOIN noticias n ON c.id_noticia = n.id_noticia
         INNER JOIN autor a ON n.id_autor = a.id_autor
         WHERE c.id_comentario = ? AND a.id_usuario = ?`,
        [id, userId]
      );
      
      if (result.length === 0) {
        return res.status(403).json({ 
          error: 'No tienes permiso para eliminar este comentario' 
        });
      }
      
      return next();
    }
    
    // Rol no reconocido
    return res.status(403).json({ error: 'Acceso denegado' });
  } catch (error) {
    console.error('Error al verificar permisos de comentario:', error);
    return res.status(500).json({ error: 'Error al verificar permisos' });
  }
}
