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
 * @returns {Promise<{generativeModel: any, error: string|null}>}
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
              maxOutputTokens: 1024,
              temperature: 0.2,
              topP: 0.8,
              topK: 40
            }
          });
          return _context.abrupt("return", {
            generativeModel: generativeModel,
            error: null
          });

        case 19:
          _context.prev = 19;
          _context.t0 = _context["catch"](0);
          console.error('Error initializing Vertex AI for anamnesis question generation:', _context.t0.message);
          return _context.abrupt("return", {
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
 * Handles POST requests to generate anamnesis questions via GenKit
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} A promise that resolves to the response
 */


function POST(request) {
  return regeneratorRuntime.async(function POST$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", asyncLocalStorage.run({}, function _callee() {
            var _ref2, generativeModel, error, authHeader, body, patientInfo, medicalHistory, currentContext, prompt, req, response, result, responseText, cleanedJson, questionData;

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
                    // --- Security check ---
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
                    patientInfo = body.patientInfo, medicalHistory = body.medicalHistory, currentContext = body.currentContext;

                    if (!(!patientInfo || _typeof(patientInfo) !== 'object')) {
                      _context2.next = 17;
                      break;
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Información del paciente inválida o faltante.'
                    }, {
                      status: 400
                    }));

                  case 17:
                    // Prepare the prompt for Vertex AI
                    prompt = "\n        You are a medical professional conducting an anamnesis (medical interview).\n        Based on the following patient information and context, generate the next relevant\n        question to ask the patient. The question should be specific, focused on gathering\n        important medical information, and help clarify the patient's condition.\n\n        Patient Information:\n        ".concat(JSON.stringify(patientInfo, null, 2), "\n\n        ").concat(medicalHistory ? "Medical History:\n        ".concat(JSON.stringify(medicalHistory, null, 2)) : '', "\n\n        ").concat(currentContext ? "Current Context:\n        ".concat(JSON.stringify(currentContext, null, 2)) : '', "\n\n        Generate a single, concise, relevant question to continue the anamnesis.\n        Format it as a valid JSON object with the following structure:\n        {\n          \"question\": \"Your clear, concise question here\",\n          \"relevance\": \"Brief explanation of why this question is important\",\n          \"possibleFollowUps\": [\"Potential follow-up question 1\", \"Potential follow-up question 2\"]\n        }\n\n        Only output the JSON, no additional text.\n      ");
                    req = {
                      contents: [{
                        role: 'user',
                        parts: [{
                          text: prompt
                        }]
                      }]
                    };
                    _context2.prev = 19;
                    _context2.next = 22;
                    return regeneratorRuntime.awrap(generativeModel.generateContent(req));

                  case 22:
                    response = _context2.sent;
                    _context2.next = 25;
                    return regeneratorRuntime.awrap(response.response);

                  case 25:
                    result = _context2.sent;

                    if (!(!result.candidates || result.candidates.length === 0 || !result.candidates[0].content || !result.candidates[0].content.parts || result.candidates[0].content.parts.length === 0)) {
                      _context2.next = 28;
                      break;
                    }

                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'No se generó ninguna pregunta válida.'
                    }, {
                      status: 502
                    }));

                  case 28:
                    responseText = result.candidates[0].content.parts[0].text; // Clean JSON if wrapped in markdown code blocks

                    cleanedJson = responseText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
                    _context2.prev = 30;
                    questionData = JSON.parse(cleanedJson);
                    _context2.next = 38;
                    break;

                  case 34:
                    _context2.prev = 34;
                    _context2.t0 = _context2["catch"](30);
                    console.error('JSON parse error:', _context2.t0, '\nRaw response:', cleanedJson);
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error al parsear la respuesta de IA.',
                      error: _context2.t0.message
                    }, {
                      status: 502
                    }));

                  case 38:
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: true,
                      message: 'Pregunta generada correctamente.',
                      data: questionData
                    }));

                  case 41:
                    _context2.prev = 41;
                    _context2.t1 = _context2["catch"](19);
                    console.error('Error generating anamnesis question:', _context2.t1);
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error generando pregunta de anamnesis.',
                      error: _context2.t1.message
                    }, {
                      status: 502
                    }));

                  case 45:
                    _context2.next = 51;
                    break;

                  case 47:
                    _context2.prev = 47;
                    _context2.t2 = _context2["catch"](0);
                    console.error('Error processing anamnesis question request:', _context2.t2);
                    return _context2.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error procesando la solicitud de generación de pregunta de anamnesis.',
                      error: _context2.t2.message
                    }, {
                      status: 500
                    }));

                  case 51:
                  case "end":
                    return _context2.stop();
                }
              }
            }, null, null, [[0, 47], [19, 41], [30, 34]]);
          }));

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function GET() {
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
                      status: 'Anamnesis Question Generation API is running',
                      timestamp: new Date().toISOString()
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

var runtime = 'nodejs';
exports.runtime = runtime;