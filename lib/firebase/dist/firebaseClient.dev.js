"use strict";

/**
 * Firebase Client SDK Configuration
 *
 * This is the centralized Firebase configuration for the client-side application.
 * It includes safety features for SSR compatibility and error handling.
 */
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storage = exports.db = exports.auth = exports.app = void 0;

var _app = require("firebase/app");

var _auth = require("firebase/auth");

var _firestore = require("firebase/firestore");

var _storage = require("firebase/storage");

// Firebase configuration from environment variables
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
var app;
exports.app = app;
var auth;
exports.auth = auth;
var db;
exports.db = db;
var storage; // Initialize Firebase only on the client side and ensure it runs only once.

exports.storage = storage;

if (typeof window !== 'undefined') {
  if (!(0, _app.getApps)().length) {
    try {
      exports.app = app = (0, _app.initializeApp)(firebaseConfig);
      console.log('[Firebase Client] Initialized successfully.');
    } catch (error) {
      console.error('[Firebase Client] Initialization error:', error); // Optionally, throw the error or handle it by setting services to null
      // For now, we'll let it proceed, and subsequent getAuth/getFirestore calls might fail
      // if 'app' is not initialized.
    }
  } else {
    exports.app = app = (0, _app.getApp)(); // Get the default app if already initialized
  } // Initialize services if 'app' is available


  if (app) {
    try {
      exports.auth = auth = (0, _auth.getAuth)(app);
      exports.db = db = (0, _firestore.getFirestore)(app);
      exports.storage = storage = (0, _storage.getStorage)(app);
    } catch (serviceError) {
      console.error('[Firebase Client] Error initializing services (auth, db, storage):', serviceError); // Set services to null or handle as appropriate

      exports.auth = auth = null;
      exports.db = db = null;
      exports.storage = storage = null;
    }
  }
} else {
  // Handle server-side case or non-browser environment if necessary,
  // though 'use client' should prevent this module from running on the server.
  // For robustness, set to null if not in a browser.
  exports.app = app = null;
  exports.auth = auth = null;
  exports.db = db = null;
  exports.storage = storage = null;
  console.warn('[Firebase Client] Attempted to initialize outside of a browser environment. Services will be null.');
} // Export the initialized services