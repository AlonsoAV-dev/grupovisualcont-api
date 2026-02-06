import express from 'express';
import { query } from '../config/db.js';
import { verifyPassword, createToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const usuarios = await query(
      'SELECT * FROM usuarios WHERE email = ? AND estado = 1',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    const isValid = await verifyPassword(password, usuario.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await query(
      'UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?',
      [usuario.id_usuario]
    );

    const token = await createToken({
      id: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    });

    // Configurar cookie JWT para funcionar entre diferentes puertos
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true solo en producción con HTTPS
      sameSite: 'lax', // permite cookies entre puertos
      domain: 'localhost', // sin especificar puerto
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    const { password: _, ...usuarioSinPassword } = usuario;

    return res.json({
      success: true,
      usuario: usuarioSinPassword,
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    // Limpiar cookie JWT
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: 'localhost',
      path: '/'
    });

    return res.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
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
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { verifyToken } = await import('../middleware/auth.js');
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error en me:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
