import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const METADATA_DOC_PATH = 'metadata/config';

let metadataCache = null;
let metadataCachePromise = null;

function logMetadataRead(data) {
  if (import.meta.env.DEV) {
    console.info(
      '%c📄 [Metadata] %cmetadata/config cargado (1 lectura Firestore)',
      'color: #8b5cf6; font-weight: bold;',
      'color: inherit;'
    );
    console.info(
      '%c  ├─ Programs: %c%d items',
      'color: #8b5cf6;',
      'color: #a78bfa; font-weight: bold;',
      data.programs.length
    );
    console.info(
      '%c  ├─ Modalities: %c%d items',
      'color: #8b5cf6;',
      'color: #a78bfa; font-weight: bold;',
      data.modalities.length
    );
    console.info(
      '%c  └─ Cycles: %c%d items',
      'color: #8b5cf6;',
      'color: #a78bfa; font-weight: bold;',
      data.cycles.length
    );
  }
}

function logMetadataCacheHit() {
  if (import.meta.env.DEV) {
    console.info(
      '%c📄 [Metadata] %cCache HIT - metadata/config (0 lecturas Firestore)',
      'color: #8b5cf6; font-weight: bold;',
      'color: #a78bfa;'
    );
  }
}

async function getMetadata() {
  if (metadataCache) {
    logMetadataCacheHit();
    return metadataCache;
  }
  if (metadataCachePromise) return metadataCachePromise;

  metadataCachePromise = (async () => {
    try {
      if (!isFirebaseConfigured || !db) {
        throw new Error('Firebase no configurado');
      }

      const docRef = doc(db, METADATA_DOC_PATH);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Documento metadata/config no encontrado');
      }

      const data = docSnap.data();
      logMetadataRead(data);

      metadataCache = {
        programs: data.programs || [],
        modalities: data.modalities || [],
        cycles: data.cycles || [],
      };

      return metadataCache;
    } catch (error) {
      console.error('Error al cargar metadata/config:', error.message);
      return null;
    } finally {
      metadataCachePromise = null;
    }
  })();

  return metadataCachePromise;
}

export async function getProgramsFromMetadata() {
  const metadata = await getMetadata();
  if (!metadata) return [];
  return [...metadata.programs].sort();
}

// eslint-disable-next-line no-unused-vars
export async function getModalitiesFromMetadata(programName) {
  const metadata = await getMetadata();
  if (!metadata) return [];

  return [...metadata.modalities].sort();
}

// eslint-disable-next-line no-unused-vars
export async function getCyclesFromMetadata(programName, modalityName) {
  const metadata = await getMetadata();
  if (!metadata) return [];

  const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return [...metadata.cycles].sort((a, b) => romanOrder.indexOf(a) - romanOrder.indexOf(b));
}

export function clearMetadataCache() {
  metadataCache = null;
  metadataCachePromise = null;
}
