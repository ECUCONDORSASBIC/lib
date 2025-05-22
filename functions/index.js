const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar la aplicación de Firebase Admin
admin.initializeApp();

// Importar los módulos
const analyzeAnamnesis = require('./analyzeAnamnesis');

// Exportar todas las funciones
exports.analyzeAnamnesisData = analyzeAnamnesis.analyzeAnamnesisData;
