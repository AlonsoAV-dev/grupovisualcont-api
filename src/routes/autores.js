import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// GET /api/autores
router.get('/', async (req, res) => {
  try {
    const autores = await query(
      'SELECT id_autor, nombre, email, tipo, estado FROM autor WHERE estado = "activo" ORDER BY id_autor DESC'
    );

    return res.json({ success: true, autores });
  } catch (error) {
    console.error('Error al obtener autores:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
