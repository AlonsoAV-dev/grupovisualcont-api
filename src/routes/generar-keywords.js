import express from 'express';

const router = express.Router();

// POST /api/keywords/generar
router.post('/generar', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key de Groq no configurada' });
    }

    const { titulo, contenido } = req.body;

    if (!titulo && !contenido) {
      return res.status(400).json({ error: 'Se requiere título o contenido' });
    }

    // Limpiar HTML y decodificar entidades
    let contenidoLimpio = contenido
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const entidades = {
      '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
      '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
      '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú',
      '&ntilde;': 'ñ', '&Ntilde;': 'Ñ',
      '&uuml;': 'ü', '&Uuml;': 'Ü',
      '&iexcl;': '¡', '&iquest;': '¿',
    };

    contenidoLimpio = contenidoLimpio.replace(/&[a-zA-Z]+;/g, (match) => entidades[match] || match);
    contenidoLimpio = contenidoLimpio.substring(0, 2000);

    const prompt = `Analiza este artículo y genera 5-8 keywords/frases clave relevantes para SEO.

**Título:** ${titulo}

**Contenido:** ${contenidoLimpio}

**REGLAS:**
1. Extrae keywords ÚNICAMENTE basándote en el contenido proporcionado
2. Usa frases de 2-4 palabras cuando sea apropiado
3. Prioriza términos que un usuario buscaría en Google
4. Si aparecen términos técnicos específicos (siglas, leyes, organizaciones), inclúyelos
5. No inventes términos que no estén en el texto
6. Evita palabras muy genéricas como "empresa", "proceso", "sistema", etc.

**FORMATO DE RESPUESTA:**
Devuelve SOLO las keywords separadas por comas, sin numeración ni explicaciones.

Ejemplo: facturación electrónica, SUNAT, comprobantes de pago, sistema tributario`;

    console.log('Llamando a Groq API (Llama 3.3 70B)...');

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en SEO para empresas de software contable en Perú. Genera keywords relevantes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error de Groq API:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Respuesta recibida de Groq');

    const generatedText = data.choices?.[0]?.message?.content || '';
    console.log('Texto generado:', generatedText);

    // Limpiar y procesar keywords
    const keywords = generatedText
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0 && k.length < 50)
      .slice(0, 8);

    return res.json({
      success: true,
      keywords: keywords,
    });
  } catch (error) {
    console.error('Error al generar keywords:', error);
    return res.status(500).json({
      error: 'Error al generar keywords. Intenta nuevamente.',
      details: error.message,
    });
  }
});

export default router;
