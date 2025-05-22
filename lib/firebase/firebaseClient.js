/**
 * Firebase Client SDK Configuration
 *
 * This is the centralized Firebase configuration for the client-side application.
 * It includes safety features for SSR compatibility and error handling.
 */

'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let auth;
let db;
let storage;

// Initialize Firebase only on the client side and ensure it runs only once.
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('[Firebase Client] Initialized successfully.');
    } catch (error) {
      console.error('[Firebase Client] Initialization error:', error);
      // Optionally, throw the error or handle it by setting services to null
      // For now, we'll let it proceed, and subsequent getAuth/getFirestore calls might fail
      // if 'app' is not initialized.
    }
  } else {
    app = getApp(); // Get the default app if already initialized
  }

  // Initialize services if 'app' is available
  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (serviceError) {
      console.error('[Firebase Client] Error initializing services (auth, db, storage):', serviceError);
      // Set services to null or handle as appropriate
      auth = null;
      db = null;
      storage = null;
    }
  }
} else {
  // Handle server-side case or non-browser environment if necessary,
  // though 'use client' should prevent this module from running on the server.
  // For robustness, set to null if not in a browser.
  app = null;
  auth = null;
  db = null;
  storage = null;
  console.warn('[Firebase Client] Attempted to initialize outside of a browser environment. Services will be null.');
}

/**
 * Gets the current status of Firebase initialization and services
 * @returns {Object} Object containing information about Firebase status
 */
export function getFirebaseStatus() {
  return {
    isInitialized: !!app,
    environment: typeof window !== 'undefined' ? 'client' : 'server',
    services: {
      auth: !!auth,
      firestore: !!db,
      storage: !!storage
    },
    config: {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      messagingSenderId: !!firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId
    }
  };
}

/**
 * Ensures Firebase is initialized by attempting to reinitialize it if needed
 * @returns {boolean} True if Firebase is now initialized, false otherwise
 */
export async function ensureFirebase() {
  // If we're on the server, we can't initialize Firebase
  if (typeof window === 'undefined') {
    console.warn('[Firebase Client] Cannot ensure Firebase on server side');
    return false;
  }

  try {
    // If Firebase app is already initialized, we're good
    if (app && auth && db && storage) {
      return true;
    }

    // Try to initialize Firebase if not already initialized
    if (!app) {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
    }

    // Initialize services
    if (app) {
      if (!auth) auth = getAuth(app);
      if (!db) db = getFirestore(app);
      if (!storage) storage = getStorage(app);
      
      console.log('[Firebase Client] Successfully reinitialized Firebase');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Firebase Client] Error ensuring Firebase:', error);
    return false;
  }
}

// Export the initialized services
export { app, auth, db, storage };

