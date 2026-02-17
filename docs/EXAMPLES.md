# 💡 Ejemplos de Uso - GrupoVisualCont API

Ejemplos prácticos de cómo consumir la API en diferentes escenarios.

## 📋 Índice

1. [Autenticación](#-autenticación)
2. [Gestión de Noticias](#-gestión-de-noticias)
3. [Keywords SEO](#-keywords-seo)
4. [Comentarios](#-comentarios)
5. [Frontend React](#-integración-con-react)
6. [Frontend Next.js](#-integración-con-nextjs)
7. [Testing con cURL](#-testing-con-curl)

---

## 🔐 Autenticación

### Ejemplo 1: Login Básico (JavaScript)

```javascript
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Guardar token en localStorage (opcional)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      
      console.log('✅ Login exitoso:', data.usuario.nombre);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

// Uso
login('admin@visualcont.com', 'admin123')
  .then(data => console.log('Usuario:', data.usuario))
  .catch(err => console.error(err));
```

### Ejemplo 2: Verificar Sesión Activa

```javascript
async function verificarSesion() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/me', {
      credentials: 'include', // Envía cookie automáticamente
      // O usar Bearer token:
      // headers: {
      //   'Authorization': `Bearer ${localStorage.getItem('token')}`
      // }
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Sesión activa:', data.user);
      return data.user;
    } else {
      console.log('❌ No hay sesión activa');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

### Ejemplo 3: Logout

```javascript
async function logout() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Sesión cerrada');
    }
  } catch (error) {
    console.error('Error en logout:', error);
  }
}
```

---

## 📰 Gestión de Noticias

### Ejemplo 1: Listar Noticias Publicadas (Público)

```javascript
async function obtenerNoticiasPublicas(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/noticias?estado=publicada&page=${page}&limit=${limit}`
    );
    
    const data = await response.json();

    if (data.success) {
      console.log(`📰 ${data.noticias.length} noticias encontradas`);
      console.log(`Página ${data.pagination.page} de ${data.pagination.totalPages}`);
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uso
obtenerNoticiasPublicas(1, 10).then(data => {
  data.noticias.forEach(noticia => {
    console.log(`- ${noticia.titulo} (${noticia.categoria_nombre})`);
  });
});
```

### Ejemplo 2: Obtener Noticia por Slug (Frontend)

```javascript
async function obtenerNoticiaPorSlug(slug) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/noticias/slug/${slug}`
    );
    
    const data = await response.json();

    if (data.success) {
      const { noticia } = data;
      console.log('📄 Noticia:', noticia.titulo);
      console.log('✍️ Autor:', noticia.autor_nombre);
      console.log('🏷️ Keywords:', noticia.keywords.map(k => k.nombre).join(', '));
      return noticia;
    } else {
      console.error('❌ Noticia no encontrada');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Uso
obtenerNoticiaPorSlug('nueva-regulacion-tributaria-2024');
```

### Ejemplo 3: Crear Noticia (Admin)

```javascript
async function crearNoticia(datosNoticia) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:3001/api/noticias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(datosNoticia),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Noticia creada:', data.noticia.slug);
      return data.noticia;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Error al crear noticia:', error);
    throw error;
  }
}

// Uso
const nuevaNoticia = {
  titulo: 'Cambios en la facturación electrónica 2024',
  contenido: '<p>La SUNAT ha anunciado...</p>',
  id_categoria: 2,
  id_autor: 1,
  estado: 'borrador',
  keywords: [1, 3, 4],
};

crearNoticia(nuevaNoticia)
  .then(noticia => console.log('Slug:', noticia.slug))
  .catch(err => console.error(err));
```

### Ejemplo 4: Actualizar Noticia

```javascript
async function actualizarNoticia(id, cambios) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:3001/api/noticias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cambios),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Noticia actualizada');
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Publicar noticia en borrador
actualizarNoticia(5, {
  estado: 'publicada',
  fecha_publicacion: new Date().toISOString(),
});
```

---

## 🔑 Keywords SEO

### Ejemplo 1: Búsqueda Autocomplete

```javascript
async function buscarKeywords(termino) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/keywords/search?q=${encodeURIComponent(termino)}`
    );
    
    const data = await response.json();

    if (data.success) {
      return data.keywords;
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Uso en un input con autocompletado
const input = document.getElementById('keyword-input');
input.addEventListener('input', async (e) => {
  const termino = e.target.value;
  if (termino.length >= 2) {
    const resultados = await buscarKeywords(termino);
    mostrarSugerencias(resultados);
  }
});

function mostrarSugerencias(keywords) {
  const lista = document.getElementById('sugerencias');
  lista.innerHTML = keywords.map(k => 
    `<li data-id="${k.id_keyword}">${k.nombre}</li>`
  ).join('');
}
```

### Ejemplo 2: Generar Keywords con IA

```javascript
async function generarKeywordsIA(texto, cantidad = 5) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:3001/api/keywords/generar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ texto, cantidad }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('🤖 Keywords generadas por IA:', data.keywords);
      return data.keywords;
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Uso
const contenido = 'Artículo sobre la nueva regulación tributaria de la SUNAT...';
generarKeywordsIA(contenido, 5).then(keywords => {
  keywords.forEach(k => console.log(`- ${k}`));
});
```

---

## 💬 Comentarios

### Ejemplo 1: Mostrar Comentarios Públicos

```javascript
async function obtenerComentariosPublicos(idNoticia) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/comentarios/publicos?noticia=${idNoticia}`
    );
    
    const data = await response.json();

    if (data.success) {
      return data.comentarios;
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Mostrar en el frontend
async function renderizarComentarios(idNoticia) {
  const comentarios = await obtenerComentariosPublicos(idNoticia);
  const container = document.getElementById('comentarios');

  if (comentarios.length === 0) {
    container.innerHTML = '<p>No hay comentarios aún.</p>';
    return;
  }

  container.innerHTML = comentarios.map(c => `
    <div class="comentario">
      <strong>${c.autor_nombre}</strong>
      <span class="fecha">${new Date(c.creado_en).toLocaleDateString()}</span>
      <p>${c.comentario}</p>
    </div>
  `).join('');
}
```

### Ejemplo 2: Crear Comentario

```javascript
async function crearComentario(idNoticia, idAutor, texto) {
  try {
    const response = await fetch('http://localhost:3001/api/comentarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_noticia: idNoticia,
        id_autor: idAutor,
        comentario: texto,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Comentario enviado. Pendiente de moderación.');
      return true;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Uso en formulario
document.getElementById('form-comentario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = document.getElementById('comentario').value;
  const idNoticia = 1; // ID de la noticia actual
  const idAutor = 2;   // ID del autor (usuario público)

  const exito = await crearComentario(idNoticia, idAutor, texto);
  
  if (exito) {
    alert('Tu comentario ha sido enviado y está pendiente de aprobación.');
    e.target.reset();
  }
});
```

---

## ⚛️ Integración con React

### Ejemplo: Custom Hook para Autenticación

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      setUser(data.usuario);
      localStorage.setItem('token', data.token);
      return { success: true };
    }
    return { success: false, error: data.error };
  }

  async function logout() {
    await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Ejemplo: Componente de Login

```javascript
// components/Login.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit">Entrar</button>
    </form>
  );
}
```

### Ejemplo: Listar Noticias

```javascript
// components/Noticias.jsx
import { useState, useEffect } from 'react';

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function cargarNoticias() {
    try {
      const response = await fetch(
        'http://localhost:3001/api/noticias?estado=publicada&limit=10'
      );
      const data = await response.json();

      if (data.success) {
        setNoticias(data.noticias);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="noticias-lista">
      <h2>Últimas Noticias</h2>
      {noticias.map(noticia => (
        <article key={noticia.id_noticia} className="noticia-card">
          {noticia.imagen_principal && (
            <img src={noticia.imagen_principal} alt={noticia.titulo} />
          )}
          <h3>{noticia.titulo}</h3>
          <p>{noticia.descripcion_corta}</p>
          <span className="categoria">{noticia.categoria_nombre}</span>
          <a href={`/noticias/${noticia.slug}`}>Leer más →</a>
        </article>
      ))}
    </div>
  );
}
```

---

## 🔄 Integración con Next.js

### Ejemplo: Server-Side Fetching

```javascript
// pages/noticias/[slug].js
export async function getServerSideProps({ params }) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/noticias/slug/${params.slug}`
    );
    const data = await response.json();

    if (!data.success) {
      return { notFound: true };
    }

    return {
      props: {
        noticia: data.noticia,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    return { notFound: true };
  }
}

export default function NoticiaPage({ noticia }) {
  return (
    <article>
      <h1>{noticia.titulo}</h1>
      <p className="meta">
        Por {noticia.autor_nombre} | {noticia.categoria_nombre}
      </p>
      
      {noticia.imagen_principal && (
        <img src={noticia.imagen_principal} alt={noticia.titulo} />
      )}
      
      <div dangerouslySetInnerHTML={{ __html: noticia.contenido }} />
      
      <div className="keywords">
        {noticia.keywords.map(k => (
          <span key={k.id_keyword} className="keyword-tag">
            {k.nombre}
          </span>
        ))}
      </div>
    </article>
  );
}
```

---

## 🧪 Testing con cURL

### Script de Testing Completo

```bash
#!/bin/bash

API_URL="http://localhost:3001"

echo "🧪 Testing GrupoVisualCont API"
echo "================================"

# 1. Health Check
echo -e "\n1️⃣ Health Check"
curl -s "$API_URL/health" | jq

# 2. Login
echo -e "\n2️⃣ Login"
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visualcont.com","password":"admin123"}' \
  | jq -r '.token')

echo "Token obtenido: ${TOKEN:0:20}..."

# 3. Verificar sesión
echo -e "\n3️⃣ Verificar sesión"
curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.user'

# 4. Listar noticias
echo -e "\n4️⃣ Listar noticias"
curl -s "$API_URL/api/noticias?limit=3" | jq '.noticias[] | {titulo, slug}'

# 5. Crear keyword
echo -e "\n5️⃣ Crear keyword"
curl -s -X POST "$API_URL/api/keywords" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre":"testing"}' \
  | jq

# 6. Buscar keywords
echo -e "\n6️⃣ Buscar keywords"
curl -s "$API_URL/api/keywords/search?q=conta" | jq '.keywords'

echo -e "\n✅ Testing completado"
```

---

## 📚 Recursos Adicionales

- [Documentación API Completa](./API.md)
- [Autenticación JWT](./AUTHENTICATION.md)
- [Base de Datos](./DATABASE.md)
- [Configuración del Servidor](./SERVER.md)

---

**Última actualización**: Febrero 2026
