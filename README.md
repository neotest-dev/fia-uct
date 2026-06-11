# FIAUct — Catálogo Académico de la Facultad de Ingeniería y Arquitectura

FIAUct es una aplicación web moderna y premium diseñada para la **Facultad de Ingeniería y Arquitectura (FIA) de la Universidad Católica de Trujillo (UCT)**. Permite a los estudiantes, docentes y administradores explorar el catálogo completo de programas académicos, modalidades de estudio, ciclos y cursos en tiempo real.

---

## 🚀 Características Principales

### 📖 Exploración de Catálogo Académico
* **Estructura Modular**: Navegación jerárquica intuitiva y limpia: **Programas Académicos ➔ Modalidades (Presencial / Virtual) ➔ Ciclos (I al X) ➔ Listado de Cursos**.
* **Búsqueda Global en Inicio**: Barra de búsqueda interactiva con filtrado inmediato por nombre de curso, docente o código de asignatura.
* **Diseño Responsivo Mobile-First**: Visualización optimizada para dispositivos móviles con botones táctiles de ancho completo, grilla de ciclos compacta (4 columnas en desktop) y orden adaptativo (ficha del programa prioritario arriba en pantallas táctiles).
* **Detalle de Cursos**: Información técnica completa sobre cada asignatura (docente asignado, créditos, tipo de estudio, horas y modalidad) con un botón de regreso integrado directamente en el encabezado.

### ⚡ Sincronización en Tiempo Real Ultra-Eficiente
* **Firebase Firestore**: Los cambios realizados en el catálogo por los administradores se reflejan de inmediato en la ficha del curso sin necesidad de recargar la página.
* **Optimización de Consultas**: Implementa un Listener activo (`onSnapshot`) filtrado directamente por query de campo `codigo`, garantizando que solo se realice **1 lectura** por consulta en lugar de escanear la base de datos completa.

### 🛡️ Acceso Administrativo (Admin)
* **Autenticación Segura**: Panel de inicio de sesión administrativo controlado mediante Firebase Auth.
* **Gestión de Cursos (CRUD)**: Creación y edición de asignaturas directamente desde la plataforma para usuarios autenticados.
* **Usabilidad Premium**: Incorpora un botón de visibilidad ("ojito") para revelar/ocultar de forma segura la contraseña ingresada.

### 🔍 Optimización SEO y Estructura Técnica
* **Títulos Dinámicos**: Modificación limpia del título del navegador (`document.title`) en cada vista para optimizar la indexación de páginas en buscadores.
* **Metadatos Open Graph / Twitter**: Configuración completa en el encabezado de `index.html` para la previsualización estética al compartir la URL en redes sociales.
* **Datos Estructurados JSON-LD**: Inyección automática de esquemas estándar de Schema.org (`Course`) en los detalles del curso, facilitando la indexación semántica en Google.

---

## 🛠️ Stack Tecnológico

* **Core**: React 19 (con React Compiler activo)
* **Compilador y Herramienta de Construcción**: Vite 8 (con Rolldown)
* **Enrutamiento**: React Router v7 (para Single Page Applications)
* **Estilos (CSS)**: Tailwind CSS v4 (incorporando variables de tema personalizadas y Glassmorphism)
* **Iconografía**: Lucide React (iconos vectoriales homogéneos de alta fidelidad)
* **Base de Datos y Seguridad**: Firebase 12.14.0 (Auth y Firestore con políticas de seguridad RLS)
* **Pruebas**: Vitest 4.1.8 + React Testing Library (10/10 pruebas unitarias aprobadas)
* **Despliegue**: Optimizado para Vercel (SPA redirections en `vercel.json`)

---

## 📦 Instalación y Configuración Local

### 1. Clonar el repositorio e instalar dependencias
```bash
npm install
```

### 2. Configurar las Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto basándote en el archivo de plantilla `.env.example`:
```bash
# Copia la plantilla
cp .env.example .env
```
Abre tu archivo `.env` e ingresa las credenciales de tu proyecto de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key_aquí
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Ejecutar el Servidor de Desarrollo
Inicia el entorno de desarrollo local con Vite:
```bash
npm run dev
```
La aplicación estará disponible por defecto en `http://localhost:5173/` (o el siguiente puerto libre).

### 4. Ejecutar Pruebas Unitarias
Para correr los tests automatizados con Vitest:
```bash
npm run test
```

### 5. Compilar para Producción
Para generar el bundle de producción optimizado en la carpeta `/dist`:
```bash
npm run build
```

---

## ☁️ Despliegue en Vercel

El proyecto incluye el archivo `vercel.json` configurado para reescribir todas las peticiones internas hacia `index.html`, evitando el típico error 404 al recargar páginas secundarias en aplicaciones de una sola página (SPA).

Al conectar tu repositorio a **Vercel**, asegúrate de agregar las variables de entorno de Firebase en la sección de **Settings -> Environment Variables**:
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

---

## 📁 Estructura del Proyecto

```text
fia-uct/
├── .env.example           # Plantilla de configuración de Firebase
├── vercel.json            # Configuración de rutas SPA para Vercel
├── vite.config.js         # Configuración de Vite y Tailwind
├── index.html             # Entrada HTML principal con metatags SEO
├── public/                # Activos estáticos (favicon, logotipos, etc.)
│   ├── favicon.webp
│   └── logo.webp
├── src/
│   ├── __tests__/         # Suite de pruebas unitarias
│   ├── components/        # Componentes comunes (Card, Layout, SearchBar, etc.)
│   ├── context/           # Contexto global de autenticación
│   ├── hooks/             # Hooks personalizados de React
│   ├── pages/             # Vistas de la aplicación (Home, Detail, Login, etc.)
│   ├── services/          # Conexión y queries eficientes a Firebase
│   ├── utils/             # Funciones utilitarias (normalización de textos)
│   ├── App.jsx            # Enrutamiento principal
│   ├── index.css          # Estilos de Tailwind v4 y configuraciones de diseño
│   └── main.jsx           # Punto de entrada de React
```
