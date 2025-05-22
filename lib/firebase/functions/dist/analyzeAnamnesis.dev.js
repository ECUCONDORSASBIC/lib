"use strict";

var functions = require('firebase-functions');

var admin = require('firebase-admin'); // Inicializar la app si no está ya inicializada


if (!admin.apps.length) {
  admin.initializeApp();
}

exports.analyzeAnamnesisData = functions.firestore.document('patients/{patientId}/medical/anamnesis').onWrite(function _callee(change, context) {
  var patientId, anamnesisData, riskFactors, riskAssessmentRef, highRiskFactors;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          patientId = context.params.patientId;
          anamnesisData = change.after.data(); // No procesar si se eliminó el documento

          if (anamnesisData) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", null);

        case 4:
          console.log("Analizando datos de anamnesis para paciente: ".concat(patientId)); // Calcular riesgos basados en los datos de anamnesis

          _context.next = 7;
          return regeneratorRuntime.awrap(analyzeHealthRisks(anamnesisData));

        case 7:
          riskFactors = _context.sent;
          // Almacenar resultados del análisis
          riskAssessmentRef = admin.firestore().collection("patients/".concat(patientId, "/medical")).doc('riskAssessment');
          _context.next = 11;
          return regeneratorRuntime.awrap(riskAssessmentRef.set({
            factors: riskFactors,
            calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
            source: 'automated-analysis'
          }, {
            merge: true
          }));

        case 11:
          // Crear alertas si se detectan riesgos altos
          highRiskFactors = riskFactors.filter(function (factor) {
            return factor.level === 'high';
          });

          if (!(highRiskFactors.length > 0)) {
            _context.next = 15;
            break;
          }

          _context.next = 15;
          return regeneratorRuntime.awrap(createHighRiskAlert(patientId, highRiskFactors));

        case 15:
          return _context.abrupt("return", null);

        case 16:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Analiza los datos de anamnesis para identificar factores de riesgo

function analyzeHealthRisks(anamnesisData) {
  var riskFactors;
  return regeneratorRuntime.async(function analyzeHealthRisks$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          riskFactors = []; // Verificar antecedentes familiares de enfermedades cardiovasculares

          if (anamnesisData.antecedentesFamiliares && anamnesisData.antecedentesFamiliares.some(function (ant) {
            return ant.enfermedad.toLowerCase().includes('cardio') || ant.enfermedad.toLowerCase().includes('corazón');
          })) {
            riskFactors.push({
              type: 'cardiovascular',
              description: 'Antecedentes familiares de enfermedades cardiovasculares',
              level: 'moderate',
              recommendation: 'Se recomienda evaluación cardiológica periódica'
            });
          } // Verificar hábitos de riesgo (tabaquismo)


          if (anamnesisData.habitos && anamnesisData.habitos.tabaquismo && anamnesisData.habitos.tabaquismo.activo) {
            riskFactors.push({
              type: 'respiratory',
              description: 'Tabaquismo activo',
              level: 'high',
              recommendation: 'Se recomienda programa de cesación tabáquica'
            });
          } // Verificar problemas de salud mental


          if (anamnesisData.saludMental && anamnesisData.saludMental.nivelEstres === 'alto') {
            riskFactors.push({
              type: 'mental',
              description: 'Niveles altos de estrés reportados',
              level: 'moderate',
              recommendation: 'Considerar evaluación psicológica y técnicas de manejo de estrés'
            });
          }

          return _context2.abrupt("return", riskFactors);

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
} // Crea alertas para médicos cuando se detectan factores de alto riesgo


function createHighRiskAlert(patientId, highRiskFactors) {
  var patientSnapshot, patientData;
  return regeneratorRuntime.async(function createHighRiskAlert$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(admin.firestore().collection('patients').doc(patientId).get());

        case 3:
          patientSnapshot = _context3.sent;

          if (patientSnapshot.exists) {
            _context3.next = 7;
            break;
          }

          console.error("No se encontr\xF3 el paciente con ID: ".concat(patientId));
          return _context3.abrupt("return");

        case 7:
          patientData = patientSnapshot.data(); // Crear una alerta en la colección de alertas médicas

          _context3.next = 10;
          return regeneratorRuntime.awrap(admin.firestore().collection('physicianAlerts').add({
            patientId: patientId,
            patientName: "".concat(patientData.nombre || '', " ").concat(patientData.apellidos || ''),
            riskFactors: highRiskFactors,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'new',
            priority: 'high'
          }));

        case 10:
          console.log("Alerta creada para paciente ".concat(patientId, " con factores de riesgo altos"));
          _context3.next = 16;
          break;

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          console.error('Error al crear alerta de alto riesgo:', _context3.t0);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 13]]);
}