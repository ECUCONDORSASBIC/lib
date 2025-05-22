"use strict";

var functions = require('firebase-functions');

var admin = require('firebase-admin'); // Inicializar la aplicación de Firebase Admin


admin.initializeApp(); // Importar los módulos

var analyzeAnamnesis = require('./analyzeAnamnesis'); // Exportar todas las funciones


exports.analyzeAnamnesisData = analyzeAnamnesis.analyzeAnamnesisData;