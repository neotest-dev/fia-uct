/**
 * Serverless endpoint to trigger the GitHub Action that exports Firestore
 * courses to public/courses.json. Protected with Firebase ID token + admin role.
 */

let adminAppPromise = null;

async function getAdminContext() {
  if (!adminAppPromise) {
    adminAppPromise = (async () => {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está configurado en el servidor');
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no contiene un JSON válido');
      }

      const { getApps, initializeApp, cert } = await import('firebase-admin/app');
      const { getAuth } = await import('firebase-admin/auth');
      const { getFirestore } = await import('firebase-admin/firestore');

      const app = getApps().length
        ? getApps()[0]
        : initializeApp({ credential: cert(serviceAccount) });

      return {
        auth: getAuth(app),
        db: getFirestore(app),
      };
    })();
  }

  return adminAppPromise;
}

function getBearerToken(request) {
  const header = request.headers.authorization || request.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function getRepositoryContext() {
  const owner = process.env.GITHUB_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME || process.env.VERCEL_GIT_REPO_SLUG;
  const token = process.env.GITHUB_TOKEN;

  if (!owner || !repo || !token) {
    throw new Error('Faltan GITHUB_TOKEN, GITHUB_REPO_OWNER o GITHUB_REPO_NAME en el servidor');
  }

  return { owner, repo, token };
}

async function verifyAdminRequest(request) {
  const idToken = getBearerToken(request);
  if (!idToken) {
    return { ok: false, status: 401, message: 'Falta el token de autenticación' };
  }

  const { auth, db } = await getAdminContext();

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch {
    return { ok: false, status: 401, message: 'Token de autenticación inválido o expirado' };
  }

  const userDoc = await db.collection('users').doc(decodedToken.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    return { ok: false, status: 403, message: 'Se requiere rol admin para publicar el catálogo' };
  }

  return { ok: true, uid: decodedToken.uid };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const authResult = await verifyAdminRequest(request);
    if (!authResult.ok) {
      return response.status(authResult.status).json({ error: authResult.message });
    }

    const { owner, repo, token } = getRepositoryContext();
    const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'fia-uct-catalog-trigger',
      },
      body: JSON.stringify({
        event_type: 'catalog-updated',
        client_payload: {
          triggeredBy: authResult.uid,
          source: 'admin-panel',
          triggeredAt: new Date().toISOString(),
        },
      }),
    });

    if (!githubResponse.ok) {
      const details = await githubResponse.text();
      return response.status(502).json({
        error: 'GitHub rechazó el disparo del workflow',
        details,
      });
    }

    return response.status(202).json({ ok: true, message: 'Exportación del catálogo encolada' });
  } catch (error) {
    console.error('Error al disparar la exportación del catálogo:', error);
    return response.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
