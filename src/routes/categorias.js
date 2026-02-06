import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Función helper para generar slug
function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/categorias
router.get('/', async (req, res) => {
  try {
    const categorias = await query(
      'SELECT id_categoria, nombre, slug, descripcion, estado FROM categorias WHERE estado = 1 ORDER BY id_categoria DESC'
    );

    return res.json({ success: true, categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// GET /api/categorias/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categorias = await query(
      'SELECT id_categoria, nombre, slug, descripcion, estado FROM categorias WHERE id_categoria = ?',
      [id]
    );

    if (categorias.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    return res.json({ success: true, categoria: categorias[0] });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// POST /api/categorias
router.post('/', requireAuth, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    let slug = generarSlug(nombre);
    
    const slugsExistentes = await query('SELECT slug FROM categorias WHERE slug LIKE ?', [`${slug}%`]);
    
    if (slugsExistentes.length > 0) {
      const slugs = slugsExistentes.map(c => c.slug);
      let contador = 1;
      let slugFinal = slug;
      while (slugs.includes(slugFinal)) {
        slugFinal = `${slug}-${contador}`;
        contador++;
      }
      slug = slugFinal;
    }

    const result = await query(
      'INSERT INTO categorias (nombre, slug, descripcion) VALUES (?, ?, ?)',
      [nombre, slug, descripcion || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Categoría creada correctamente',
      categoria: {
        id_categoria: result.insertId,
        nombre,
        slug,
        descripcion: descripcion || null,
        estado: 1
      }
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// PUT /api/categorias/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    let slug = generarSlug(nombre);
    
    const slugsExistentes = await query(
      'SELECT slug FROM categorias WHERE slug LIKE ? AND id_categoria != ?',
      [`${slug}%`, id]
    );
    
    if (slugsExistentes.length > 0) {
      const slugs = slugsExistentes.map(c => c.slug);
      let contador = 1;
      let slugFinal = slug;
      while (slugs.includes(slugFinal)) {
        slugFinal = `${slug}-${contador}`;
        contador++;
      }
      slug = slugFinal;
    }

    await query(
      'UPDATE categorias SET nombre = ?, slug = ?, descripcion = ?, estado = ? WHERE id_categoria = ?',
      [nombre, slug, descripcion || null, estado !== undefined ? estado : 1, id]
    );

    return res.json({
      success: true,
      message: 'Categoría actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM categorias WHERE id_categoria = ?', [id]);

    return res.json({ success: true, message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
