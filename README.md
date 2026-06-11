# FIAUct — Catálogo Académico de la Facultad de Ingeniería y Arquitectura

FIAUct es una aplicación web moderna y premium diseñada para la **Facultad de Ingeniería y Arquitectura (FIA) de la Universidad Católica de Trujillo (UCT)**. Permite a estudiantes, docentes y administradores explorar y administrar el catálogo completo de programas, modalidades, ciclos y cursos.

---

## 🚀 Características Principales

### 📖 Exploración de Catálogo Académico
* **Estructura Modular**: Navegación jerárquica intuitiva y limpia: **Programas Académicos ➔ Modalidades (Presencial / Virtual) ➔ Ciclos (I al X) ➔ Listado de Cursos**.
* **Búsqueda Global en Inicio**: Barra de búsqueda interactiva con filtrado inmediato por nombre de curso, docente o código de asignatura.
* **Diseño Responsivo Mobile-First**: Visualización optimizada para dispositivos móviles con botones táctiles de ancho completo, grilla de ciclos compacta (4 columnas en desktop) y orden adaptativo (ficha del programa prioritario arriba en pantallas táctiles).
* **Detalle de Cursos**: Información técnica completa sobre cada asignatura (docente asignado, créditos, tipo de estudio, horas y modalidad) con un botón de regreso integrado directamente en el encabezado.

### ⚡ Arquitectura Optimizada de Lecturas
* **Público desde JSON estático**: Las vistas públicas leen `public/courses.json`, evitando consumir lecturas de Firestore por cada visitante.
* **Admin desde Firestore**: Las pantallas administrativas leen y escriben directamente en Firestore para trabajar con datos frescos.
* **Publicación automática**: Después de crear, editar o eliminar un curso, una serverless segura en Vercel dispara un GitHub Action que regenera `public/courses.json` y deja listo el redeploy.

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
* **Base de Datos y Seguridad**: Firebase 12.14.0 (Auth y Firestore con reglas de seguridad)
* **Pruebas**: Vitest 4.1.8 + React Testing Library (10/10 pruebas unitarias aprobadas)
* **Despliegue**: Vercel + GitHub Actions

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
Abre tu archivo `.env` e ingresa las credenciales del cliente de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key_aquí
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

Si vas a ejecutar la exportación del catálogo localmente, agrega también una credencial de Firebase Admin SDK:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
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

### 6. Exportar el catálogo estático manualmente
Si deseas regenerar `public/courses.json` desde tu máquina:
```bash
npm run export:catalog
```

Este comando requiere `FIREBASE_SERVICE_ACCOUNT_PATH` o `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## ☁️ Despliegue en Vercel

El proyecto incluye `vercel.json` para reescribir peticiones internas hacia `index.html`, evitando 404 al recargar rutas secundarias en la SPA.

### Variables de entorno en Vercel

En **Settings → Environment Variables**, configura:

#### Frontend
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

#### Serverless segura (`/api/trigger-catalog-export`)
* `FIREBASE_SERVICE_ACCOUNT_JSON`
* `GITHUB_TOKEN`
* `GITHUB_REPO_OWNER`
* `GITHUB_REPO_NAME`

`FIREBASE_SERVICE_ACCOUNT_JSON` debe contener el JSON completo del service account de Firebase Admin SDK. No uses esta credencial en el frontend ni con prefijo `VITE_`.

### Flujo de publicación

1. El visitante público consulta `public/courses.json`.
2. El admin inicia sesión y crea/edita/elimina cursos en Firestore.
3. La app llama a `/api/trigger-catalog-export`.
4. La serverless verifica el Firebase ID token y el rol `admin` en `users/{uid}`.
5. La serverless dispara el workflow de GitHub vía `repository_dispatch`.
6. GitHub Actions ejecuta `npm run export:catalog`, actualiza `public/courses.json` y hace commit si hubo cambios.
7. Vercel detecta el commit y redeploya la web pública.

### Secrets en GitHub Actions

En el repositorio, configura este secret en **Settings → Secrets and variables → Actions**:

* `FIREBASE_SERVICE_ACCOUNT_JSON`

Ese secret es el que usa `.github/workflows/export-catalog.yml` para leer Firestore desde GitHub Actions.

### Token recomendado para GitHub

Para `GITHUB_TOKEN` en Vercel, usa un **Fine-grained personal access token** con permisos sobre este repositorio:

* `Actions`: Read and write
* `Contents`: Read and write
* `Metadata`: Read-only

No reutilices el token automático interno de GitHub Actions en Vercel.

### Reglas de Firestore recomendadas

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    match /courses/{courseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /users/{uid} {
      allow read: if isSignedIn() && request.auth.uid == uid;
      allow write: if false;
    }

    match /app_metadata/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### Cómo probar en producción

1. Haz deploy con las variables ya configuradas.
2. Inicia sesión como admin.
3. Edita un curso y guarda.
4. Verifica en DevTools que `POST /api/trigger-catalog-export` responda `202`.
5. Abre GitHub Actions y confirma que arrancó `Exportar catálogo de cursos a courses.json`.
6. Espera el commit automático y el redeploy de Vercel.
7. Revisa la vista pública para confirmar que el cambio ya llegó al JSON estático.

---

## 📁 Estructura del Proyecto

```text
fia-uct/
├── .env.example           # Plantilla de variables frontend, backend y CI/CD
├── api/                   # Serverless functions de Vercel
│   └── trigger-catalog-export.js
├── .github/
│   └── workflows/
│       └── export-catalog.yml
├── vercel.json            # Configuración de rutas SPA para Vercel
├── vite.config.js         # Configuración de Vite y Tailwind
├── index.html             # Entrada HTML principal con metatags SEO
├── public/                # Activos estáticos (favicon, logotipos, etc.)
│   ├── favicon.webp
│   ├── logo.webp
│   └── courses.json       # Catálogo público estático exportado desde Firestore
├── scripts/
│   └── exportCatalogFromFirestore.js
├── src/
│   ├── __tests__/         # Suite de pruebas unitarias
│   ├── components/        # Componentes comunes (Card, Layout, SearchBar, etc.)
│   ├── context/           # Contexto global de autenticación
│   ├── hooks/             # Hooks personalizados de React
│   ├── pages/             # Vistas de la aplicación (Home, Detail, Login, etc.)
│   ├── services/          # Lecturas públicas vía JSON y CRUD admin en Firestore
│   ├── utils/             # Funciones utilitarias (normalización de textos)
│   ├── App.jsx            # Enrutamiento principal
│   ├── index.css          # Estilos de Tailwind v4 y configuraciones de diseño
│   └── main.jsx           # Punto de entrada de React
```
