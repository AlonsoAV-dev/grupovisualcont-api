import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/keywords/all - SIN paginación (para editores/dropdowns)
router.get('/all', async (req, res) => {
  try {
    const keywords = await query(
      'SELECT id_keyword, nombre FROM keywords ORDER BY nombre ASC'
    );
    return res.json({ success: true, keywords });
  } catch (error) {
    console.error('Error al obtener todas las keywords:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/keywords/search - Búsqueda con autocomplete (max 10 resultados)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({ success: true, keywords: [] });
    }

    const keywords = await query(
      'SELECT id_keyword, nombre FROM keywords WHERE nombre LIKE ? ORDER BY nombre ASC LIMIT 10',
      [`%${q.trim()}%`]
    );
    return res.json({ success: true, keywords });
  } catch (error) {
    console.error('Error al buscar keywords:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/keywords - CON paginación (para administración)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [{ total }] = await query('SELECT COUNT(*) as total FROM keywords');

    const keywords = await query(
      'SELECT id_keyword, nombre FROM keywords ORDER BY id_keyword DESC LIMIT ? OFFSET ?',
      [parseInt(limit), offset]
    );

    return res.json({
      success: true,
      keywords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener keywords:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/keywords/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const keywords = await query(
      'SELECT id_keyword, nombre FROM keywords WHERE id_keyword = ?',
      [id]
    );

    if (keywords.length === 0) {
      return res.status(404).json({ error: 'Keyword no encontrada' });
    }

    return res.json({ success: true, keyword: keywords[0] });
  } catch (error) {
    console.error('Error al obtener keyword:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// POST /api/keywords
router.post('/', requireAuth, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const existentes = await query(
      'SELECT id_keyword FROM keywords WHERE nombre = ?',
      [nombre]
    );

    if (existentes.length > 0) {
      return res.status(400).json({ error: 'La keyword ya existe' });
    }

    const result = await query(
      'INSERT INTO keywords (nombre) VALUES (?)',
      [nombre]
    );

    return res.status(201).json({
      success: true,
      keyword: {
        id_keyword: result.insertId,
        nombre
      }
    });
  } catch (error) {
    console.error('Error al crear keyword:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// PUT /api/keywords/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const existentes = await query(
      'SELECT id_keyword FROM keywords WHERE id_keyword = ?',
      [id]
    );

    if (existentes.length === 0) {
      return res.status(404).json({ error: 'Keyword no encontrada' });
    }

    await query(
      'UPDATE keywords SET nombre = ? WHERE id_keyword = ?',
      [nombre, id]
    );

    return res.json({
      success: true,
      keyword: { id_keyword: parseInt(id), nombre }
    });
  } catch (error) {
    console.error('Error al actualizar keyword:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// DELETE /api/keywords/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM keywords WHERE id_keyword = ?', [id]);

    return res.json({ success: true, message: 'Keyword eliminada' });
  } catch (error) {
    console.error('Error al eliminar keyword:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
