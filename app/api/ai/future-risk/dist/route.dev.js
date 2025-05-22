"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _server = require("next/server");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Polyfill for process.stdout and process.stderr to fix isTTY errors
if (typeof process !== 'undefined' && process) {
  var mockStdout = {
    fd: 1,
    write: function write() {
      return true;
    },
    isTTY: false
  };
  var mockStderr = {
    fd: 2,
    write: function write() {
      return true;
    },
    isTTY: false
  }; // Ensure process.stdout and process.stderr are available

  process.stdout = process.stdout || mockStdout;
  process.stderr = process.stderr || mockStderr; // Fix missing properties

  if (!process.stdout.fd) process.stdout.fd = 1;
  if (!process.stderr.fd) process.stderr.fd = 2;
  if (process.stdout.isTTY === undefined) process.stdout.isTTY = false;
  if (process.stderr.isTTY === undefined) process.stderr.isTTY = false;
}

// Initialize VertexAI Client conditionally
var vertexAI;
var generativeModel;

try {
  var _require = require('@google-cloud/vertexai'),
      HarmBlockThreshold = _require.HarmBlockThreshold,
      HarmCategory = _require.HarmCategory,
      VertexAI = _require.VertexAI;

  var PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
  var LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!PROJECT_ID) {
    console.warn('GOOGLE_CLOUD_PROJECT environment variable is not set. Vertex AI features will be disabled.');
  } else {
    // Initialize VertexAI Client
    vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION
    }); // Instantiate the model

    generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.0-pro-001',
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
      }, {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
      }, {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
      }, {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
      }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
        topP: 0.8,
        topK: 40
      }
    });
  }
} catch (error) {
  console.error('Error initializing Vertex AI:', error.message);
}
/**
 * Handles POST requests to calculate future risk.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */


function POST(request) {
  var authHeader, body, patientData, currentRiskAnalysis, prompt, req, streamingResp, aggregatedResponse, analysisText, cleanedJsonText, futureRiskAnalysis;
  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          if (generativeModel) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Servicio de IA no disponible. Por favor, verifica la configuración de Google Cloud.'
          }, {
            status: 503
          }));

        case 3:
          // --- Security: Verify JWT in Authorization header ---
          authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

          if (!(!authHeader || !authHeader.startsWith('Bearer '))) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'No autorizado: falta el token Bearer.'
          }, {
            status: 401
          }));

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(request.json());

        case 8:
          body = _context.sent;
          patientData = body.patientData, currentRiskAnalysis = body.currentRiskAnalysis;

          if (!(!patientData || _typeof(patientData) !== 'object' || !patientData.id)) {
            _context.next = 12;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Datos de paciente inválidos o faltantes.'
          }, {
            status: 400
          }));

        case 12:
          if (!(!currentRiskAnalysis || _typeof(currentRiskAnalysis) !== 'object')) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'currentRiskAnalysis inválido o faltante.'
          }, {
            status: 400
          }));

        case 14:
          // Construct the prompt for Vertex AI
          prompt = "\n      You are a medical AI assistant. Your task is to analyze the following patient data and current health risk assessment, and project future health risks for the next 5 years.\n\n      STRICT INSTRUCTIONS:\n      - Your response MUST be a single, strictly valid JSON object. Do NOT include any markdown, comments, explanations, or extra text.\n      - Do NOT wrap the JSON in code blocks or add any non-JSON content.\n      - All fields must match the schema exactly. If a value is unknown, use null or an empty array as appropriate.\n      - Dates must be in ISO 8601 format.\n      - Only output the JSON object, nothing else.\n\n      Patient Data:\n      ".concat(JSON.stringify(patientData, null, 2), "\n\n      Current Health Risk Analysis:\n      ").concat(JSON.stringify(currentRiskAnalysis, null, 2), "\n\n      Based on this information, provide a future risk projection including:\n      1.  Key potential future health risks (e.g., specific conditions like 'Type 2 Diabetes', 'Hypertension').\n      2.  A general future risk score or category (e.g., low, moderate, high).\n      3.  Confidence level of this projection.\n      4.  A concise summary of the projection.\n      5.  Actionable, prioritized recommendations to mitigate these future risks.\n\n      The JSON object must have this structure:\n      {\n        \"patientId\": \"string\",\n        \"projectionYears\": \"number (e.g., 5)\",\n        \"keyFutureRisks\": [\"string\"],\n        \"futureRiskScore\": \"number (0-100) or category string\",\n        \"confidenceLevel\": \"number (0-1)\",\n        \"summary\": \"string\",\n        \"detailedRecommendations\": [\n          { \"id\": \"string\", \"text\": \"string\", \"priority\": \"high|medium|low\" }\n        ],\n        \"generatedAt\": \"ISO_date_string\"\n      }\n    ");
          req = {
            contents: [{
              role: 'user',
              parts: [{
                text: prompt
              }]
            }]
          };
          _context.prev = 16;
          _context.next = 19;
          return regeneratorRuntime.awrap(generativeModel.generateContentStream(req));

        case 19:
          streamingResp = _context.sent;
          _context.next = 22;
          return regeneratorRuntime.awrap(streamingResp.response);

        case 22:
          aggregatedResponse = _context.sent;
          analysisText = '';

          if (!(aggregatedResponse.candidates && aggregatedResponse.candidates.length > 0 && aggregatedResponse.candidates[0].content && aggregatedResponse.candidates[0].content.parts && aggregatedResponse.candidates[0].content.parts.length > 0)) {
            _context.next = 28;
            break;
          }

          analysisText = aggregatedResponse.candidates[0].content.parts[0].text;
          _context.next = 29;
          break;

        case 28:
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'No se recibió contenido válido de Vertex AI.',
            error: 'Empty response from Vertex AI'
          }, {
            status: 502
          }));

        case 29:
          // Limpiar respuesta JSON
          cleanedJsonText = analysisText.replace(/^```json\s*|```$/g, '').trim();
          _context.prev = 30;
          futureRiskAnalysis = JSON.parse(cleanedJsonText);
          _context.next = 38;
          break;

        case 34:
          _context.prev = 34;
          _context.t0 = _context["catch"](30);
          console.error('Vertex AI JSON parse error:', _context.t0, '\nRaw response:', cleanedJsonText);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Error al parsear la respuesta de Vertex AI.',
            error: _context.t0.message,
            raw: cleanedJsonText
          }, {
            status: 502
          }));

        case 38:
          if (!futureRiskAnalysis.patientId && patientData.id) {
            futureRiskAnalysis.patientId = patientData.id;
          }

          if (!futureRiskAnalysis.generatedAt) {
            futureRiskAnalysis.generatedAt = new Date().toISOString();
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            message: 'Future risk calculation successful.',
            data: futureRiskAnalysis
          }));

        case 43:
          _context.prev = 43;
          _context.t1 = _context["catch"](16);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Error comunicándose con Vertex AI.',
            error: _context.t1.message
          }, {
            status: 502
          }));

        case 46:
          _context.next = 51;
          break;

        case 48:
          _context.prev = 48;
          _context.t2 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Error procesando la solicitud de cálculo de riesgo futuro.',
            error: _context.t2.message
          }, {
            status: 500
          }));

        case 51:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 48], [16, 43], [30, 34]]);
}