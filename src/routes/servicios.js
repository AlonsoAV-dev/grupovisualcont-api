import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/servicios
router.get('/', async (req, res) => {
  try {
    const servicios = await query(
      'SELECT * FROM servicios WHERE estado = 1 ORDER BY id_servicio DESC'
    );

    return res.json({ success: true, servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/servicios/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const servicios = await query(
      'SELECT * FROM servicios WHERE id_servicio = ?',
      [id]
    );

    if (servicios.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    return res.json({ success: true, servicio: servicios[0] });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// POST /api/servicios
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const result = await query(
      'INSERT INTO servicios (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Servicio creado correctamente',
      id_servicio: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// PUT /api/servicios/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    await query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, estado = ? WHERE id_servicio = ?',
      [nombre, descripcion || null, estado !== undefined ? estado : 1, id]
    );

    return res.json({
      success: true,
      message: 'Servicio actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// DELETE /api/servicios/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { id } = req.params;

    await query('DELETE FROM servicios WHERE id_servicio = ?', [id]);

    return res.json({ success: true, message: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
