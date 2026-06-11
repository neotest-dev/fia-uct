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

## 🧭 Arquitectura Real del Proyecto

Este proyecto funciona con dos fuentes de datos distintas y eso es intencional:

1. **Público**: lee `public/courses.json`
2. **Admin**: lee y escribe directamente en Firestore

Cuando un admin crea, edita o elimina un curso:

1. Se guarda primero en Firestore.
2. La app llama a `/api/trigger-catalog-export`.
3. La serverless verifica que el usuario sea admin.
4. La serverless dispara el workflow de GitHub.
5. GitHub regenera `public/courses.json`.
6. Vercel redeploya la web pública.

Esto evita consumir lecturas públicas masivas de Firestore y mantiene los cambios administrativos sincronizados.

---

## ⚡ Arranque Rápido

Si clonas este repo desde cero, este es el orden recomendado:

1. `npm install`
2. Copia `.env.example` a `.env`
3. Configura las variables `VITE_FIREBASE_*`
4. Ejecuta `npm run dev`
5. Si vas a exportar catálogo localmente, agrega `FIREBASE_SERVICE_ACCOUNT_PATH`
6. Si vas a desplegar en Vercel, configura también las variables server-side y los secrets de GitHub

Si solo quieres correr la app localmente y navegar el catálogo, con `VITE_FIREBASE_*` basta.

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

### 7. Formato esperado de `public/courses.json`

El catálogo público debe mantenerse como un **array plano**. No debe incluir metadata raíz ni campos internos de Firestore.

Formato correcto:

```json
[
  {
    "programa": "Arquitectura",
    "modalidad": "Presencial",
    "ciclo": "I",
    "codigo": "PRARNOP240101",
    "curso": "Introducción a la arquitectura modular",
    "docente": "Wilmz Diego Mostacero Zarate",
    "mod-curso": "Presencial",
    "horas": 3,
    "creditos": 2,
    "tipoEstudio": "Estudios Específicos"
  }
]
```

No deben aparecer en el JSON público:

* `id`
* `updatedAt`
* `generatedAt`
* `catalogVersion`
* `totalCourses`
* `courses` como objeto raíz

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

### Qué hace el workflow `export-catalog.yml`

El workflow:

1. instala dependencias
2. ejecuta `npm run export:catalog`
3. compara `public/courses.json`
4. si hubo cambios, hace commit y push automático

Si el workflow genera un `courses.json` con formato incorrecto, el problema normalmente está en `scripts/exportCatalogFromFirestore.js`, no en Vercel.

### Token recomendado para GitHub

Para `GITHUB_TOKEN` en Vercel, usa un **Fine-grained personal access token** con permisos sobre este repositorio:

* `Actions`: Read and write
* `Contents`: Read and write
* `Metadata`: Read-only

No reutilices el token automático interno de GitHub Actions en Vercel.

### Permisos del workflow en GitHub

Para que el workflow pueda hacer commit y push de `public/courses.json`:

1. Ve a **GitHub → Settings → Actions → General**.
2. En **Workflow permissions**, selecciona **Read and write permissions**.
3. Guarda los cambios.

Además, el workflow `export-catalog.yml` debe ejecutarse con permisos de escritura sobre el contenido del repositorio.

Si el paso `Commit y push del catálogo actualizado` falla con error `403`, revisa primero:

* que `Workflow permissions` esté en `Read and write`
* que la rama `main` no tenga reglas de protección que bloqueen pushes automáticos
* que el repositorio permita a GitHub Actions escribir en la rama principal

En este proyecto, si no hay reglas activas en **Settings → Branches**, entonces la rama `main` no está protegida.

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

### Qué revisar si algo sale mal

#### El admin guarda en Firestore pero el público no cambia
* Revisa si `POST /api/trigger-catalog-export` respondió `202`.
* Revisa si el workflow de GitHub realmente arrancó.
* Revisa si el workflow pudo hacer `push` a `main`.
* Revisa si Vercel redeployó después del commit.

#### El workflow falla con `403` al hacer push
* Revisa **Settings → Actions → General → Workflow permissions**.
* Debe estar en **Read and write permissions**.
* Revisa también que `main` no tenga branch protection bloqueando el push.

#### El `courses.json` sale con campos raros o desordenados
* Revisa `scripts/exportCatalogFromFirestore.js`.
* El script debe exportar un array plano.
* El script debe excluir campos internos como `id` y `updatedAt`.
* El script debe construir los campos en este orden:
  `programa`, `modalidad`, `ciclo`, `codigo`, `curso`, `docente`, `mod-curso`, `horas`, `creditos`, `tipoEstudio`.

#### El export local falla
* Verifica que `.env` tenga `FIREBASE_SERVICE_ACCOUNT_PATH` o `FIREBASE_SERVICE_ACCOUNT_JSON`.
* Verifica que el archivo del service account exista y no esté corrupto.

### Checklist de configuración completa

Antes de probar en producción, verifica todo esto:

#### Firebase
* Existe `users/{uid}` para el admin autenticado.
* Ese documento tiene `role: "admin"`.
* Las reglas de Firestore permiten escribir en `courses` y `app_metadata` a admins.

#### GitHub
* Existe el secret `FIREBASE_SERVICE_ACCOUNT_JSON` en **Settings → Secrets and variables → Actions**.
* En **Settings → Actions → General**, `Workflow permissions` está en **Read and write permissions**.
* No hay branch protection bloqueando push directo a `main`.

#### Vercel
* Están configuradas las variables `VITE_FIREBASE_*`.
* Está configurado `FIREBASE_SERVICE_ACCOUNT_JSON`.
* Está configurado `GITHUB_TOKEN`.
* Están configurados `GITHUB_REPO_OWNER` y `GITHUB_REPO_NAME`.
* Se hizo redeploy después de agregar o cambiar variables.

#### Flujo esperado
* El admin guarda en Firestore correctamente.
* `POST /api/trigger-catalog-export` responde `202`.
* GitHub Action exporta `courses.json`.
* GitHub hace commit automático si hubo cambios.
* Vercel redeploya la web pública.

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
