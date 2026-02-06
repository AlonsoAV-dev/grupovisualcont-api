import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pages/keywords?page=contable
router.get('/', async (req, res) => {
  try {
    const { page: pageName } = req.query;

    if (!pageName) {
      return res.status(400).json({ error: 'El parámetro "page" es requerido' });
    }

    const pageKeywords = await query(
      `SELECT k.id_keyword, k.nombre as keyword
       FROM keywords k
       INNER JOIN page_keywords pk ON k.id_keyword = pk.id_keyword
       WHERE pk.page_name = ?
       ORDER BY k.nombre ASC`,
      [pageName]
    );

    return res.json({ 
      success: true, 
      page: pageName,
      keywords: pageKeywords 
    });
  } catch (error) {
    console.error('Error al obtener keywords de página:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// POST /api/pages/keywords
router.post('/', requireAuth, async (req, res) => {
  const connection = await query.constructor.prototype.getConnection ? 
    (await import('../config/db.js')).getConnection() : null;
  
  let conn;
  
  try {
    const { page: pageName, keywords } = req.body;

    if (!pageName) {
      return res.status(400).json({ error: 'El parámetro "page" es requerido' });
    }

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Las keywords son requeridas y deben ser un array' });
    }

    // Obtener conexión para transacción
    const pool = await (await import('../config/db.js')).getConnection();
    conn = await pool.getConnection();
    
    // Iniciar transacción
    await conn.beginTransaction();

    try {
      // 1. ELIMINAR todas las keywords anteriores de esta página
      const [deleteResult] = await conn.execute(
        'DELETE FROM page_keywords WHERE page_name = ?', 
        [pageName]
      );
      console.log(`🗑️  Keywords eliminadas de '${pageName}':`, deleteResult.affectedRows || 0);

      // 2. Procesar keywords y eliminar duplicados
      const processedKeywordIds = new Set();
      const keywordsToInsert = [];

      for (const keyword of keywords) {
        // Validar que la keyword no esté vacía
        if (!keyword || (typeof keyword === 'string' && keyword.trim() === '')) {
          continue;
        }

        let id_keyword;
        
        // Si viene como número (ID existente)
        if (typeof keyword === 'number' && keyword > 0) {
          id_keyword = keyword;
        } 
        // Si viene como string (nombre de keyword)
        else if (typeof keyword === 'string') {
          const keywordName = keyword.trim();
          
          // Buscar si la keyword ya existe
          const [existing] = await conn.execute(
            'SELECT id_keyword FROM keywords WHERE nombre = ?', 
            [keywordName]
          );
          
          if (existing.length > 0) {
            id_keyword = existing[0].id_keyword;
          } else {
            // Crear la keyword
            const [keywordResult] = await conn.execute(
              'INSERT INTO keywords (nombre) VALUES (?)', 
              [keywordName]
            );
            id_keyword = keywordResult.insertId;
          }
        } 
        else {
          continue;
        }
        
        // Evitar duplicados
        if (!processedKeywordIds.has(id_keyword)) {
          processedKeywordIds.add(id_keyword);
          keywordsToInsert.push(id_keyword);
        }
      }

      // 3. INSERTAR las nuevas keywords
      for (const id_keyword of keywordsToInsert) {
        await conn.execute(
          'INSERT INTO page_keywords (page_name, id_keyword) VALUES (?, ?)', 
          [pageName, id_keyword]
        );
      }

      // Confirmar transacción
      await conn.commit();
      
      console.log(`✅ Keywords insertadas en '${pageName}': ${keywordsToInsert.length}`);

      return res.json({
        success: true,
        message: 'Keywords de página actualizadas correctamente',
        total: keywordsToInsert.length
      });

    } catch (txError) {
      // Revertir transacción en caso de error
      await conn.rollback();
      throw txError;
    }

  } catch (error) {
    console.error('Error al actualizar keywords de página:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Error en el servidor' 
    });
  } finally {
    // Liberar conexión
    if (conn) {
      conn.release();
    }
  }
});

export default router;
