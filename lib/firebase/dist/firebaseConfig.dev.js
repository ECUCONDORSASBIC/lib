"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storage = exports.db = exports.auth = void 0;

var _app = require("firebase/app");

var _auth = require("firebase/auth");

var _firestore = require("firebase/firestore");

var _storage = require("firebase/storage");

// Import the Firebase SDK components we need
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}; // Initialize Firebase - making sure we don't initialize more than once

var app = !(0, _app.getApps)().length ? (0, _app.initializeApp)(firebaseConfig) : (0, _app.getApps)()[0]; // Get Firebase services

var db = (0, _firestore.getFirestore)(app);
exports.db = db;
var auth = (0, _auth.getAuth)(app);
exports.auth = auth;
var storage = (0, _storage.getStorage)(app);
exports.storage = storage;