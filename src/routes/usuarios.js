import express from 'express';
import { query } from '../config/db.js';
import { hashPassword, requireAuth } from '../middleware/auth.js';
import { procesarUrlImagen } from '../utils/imageUtils.js';

const router = express.Router();

// Middleware para verificar rol admin
const requireAdmin = async (req, res, next) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de admin.' });
  }
  next();
};

// GET /api/usuarios
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const usuarios = await query(
      `SELECT 
        u.id_usuario, u.nombre, u.email, u.rol, u.estado, u.ultimo_login, u.creado_en,
        a.foto, a.descripcion
       FROM usuarios u
       LEFT JOIN autor a ON u.id_usuario = a.id_usuario
       ORDER BY u.creado_en DESC`
    );

    return res.json({ success: true, usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// POST /api/usuarios
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol, foto, descripcion } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['admin', 'editor'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const existentes = await query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);

    if (existentes.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Procesar URL de foto si está presente
    let fotoProcesada = null;
    if (foto) {
      const resultadoFoto = procesarUrlImagen(foto);
      if (!resultadoFoto.success) {
        return res.status(400).json({ error: `Foto: ${resultadoFoto.error}` });
      }
      fotoProcesada = resultadoFoto.url;
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO usuarios (nombre, email, password, rol) 
       VALUES (?, ?, ?, ?)`,
      [nombre, email, hashedPassword, rol]
    );

    const id_usuario = result.insertId;

    // Crear automáticamente el registro de autor para usuarios que pueden crear noticias
    if (rol === 'editor' || rol === 'admin') {
      await query(
        `INSERT INTO autor (nombre, email, foto, descripcion, estado, tipo, id_usuario) 
         VALUES (?, ?, ?, ?, 'activo', 'interno', ?)`,
        [nombre, email, fotoProcesada, descripcion || null, id_usuario]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      usuario: {
        id_usuario,
        nombre,
        email,
        rol,
        estado: 1,
        ultimo_login: null,
        creado_en: new Date()
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, estado, foto, descripcion } = req.body;

    if (!nombre || !email || !rol) {
      return res.status(400).json({ error: 'Nombre, email y rol son requeridos' });
    }

    if (!['admin', 'editor'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const existentes = await query('SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?', [email, id]);

    if (existentes.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
    }

    // Procesar URL de foto si está presente
    let fotoProcesada = null;
    if (foto) {
      const resultadoFoto = procesarUrlImagen(foto);
      if (!resultadoFoto.success) {
        return res.status(400).json({ error: `Foto: ${resultadoFoto.error}` });
      }
      fotoProcesada = resultadoFoto.url;
    }

    let updateQuery = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, estado = ? WHERE id_usuario = ?';
    let params = [nombre, email, rol, estado !== undefined ? estado : 1, id];

    if (password) {
      const hashedPassword = await hashPassword(password);
      updateQuery = 'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ?, estado = ? WHERE id_usuario = ?';
      params = [nombre, email, hashedPassword, rol, estado !== undefined ? estado : 1, id];
    }

    await query(updateQuery, params);

    // Sincronizar con la tabla autor si el usuario tiene rol editor o admin
    if (rol === 'editor' || rol === 'admin') {
      const autorExistente = await query('SELECT id_autor FROM autor WHERE id_usuario = ?', [id]);

      if (autorExistente.length > 0) {
        // Actualizar autor existente
        const updateAutorFields = ['nombre = ?', 'email = ?'];
        const updateAutorParams = [nombre, email];

        if (foto !== undefined) {
          updateAutorFields.push('foto = ?');
          updateAutorParams.push(fotoProcesada);
        }

        if (descripcion !== undefined) {
          updateAutorFields.push('descripcion = ?');
          updateAutorParams.push(descripcion);
        }

        updateAutorParams.push(id);

        await query(
          `UPDATE autor SET ${updateAutorFields.join(', ')} WHERE id_usuario = ?`,
          updateAutorParams
        );
      } else {
        // Crear autor si no existe
        await query(
          `INSERT INTO autor (nombre, email, foto, descripcion, estado, tipo, id_usuario) 
           VALUES (?, ?, ?, ?, 'activo', 'interno', ?)`,
          [nombre, email, fotoProcesada, descripcion || null, id]
        );
      }
    }

    return res.json({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    await query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

    return res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
