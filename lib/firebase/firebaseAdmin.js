import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

const getFirebaseAdminApp = () => {
  // Nombre de la aplicación por defecto es '[DEFAULT]'
  const DEFAULT_APP_NAME = '[DEFAULT]';

  // Intenta obtener la aplicación por defecto si ya está inicializada
  const existingApp = admin.apps.find(app => app && app.name === DEFAULT_APP_NAME);
  if (existingApp) {
    // console.log('[Firebase Admin] Returning existing default app.');
    return existingApp;
  }

  // Si no existe, inicialízala
  try {
    // console.log('[Firebase Admin] Initializing default app...');
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com' // Si usas RTDB
    }); // No se especifica nombre para inicializar la app por defecto
  } catch (error) {
    if (error.code === 'app/duplicate-app') {
      // Esto puede suceder en algunos escenarios de hot-reloading o múltiples importaciones.
      // console.warn('[Firebase Admin] Attempted to initialize a duplicate default app. Returning existing one.');
      return admin.app(DEFAULT_APP_NAME); // Devuelve la app existente por su nombre por defecto
    }
    console.error("[Firebase Admin] FAILED TO INITIALIZE default app:", error);
    throw new Error(`Firebase Admin SDK (default app) initialization failed: ${error.message}`);
  }
};

const app = getFirebaseAdminApp();
// console.log(`[Firebase Admin] App instance obtained. Name: ${app.name}`);

// Exporta los servicios usando la instancia de la aplicación obtenida
export const db = app.firestore();
export const authAdmin = app.auth();
export const storageAdmin = app.storage();
export const adminAppInstance = app;

// Log para verificar que los servicios están disponibles después de la exportación
// console.log(`[Firebase Admin] db service available: ${!!db}`);
// console.log(`[Firebase Admin] authAdmin service available: ${!!authAdmin}`);

