/* =========================================================
   BASE DE DATOS - VisualCont Blog
========================================================= */

DROP DATABASE IF EXISTS visualcont_blog;

CREATE DATABASE visualcont_blog
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE visualcont_blog;

/* =========================================================
   USUARIOS (LOGIN / BACKEND)
========================================================= */
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin','editor') NOT NULL,
    estado TINYINT DEFAULT 1,
    ultimo_login TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =========================================================
   AUTOR (NOTICIAS + COMENTARIOS)
========================================================= */
CREATE TABLE autor (
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    tipo ENUM('interno','externo') DEFAULT 'externo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =========================================================
   SERVICIOS
========================================================= */
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado TINYINT DEFAULT 1
);

/* =========================================================
   KEYWORDS (SEO)
========================================================= */
CREATE TABLE keywords (
    id_keyword INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

/* =========================================================
   CATEGORÍAS
========================================================= */
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado TINYINT DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =========================================================
   SERVICIO ↔ KEYWORD
========================================================= */
CREATE TABLE servicio_keyword (
    id_servicio INT,
    id_keyword INT,
    PRIMARY KEY (id_servicio, id_keyword),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_keyword) REFERENCES keywords(id_keyword)
);

/* =========================================================
   NOTICIAS
========================================================= */
CREATE TABLE noticias (
    id_noticia INT AUTO_INCREMENT PRIMARY KEY,
    cod_unico VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    contenido TEXT NOT NULL,
    descripcion_corta VARCHAR(500),
    imagen_principal VARCHAR(255),
    id_categoria INT,
    id_servicio INT,
    id_autor INT NOT NULL,
    estado ENUM('publicada','borrador') DEFAULT 'borrador',
    fecha_publicacion DATETIME,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
);

/* =========================================================
   NOTICIA ↔ KEYWORD
========================================================= */
CREATE TABLE noticia_keyword (
    id_noticia INT,
    id_keyword INT,
    PRIMARY KEY (id_noticia, id_keyword),
    FOREIGN KEY (id_noticia) REFERENCES noticias(id_noticia),
    FOREIGN KEY (id_keyword) REFERENCES keywords(id_keyword)
);

/* =========================================================
   PAGE KEYWORDS (Keywords para landing pages)
   Páginas soportadas: home, contable, erp, facturador, 
   planilla, nosotros
========================================================= */
CREATE TABLE page_keywords (
    page_name VARCHAR(50) NOT NULL,
    id_keyword INT NOT NULL,
    PRIMARY KEY (page_name, id_keyword),
    FOREIGN KEY (id_keyword) REFERENCES keywords(id_keyword)
);

/* =========================================================
   COMENTARIOS
   Estados:
   1 = Aprobado
   2 = En espera
   3 = Spam
========================================================= */
CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_noticia INT NOT NULL,
    id_autor INT NOT NULL,
    comentario TEXT NOT NULL,
    estado TINYINT NOT NULL DEFAULT 2,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_noticia) REFERENCES noticias(id_noticia),
    FOREIGN KEY (id_autor) REFERENCES autor(id_autor)
);

/* =========================================================
   DATOS DE EJEMPLO
========================================================= */

-- Usuario administrador inicial (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@visualcont.com', '$2a$10$rKZL8xqJYXZ5YQJ5YQJ5YOZqJYXZ5YQJ5YQJ5YOZqJYXZ5YQJ5YQJ', 'admin');

-- Autor interno de ejemplo
INSERT INTO autor (nombre, email, tipo) VALUES 
('Equipo VisualCont', 'blog@visualcont.com', 'interno');

-- Servicios de ejemplo
INSERT INTO servicios (nombre, descripcion) VALUES 
('Sistema Contable', 'Software de contabilidad empresarial'),
('Sistema ERP', 'Sistema de planificación de recursos empresariales'),
('Facturador Electrónico', 'Solución de facturación electrónica'),
('Sistema de Planillas', 'Gestión de recursos humanos y planillas');

-- Keywords de ejemplo
INSERT INTO keywords (nombre) VALUES 
('contabilidad'),
('tributación'),
('facturación'),
('SUNAT'),
('empresas'),
('software');

-- Categorías de ejemplo
INSERT INTO categorias (nombre, slug, descripcion) VALUES 
('Contabilidad', 'contabilidad', 'Noticias sobre contabilidad empresarial'),
('Tributación', 'tributacion', 'Novedades y actualizaciones tributarias'),
('Laboral', 'laboral', 'Temas relacionados con recursos humanos y planillas'),
('Tecnología', 'tecnologia', 'Innovación y tecnología empresarial');
