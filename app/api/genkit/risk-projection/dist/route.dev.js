"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
exports.GET = GET;
exports.runtime = void 0;

var _server = require("next/server");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

var AsyncLocalStorageClass = require('../../../../lib/polyfills/async-local-storage-polyfill'); // Create an instance of AsyncLocalStorage


var asyncLocalStorage = new AsyncLocalStorageClass();
/**
 * Safely initializes the Vertex AI client
 * @returns {Promise<{vertexAI: any, generativeModel: any, error: string|null}>}
 */

function initializeVertexAI() {
  var _ref, HarmBlockThreshold, HarmCategory, VertexAI, PROJECT_ID, LOCATION, vertexAI, generativeModel;

  return regeneratorRuntime.async(function initializeVertexAI$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          if (!(typeof window !== 'undefined')) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", {
            vertexAI: null,
            generativeModel: null,
            error: 'Cannot run Vertex AI in the browser'
          });

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(Promise.resolve().then(function () {
            return _interopRequireWildcard(require('@google-cloud/vertexai'));
          }));

        case 5:
          _ref = _context.sent;
          HarmBlockThreshold = _ref.HarmBlockThreshold;
          HarmCategory = _ref.HarmCategory;
          VertexAI = _ref.VertexAI;
          PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
          LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

          if (PROJECT_ID) {
            _context.next = 14;
            break;
          }

          console.warn('GOOGLE_CLOUD_PROJECT environment variable is not set. Vertex AI features will be disabled.');
          return _context.abrupt("return", {
            vertexAI: null,
            generativeModel: null,
            error: 'GOOGLE_CLOUD_PROJECT environment variable is not set'
          });

        case 14:
          // Initialize VertexAI Client
          vertexAI = new VertexAI({
            project: PROJECT_ID,
            location: LOCATION
          }); // Instantiate the model

          generativeModel = vertexAI.getGenerativeModel({
            model: 'gemini-1.0-pro-001',
            // Or your preferred model
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
          return _context.abrupt("return", {
            vertexAI: vertexAI,
            generativeModel: generativeModel,
            error: null
          });

        case 19:
          _context.prev = 19;
          _context.t0 = _context["catch"](0);
          console.error('Error initializing Vertex AI for risk projection:', _context.t0.message);
          return _context.abrupt("return", {
            vertexAI: null,
            generativeModel: null,
            error: _context.t0.message
          });

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 19]]);
}
/**
 * Handles POST requests to calculate future risk projection via GenKit.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */


function POST(request) {
  return regeneratorRuntime.async(function POST$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", asyncLocalStorage.run({}, function _callee() {
            var _ref2, generativeModel, error, authHeader, body, patientData, currentRiskAnalysis, prompt, req, streamingResp, aggregatedResponse, analysisText, cleanedJsonText, futureRiskAnalysis;

            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.prev = 0;
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(initializeVertexAI());

                  case 3:
                    _ref2 = _context2.sent;
                    generativeModel = _ref2.generativeModel;
                    error = _ref2.error;

                    if (generativeModel) {
                      _context2.next = 8;
                      break;
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Servicio de IA no disponible. Por favor, verifica la configuración de Google Cloud.',
                      error: error
                    }, {
                      status: 503
                    }));

                  case 8:
                    // --- Security: Verify JWT (example) ---
                    authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

                    if (!(!authHeader || !authHeader.startsWith('Bearer '))) {
                      _context2.next = 11;
                      break;
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'No autorizado: falta el token Bearer.'
                    }, {
                      status: 401
                    }));

                  case 11:
                    _context2.next = 13;
                    return regeneratorRuntime.awrap(request.json());

                  case 13:
                    body = _context2.sent;
                    patientData = body.patientData, currentRiskAnalysis = body.currentRiskAnalysis;

                    if (!(!patientData || _typeof(patientData) !== 'object' || !patientData.id)) {
                      _context2.next = 17;
                      break;
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Datos de paciente inválidos o faltantes.'
                    }, {
                      status: 400
                    }));

                  case 17:
                    if (!(!currentRiskAnalysis || _typeof(currentRiskAnalysis) !== 'object')) {
                      _context2.next = 19;
                      break;
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'currentRiskAnalysis inválido o faltante.'
                    }, {
                      status: 400
                    }));

                  case 19:
                    // Construct the prompt for Vertex AI
                    prompt = "\n        You are a medical AI assistant. Your task is to analyze the following patient data and current health risk assessment, and project future health risks for the next 5 years.\n\n        STRICT INSTRUCTIONS:\n        - Your response MUST be a single, strictly valid JSON object. Do NOT include any markdown, comments, explanations, or extra text.\n        - Do NOT wrap the JSON in code blocks or add any non-JSON content.\n        - All fields must match the schema exactly. If a value is unknown, use null or an empty array as appropriate.\n        - Dates must be in ISO 8601 format.\n        - Only output the JSON object, nothing else.\n\n        Patient Data:\n        ".concat(JSON.stringify(patientData, null, 2), "\n\n        Current Health Risk Analysis:\n        ").concat(JSON.stringify(currentRiskAnalysis, null, 2), "\n\n        Based on this information, provide a future risk projection including:\n        1.  Key potential future health risks (e.g., specific conditions like 'Type 2 Diabetes', 'Hypertension').\n        2.  A general future risk score or category (e.g., low, moderate, high).\n        3.  Confidence level of this projection.\n        4.  A concise summary of the projection.\n        5.  Actionable, prioritized recommendations to mitigate these future risks.\n\n        The JSON object must have this structure:\n        {\n          \"patientId\": \"string\",\n          \"projectionYears\": \"number (e.g., 5)\",\n          \"keyFutureRisks\": [\"string\"],\n          \"futureRiskScore\": \"number (0-100) or category string\",\n          \"confidenceLevel\": \"number (0-1)\",\n          \"summary\": \"string\",\n          \"detailedRecommendations\": [\n            { \"id\": \"string\", \"text\": \"string\", \"priority\": \"high|medium|low\" }\n          ],\n          \"generatedAt\": \"ISO_date_string\"\n        }\n      ");
                    req = {
                      contents: [{
                        role: 'user',
                        parts: [{
                          text: prompt
                        }]
                      }]
                    };
                    _context2.prev = 21;
                    _context2.next = 24;
                    return regeneratorRuntime.awrap(generativeModel.generateContentStream(req));

                  case 24:
                    streamingResp = _context2.sent;
                    _context2.next = 27;
                    return regeneratorRuntime.awrap(streamingResp.response);

                  case 27:
                    aggregatedResponse = _context2.sent;
                    analysisText = '';

                    if (!(aggregatedResponse.candidates && aggregatedResponse.candidates.length > 0 && aggregatedResponse.candidates[0].content && aggregatedResponse.candidates[0].content.parts && aggregatedResponse.candidates[0].content.parts.length > 0)) {
                      _context2.next = 33;
                      break;
                    }

                    analysisText = aggregatedResponse.candidates[0].content.parts[0].text;
                    _context2.next = 34;
                    break;

                  case 33:
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'No se recibió contenido válido de Vertex AI.',
                      error: 'Empty response from Vertex AI'
                    }, {
                      status: 502
                    }));

                  case 34:
                    cleanedJsonText = analysisText.replace(/^```json\s*|```$/g, '').trim();
                    _context2.prev = 35;
                    futureRiskAnalysis = JSON.parse(cleanedJsonText);
                    _context2.next = 43;
                    break;

                  case 39:
                    _context2.prev = 39;
                    _context2.t0 = _context2["catch"](35);
                    console.error('Vertex AI JSON parse error (risk-projection):', _context2.t0, '\nRaw response:', cleanedJsonText);
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error al parsear la respuesta de Vertex AI.',
                      error: _context2.t0.message,
                      raw: cleanedJsonText
                    }, {
                      status: 502
                    }));

                  case 43:
                    if (!futureRiskAnalysis.patientId && patientData.id) {
                      futureRiskAnalysis.patientId = patientData.id;
                    }

                    if (!futureRiskAnalysis.generatedAt) {
                      futureRiskAnalysis.generatedAt = new Date().toISOString();
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: true,
                      message: 'Future risk projection successful.',
                      data: futureRiskAnalysis
                    }));

                  case 48:
                    _context2.prev = 48;
                    _context2.t1 = _context2["catch"](21);
                    console.error('Error communicating with Vertex AI (risk-projection):', _context2.t1);
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error comunicándose con Vertex AI.',
                      error: _context2.t1.message
                    }, {
                      status: 502
                    }));

                  case 52:
                    _context2.next = 58;
                    break;

                  case 54:
                    _context2.prev = 54;
                    _context2.t2 = _context2["catch"](0);
                    console.error('Error processing risk projection request:', _context2.t2);
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error procesando la solicitud de proyección de riesgo futuro.',
                      error: _context2.t2.message
                    }, {
                      status: 500
                    }));

                  case 58:
                  case "end":
                    return _context2.stop();
                }
              }
            }, null, null, [[0, 54], [21, 48], [35, 39]]);
          }));

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function GET(request) {
  return regeneratorRuntime.async(function GET$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          return _context5.abrupt("return", asyncLocalStorage.run({}, function _callee2() {
            return regeneratorRuntime.async(function _callee2$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    return _context4.abrupt("return", _server.NextResponse.json({
                      status: 'GenKit Risk Projection API is running'
                    }));

                  case 1:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          }));

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
}

var runtime = 'nodejs'; // Changed from 'edge' to 'nodejs'

exports.runtime = runtime;