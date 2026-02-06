import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Función helper para generar descripción corta desde contenido HTML
function generarDescripcionCorta(contenidoHTML, maxCaracteres = 160) {
  let textoPlano = contenidoHTML.replace(/<[^>]*>/g, ' ');
  
  const entidades = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'",
    '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
    '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú',
    '&ntilde;': 'ñ', '&Ntilde;': 'Ñ', '&uuml;': 'ü', '&Uuml;': 'Ü',
    '&iexcl;': '¡', '&iquest;': '¿', '&deg;': '°', '&copy;': '©', '&reg;': '®',
  };
  
  textoPlano = textoPlano.replace(/&[a-zA-Z]+;/g, (match) => entidades[match] || match);
  textoPlano = textoPlano.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  textoPlano = textoPlano.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  textoPlano = textoPlano.replace(/\s+/g, ' ').trim();
  
  if (textoPlano.length <= maxCaracteres) {
    return textoPlano;
  }
  
  let descripcion = textoPlano.substring(0, maxCaracteres);
  const ultimoEspacio = descripcion.lastIndexOf(' ');
  if (ultimoEspacio > maxCaracteres * 0.8) {
    descripcion = descripcion.substring(0, ultimoEspacio);
  }
  
  return descripcion.trim() + '...';
}

// Función helper para generar slug
function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/noticias/slug/:slug (debe ir antes de /:id)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const noticias = await query(
      `SELECT 
        n.id_noticia, n.cod_unico, n.titulo, n.slug, n.contenido, n.descripcion_corta,
        n.imagen_principal, n.estado, n.fecha_publicacion, n.creado_en, n.id_categoria,
        a.nombre as autor_nombre, a.email as autor_email,
        c.nombre as categoria_nombre, c.slug as categoria_slug,
        GROUP_CONCAT(DISTINCT CONCAT(k.id_keyword, ':', k.nombre) SEPARATOR '||') as keywords_raw
       FROM noticias n
       LEFT JOIN autor a ON n.id_autor = a.id_autor
       LEFT JOIN categorias c ON n.id_categoria = c.id_categoria
       LEFT JOIN noticia_keyword nk ON n.id_noticia = nk.id_noticia
       LEFT JOIN keywords k ON nk.id_keyword = k.id_keyword
       WHERE n.slug = ? AND n.estado = 'publicada'
       GROUP BY n.id_noticia`,
      [slug]
    );

    if (noticias.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    const noticia = { ...noticias[0] };
    if (noticia.keywords_raw) {
      noticia.keywords = noticia.keywords_raw.split('||').map(kw => {
        const [id_keyword, nombre] = kw.split(':');
        return { id_keyword: parseInt(id_keyword), nombre };
      });
    } else {
      noticia.keywords = [];
    }
    delete noticia.keywords_raw;

    return res.json({ success: true, noticia });
  } catch (error) {
    console.error('Error al obtener noticia por slug:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/noticias
router.get('/', async (req, res) => {
  try {
    const { estado, servicio, categoria, orderBy = 'fecha_publicacion', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT 
        n.id_noticia, n.cod_unico, n.titulo, n.slug, n.descripcion_corta,
        n.imagen_principal, n.estado, n.fecha_publicacion, n.creado_en,
        n.id_categoria, n.nombre_autor,
        COALESCE(n.nombre_autor, a.nombre) as autor_nombre,
        c.nombre as categoria_nombre, c.slug as categoria_slug
      FROM noticias n
      LEFT JOIN autor a ON n.id_autor = a.id_autor
      LEFT JOIN categorias c ON n.id_categoria = c.id_categoria
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      sql += ' AND n.estado = ?';
      params.push(estado);
    }

    if (servicio) {
      sql += ' AND n.id_servicio = ?';
      params.push(servicio);
    }

    if (categoria) {
      sql += ' AND n.id_categoria = ?';
      params.push(categoria);
    }

    const countSql = `SELECT COUNT(*) as total FROM noticias n WHERE 1=1 ${
      estado ? 'AND n.estado = ?' : ''
    } ${servicio ? 'AND n.id_servicio = ?' : ''} ${categoria ? 'AND n.id_categoria = ?' : ''}`;
    const countParams = params.slice();
    const [{ total }] = await query(countSql, countParams);

    if (orderBy === 'creado_en') {
      sql += ' ORDER BY n.creado_en DESC';
    } else {
      sql += ' ORDER BY n.fecha_publicacion DESC, n.creado_en DESC';
    }
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const noticias = await query(sql, params);

    return res.json({
      success: true,
      noticias,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// POST /api/noticias
router.post('/', requireAuth, async (req, res) => {
  try {
    const { 
      titulo, contenido, imagen_principal, id_categoria, 
      nombre_autor, estado, keywords 
    } = req.body;

    if (!titulo || !contenido || !nombre_autor) {
      return res.status(400).json({ error: 'Campos requeridos: titulo, contenido, nombre_autor' });
    }

    const descripcion_corta = generarDescripcionCorta(contenido);
    const cod_unico = `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let slug = generarSlug(titulo);
    const slugsExistentes = await query('SELECT slug FROM noticias WHERE slug LIKE ?', [`${slug}%`]);
    
    if (slugsExistentes.length > 0) {
      const slugs = slugsExistentes.map(n => n.slug);
      let contador = 1;
      let slugFinal = slug;
      while (slugs.includes(slugFinal)) {
        slugFinal = `${slug}-${contador}`;
        contador++;
      }
      slug = slugFinal;
    }

    const fecha_publicacion = estado === 'publicada' ? new Date() : null;

    const result = await query(
      `INSERT INTO noticias 
       (cod_unico, titulo, slug, contenido, descripcion_corta, imagen_principal, id_categoria, id_servicio, nombre_autor, estado, fecha_publicacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cod_unico, titulo, slug, contenido, descripcion_corta, imagen_principal || null,
       id_categoria || null, null, nombre_autor, estado || 'borrador', fecha_publicacion]
    );

    const id_noticia = result.insertId;

    if (keywords && Array.isArray(keywords) && keywords.length > 0) {
      for (const keyword of keywords) {
        let id_keyword;
        
        if (typeof keyword === 'number' && keyword > 0) {
          id_keyword = keyword;
        } else if (typeof keyword === 'string') {
          const existing = await query('SELECT id_keyword FROM keywords WHERE nombre = ?', [keyword]);
          
          if (existing.length > 0) {
            id_keyword = existing[0].id_keyword;
          } else {
            const keywordResult = await query('INSERT INTO keywords (nombre) VALUES (?)', [keyword]);
            id_keyword = keywordResult.insertId;
          }
        } else {
          continue;
        }
        
        await query('INSERT INTO noticia_keyword (id_noticia, id_keyword) VALUES (?, ?)', [id_noticia, id_keyword]);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Noticia creada correctamente',
      id_noticia,
    });
  } catch (error) {
    console.error('Error al crear noticia:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// GET /api/noticias/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const noticias = await query(
      `SELECT n.*, a.nombre as autor_nombre, s.nombre as servicio_nombre, c.nombre as categoria_nombre, c.slug as categoria_slug
       FROM noticias n
       LEFT JOIN autor a ON n.id_autor = a.id_autor
       LEFT JOIN servicios s ON n.id_servicio = s.id_servicio
       LEFT JOIN categorias c ON n.id_categoria = c.id_categoria
       WHERE n.id_noticia = ?`,
      [id]
    );

    if (noticias.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    const keywords = await query(
      `SELECT k.id_keyword, k.nombre
       FROM keywords k
       INNER JOIN noticia_keyword nk ON k.id_keyword = nk.id_keyword
       WHERE nk.id_noticia = ?`,
      [id]
    );

    console.log(`📰 Noticia ${id}: ${noticias[0].titulo}`);
    console.log(`🏷️  Keywords encontradas (${keywords.length}):`, keywords.map(k => `${k.id_keyword}:${k.nombre}`).join(', '));

    const noticia = { ...noticias[0], keywords };

    return res.json({ success: true, noticia });
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// PUT /api/noticias/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, imagen_principal, id_categoria, nombre_autor, estado, keywords } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'Titulo y contenido son requeridos' });
    }

    const descripcion_corta = generarDescripcionCorta(contenido);
    let slug = generarSlug(titulo);
    
    const slugsExistentes = await query(
      'SELECT slug FROM noticias WHERE slug LIKE ? AND id_noticia != ?',
      [`${slug}%`, id]
    );
    
    if (slugsExistentes.length > 0) {
      const slugs = slugsExistentes.map(n => n.slug);
      let contador = 1;
      let slugFinal = slug;
      while (slugs.includes(slugFinal)) {
        slugFinal = `${slug}-${contador}`;
        contador++;
      }
      slug = slugFinal;
    }

    const noticiaActual = await query('SELECT estado, fecha_publicacion FROM noticias WHERE id_noticia = ?', [id]);
    
    let fecha_publicacion = noticiaActual[0].fecha_publicacion;
    if (estado === 'publicada' && noticiaActual[0].estado !== 'publicada' && !fecha_publicacion) {
      fecha_publicacion = new Date();
    }

    await query(
      `UPDATE noticias 
       SET titulo = ?, slug = ?, contenido = ?, descripcion_corta = ?, imagen_principal = ?, id_categoria = ?, nombre_autor = ?, estado = ?, fecha_publicacion = ?
       WHERE id_noticia = ?`,
      [titulo, slug, contenido, descripcion_corta, imagen_principal || null, id_categoria || null, 
       nombre_autor, estado || 'borrador', fecha_publicacion, id]
    );

    if (keywords && Array.isArray(keywords)) {
      await query('DELETE FROM noticia_keyword WHERE id_noticia = ?', [id]);

      for (const keyword of keywords) {
        let id_keyword;
        
        if (typeof keyword === 'number' && keyword > 0) {
          const keywordExists = await query('SELECT id_keyword FROM keywords WHERE id_keyword = ?', [keyword]);
          if (keywordExists.length === 0) continue;
          id_keyword = keyword;
        } else if (typeof keyword === 'string') {
          const existing = await query('SELECT id_keyword FROM keywords WHERE nombre = ?', [keyword]);
          
          if (existing.length > 0) {
            id_keyword = existing[0].id_keyword;
          } else {
            const keywordResult = await query('INSERT INTO keywords (nombre) VALUES (?)', [keyword]);
            id_keyword = keywordResult.insertId;
          }
        } else {
          continue;
        }
        
        await query('INSERT INTO noticia_keyword (id_noticia, id_keyword) VALUES (?, ?)', [id, id_keyword]);
      }
    }

    return res.json({ success: true, message: 'Noticia actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar noticia:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

// DELETE /api/noticias/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM noticia_keyword WHERE id_noticia = ?', [id]);
    await query('DELETE FROM noticias WHERE id_noticia = ?', [id]);

    return res.json({ success: true, message: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    return res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
});

export default router;
