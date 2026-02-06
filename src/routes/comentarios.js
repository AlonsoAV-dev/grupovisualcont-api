import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/comentarios
router.get('/', async (req, res) => {
  try {
    const { noticia, estado, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT 
        c.id_comentario, c.id_noticia, c.id_autor, c.comentario, c.estado, c.creado_en,
        a.nombre as autor_nombre, a.email as autor_email,
        n.titulo as noticia_titulo
      FROM comentarios c
      INNER JOIN autor a ON c.id_autor = a.id_autor
      INNER JOIN noticias n ON c.id_noticia = n.id_noticia
      WHERE 1=1
    `;
    const params = [];

    if (noticia) {
      sql += ' AND c.id_noticia = ?';
      params.push(noticia);
    }

    if (estado) {
      sql += ' AND c.estado = ?';
      params.push(estado);
    }

    const countSql = `SELECT COUNT(*) as total FROM comentarios c WHERE 1=1 ${
      noticia ? 'AND c.id_noticia = ?' : ''
    } ${estado ? 'AND c.estado = ?' : ''}`;
    const countParams = params.slice();
    const [{ total }] = await query(countSql, countParams);

    sql += ' ORDER BY c.creado_en DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const comentarios = await query(sql, params);

    return res.json({
      success: true,
      comentarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/comentarios/publicos?noticia=1
router.get('/publicos', async (req, res) => {
  try {
    const { noticia: noticiaId } = req.query;

    if (!noticiaId) {
      return res.status(400).json({ 
        success: false,
        error: 'El ID de la noticia es requerido' 
      });
    }

    const sql = `
      SELECT 
        c.id_comentario, 
        c.comentario, 
        c.creado_en,
        a.nombre as autor_nombre, 
        COALESCE(a.tipo, 'publico') as autor_tipo
      FROM comentarios c
      INNER JOIN autor a ON c.id_autor = a.id_autor
      WHERE c.id_noticia = ? AND c.estado = 1
      ORDER BY c.creado_en DESC
    `;

    const comentarios = await query(sql, [noticiaId]);

    return res.status(200).json({ 
      success: true, 
      comentarios: comentarios || [] 
    });
  } catch (error) {
    console.error('Error al obtener comentarios públicos:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al cargar comentarios' 
    });
  }
});

// POST /api/comentarios
router.post('/', async (req, res) => {
  try {
    const { id_noticia, nombre, email, comentario } = req.body;

    if (!id_noticia || !comentario) {
      return res.status(400).json({ error: 'La noticia y el comentario son requeridos' });
    }

    let id_autor;
    let nombreFinal = nombre;
    let emailFinal = email;

    // Si está autenticado, usar datos del token
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      const { verifyToken } = await import('../middleware/auth.js');
      const userData = await verifyToken(token);
      
      if (userData && userData.id) {
        const [usuario] = await query('SELECT nombre, email FROM usuarios WHERE id_usuario = ?', [userData.id]);
        
        if (usuario) {
          nombreFinal = usuario.nombre;
          emailFinal = usuario.email;
        }
      }
    }

    if (!nombreFinal || !emailFinal) {
      return res.status(400).json({ error: 'El nombre y email son requeridos' });
    }

    // Buscar o crear autor
    let autor = await query('SELECT id_autor FROM autor WHERE email = ?', [emailFinal]);

    if (autor.length === 0) {
      const result = await query(
        'INSERT INTO autor (nombre, email, tipo) VALUES (?, ?, ?)',
        [nombreFinal, emailFinal, 'externo']
      );
      id_autor = result.insertId;
    } else {
      id_autor = autor[0].id_autor;
      await query('UPDATE autor SET nombre = ? WHERE id_autor = ?', [nombreFinal, id_autor]);
    }

    const result = await query(
      'INSERT INTO comentarios (id_noticia, id_autor, comentario, estado) VALUES (?, ?, ?, ?)',
      [id_noticia, id_autor, comentario, 2]
    );

    return res.status(201).json({
      success: true,
      message: 'Comentario enviado. Será visible después de ser aprobado.',
      id_comentario: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// PUT /api/comentarios/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (![1, 2, 3].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser 1 (Aprobado), 2 (En espera) o 3 (Spam)' });
    }

    await query('UPDATE comentarios SET estado = ? WHERE id_comentario = ?', [estado, id]);

    return res.json({
      success: true,
      message: 'Comentario actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// DELETE /api/comentarios/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;

    await query('DELETE FROM comentarios WHERE id_comentario = ?', [id]);

    return res.json({
      success: true,
      message: 'Comentario eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
