"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
exports.GET = GET;
exports.runtime = void 0;

var _server = require("next/server");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
 * Safely initializes the Vertex AI client if needed for notification processing
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
              maxOutputTokens: 512,
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
          console.error('Error initializing Vertex AI for notifications:', _context.t0.message);
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
 * Process and enhance notification content if needed
 * @param {Object} notificationData - The notification data to process
 * @param {Object} generativeModel - The AI model for text enhancements
 * @returns {Promise<Object>} - The processed notification data
 */


function processNotificationContent(notificationData, generativeModel) {
  var prompt, req, response, result, enhancedContent;
  return regeneratorRuntime.async(function processNotificationContent$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(!generativeModel || !notificationData.content || notificationData.skipAIProcessing)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", notificationData);

        case 2:
          _context2.prev = 2;
          // Example: Use AI to improve notification wording or add relevant details
          prompt = "\n      Enhance the following medical notification message to be clear, professional, and empathetic.\n      Keep it concise but ensure all important information is included.\n      Only return the enhanced text, without any explanations or other text.\n\n      Original message: \"".concat(notificationData.content, "\"\n    ");
          req = {
            contents: [{
              role: 'user',
              parts: [{
                text: prompt
              }]
            }]
          };
          _context2.next = 7;
          return regeneratorRuntime.awrap(generativeModel.generateContent(req));

        case 7:
          response = _context2.sent;
          _context2.next = 10;
          return regeneratorRuntime.awrap(response.response);

        case 10:
          result = _context2.sent;

          if (!(result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0)) {
            _context2.next = 14;
            break;
          }

          enhancedContent = result.candidates[0].content.parts[0].text.trim(); // Return enhanced notification

          return _context2.abrupt("return", _objectSpread({}, notificationData, {
            content: enhancedContent,
            aiEnhanced: true
          }));

        case 14:
          return _context2.abrupt("return", notificationData);

        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](2);
          console.error('Error enhancing notification content:', _context2.t0);
          return _context2.abrupt("return", notificationData);

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 17]]);
}
/**
 * Handles POST requests for notification management
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} A promise that resolves to the response
 */


function POST(request) {
  return regeneratorRuntime.async(function POST$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          return _context4.abrupt("return", asyncLocalStorage.run({}, function _callee() {
            var authHeader, _ref2, generativeModel, body, type, recipient, content, priority, metadata, notification, processedNotification;

            return regeneratorRuntime.async(function _callee$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.prev = 0;
                    // --- Security check ---
                    authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

                    if (!(!authHeader || !authHeader.startsWith('Bearer '))) {
                      _context3.next = 4;
                      break;
                    }

                    return _context3.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'No autorizado: falta el token Bearer.'
                    }, {
                      status: 401
                    }));

                  case 4:
                    _context3.next = 6;
                    return regeneratorRuntime.awrap(initializeVertexAI());

                  case 6:
                    _ref2 = _context3.sent;
                    generativeModel = _ref2.generativeModel;
                    _context3.next = 10;
                    return regeneratorRuntime.awrap(request.json());

                  case 10:
                    body = _context3.sent;
                    type = body.type, recipient = body.recipient, content = body.content, priority = body.priority, metadata = body.metadata;

                    if (!(!type || !recipient || !content)) {
                      _context3.next = 14;
                      break;
                    }

                    return _context3.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Campos requeridos faltantes (tipo, destinatario, o contenido).'
                    }, {
                      status: 400
                    }));

                  case 14:
                    // Create notification object
                    notification = {
                      id: "notif_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9)),
                      type: type,
                      recipient: recipient,
                      content: content,
                      priority: priority || 'normal',
                      metadata: metadata || {},
                      createdAt: new Date().toISOString(),
                      status: 'pending'
                    }; // Process notification content with AI if available

                    _context3.next = 17;
                    return regeneratorRuntime.awrap(processNotificationContent(notification, generativeModel));

                  case 17:
                    processedNotification = _context3.sent;
                    return _context3.abrupt("return", _server.NextResponse.json({
                      success: true,
                      message: 'Notificación procesada correctamente.',
                      data: processedNotification
                    }));

                  case 21:
                    _context3.prev = 21;
                    _context3.t0 = _context3["catch"](0);
                    console.error('Error processing notification request:', _context3.t0);
                    return _context3.abrupt("return", _server.NextResponse.json({
                      success: false,
                      message: 'Error procesando la solicitud de notificación.',
                      error: _context3.t0.message
                    }, {
                      status: 500
                    }));

                  case 25:
                  case "end":
                    return _context3.stop();
                }
              }
            }, null, null, [[0, 21]]);
          }));

        case 1:
        case "end":
          return _context4.stop();
      }
    }
  });
}
/**
 * Handles GET requests to retrieve notifications or check API status
 */


function GET(request) {
  return regeneratorRuntime.async(function GET$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          return _context6.abrupt("return", asyncLocalStorage.run({}, function _callee2() {
            return regeneratorRuntime.async(function _callee2$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    return _context5.abrupt("return", _server.NextResponse.json({
                      status: 'Notification API is running',
                      timestamp: new Date().toISOString()
                    }));

                  case 1:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          }));

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
}

var runtime = 'nodejs';
exports.runtime = runtime;