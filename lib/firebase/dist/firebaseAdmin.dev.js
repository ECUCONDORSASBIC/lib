"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adminStorage = exports.adminDb = exports.adminAuth = exports.adminApp = void 0;

var admin = _interopRequireWildcard(require("firebase-admin"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Path to your service account key file
// IMPORTANT: In production, consider using environment variables for service account credentials
// instead of committing the JSON file to your repository.
// const serviceAccount = require('../../altamedic-20f69-firebase-adminsdk-fbsvc-afc9055951.json');
var adminApp;
exports.adminApp = adminApp;

if (!admin.apps.length) {
  try {
    // Attempt to initialize with environment variable (recommended for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('[FirebaseAdmin] Attempting to initialize Admin SDK with environment variable...');
      var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      exports.adminApp = adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount) // Add your databaseURL if you use Realtime Database
        // databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com'

      });
      console.log('[FirebaseAdmin] Firebase Admin SDK initialized successfully using environment variable.');
    } else {
      console.log('[FirebaseAdmin] Environment variable FIREBASE_SERVICE_ACCOUNT_KEY not found. Attempting to initialize Admin SDK with JSON file...'); // Fallback to requiring the JSON file (ensure it's correctly pathed and secured)
      // This path assumes the JSON file is in the project root. Adjust if necessary.

      var _serviceAccount = require('../../../altamedic-20f69-firebase-adminsdk-fbsvc-afc9055951.json');

      exports.adminApp = adminApp = admin.initializeApp({
        credential: admin.credential.cert(_serviceAccount)
      });
      console.log('[FirebaseAdmin] Firebase Admin SDK initialized successfully using JSON file.');
    }
  } catch (error) {
    console.error('[FirebaseAdmin] Firebase Admin SDK initialization error:', error.message, error.stack); // If using a fallback or optional initialization, you might not want to throw.
    // For critical initialization, re-throwing or exiting might be appropriate.
    // throw error;
  }
} else {
  exports.adminApp = adminApp = admin.app();
  console.log('[FirebaseAdmin] Firebase Admin SDK already initialized.');
}

var adminAuth = adminApp ? admin.auth() : null;
exports.adminAuth = adminAuth;
var adminDb = adminApp ? admin.firestore() : null;
exports.adminDb = adminDb;
var adminStorage = adminApp ? admin.storage().bucket() : null; // Default bucket

exports.adminStorage = adminStorage;

if (!adminApp) {
  console.warn('[FirebaseAdmin] Firebase Admin App is not initialized. adminAuth, adminDb, and adminStorage will be null.');
}