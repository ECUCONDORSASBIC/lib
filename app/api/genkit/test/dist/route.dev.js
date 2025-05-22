"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;

var _server = require("next/server");

var _firebaseAdmin = require("@/lib/firebase/firebaseAdmin");

var _generativeAi = require("@google/generative-ai");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Initialize Google AI for testing
var googleAI;

try {
  if (process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY) {
    googleAI = new _generativeAi.GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY);
    console.log("[Test API] Google Generative AI initialized successfully");
  }
} catch (error) {
  console.error("[Test API] Google AI Initialization error:", error);
}
/**
 * Test if Genkit can be imported
 */


function testGenkitImport() {
  var _ref, Genkit;

  return regeneratorRuntime.async(function testGenkitImport$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Promise.resolve().then(function () {
            return _interopRequireWildcard(require('@genkit-ai/core'));
          }));

        case 3:
          _ref = _context.sent;
          Genkit = _ref.Genkit;
          return _context.abrupt("return", {
            success: true,
            message: "Genkit package imported successfully",
            timestamp: new Date().toISOString()
          });

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.error("[Test API] Genkit import error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            message: "Genkit import error: ".concat(_context.t0.message),
            timestamp: new Date().toISOString()
          });

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
}

function GET(request) {
  var genkitImportTest, aiStatus;
  return regeneratorRuntime.async(function GET$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(testGenkitImport());

        case 3:
          genkitImportTest = _context2.sent;
          // Check AI initialization status
          aiStatus = {
            googleAI: !!googleAI,
            hasGenkitKey: !!process.env.NEXT_PUBLIC_GENKIT_API_KEY,
            hasGoogleAIKey: !!process.env.GOOGLE_GENAI_API_KEY
          };
          return _context2.abrupt("return", _server.NextResponse.json({
            status: 'ok',
            message: 'API test route is working',
            timestamp: new Date().toISOString(),
            genkitImportTest: genkitImportTest,
            aiStatus: aiStatus,
            environment: {
              nodeEnv: process.env.NODE_ENV
            }
          }, {
            status: 200
          }));

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          console.error("[Test API GET] Error:", _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            status: 'error',
            error: _context2.t0.message,
            timestamp: new Date().toISOString()
          }, {
            status: 500
          }));

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
}
/**
 * Simple test function that uses Google AI for a basic prompt
 */


function testGoogleAI() {
  var prompt,
      model,
      result,
      response,
      text,
      _args3 = arguments;
  return regeneratorRuntime.async(function testGoogleAI$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          prompt = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : "Describe los beneficios de la telemedicina en 3 oraciones.";

          if (googleAI) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            message: "Google AI client not initialized. Check API key configuration.",
            timestamp: new Date().toISOString()
          });

        case 3:
          _context3.prev = 3;
          // Use the generative model
          model = googleAI.getGenerativeModel({
            model: "gemini-pro"
          }); // Generate content

          _context3.next = 7;
          return regeneratorRuntime.awrap(model.generateContent(prompt));

        case 7:
          result = _context3.sent;
          _context3.next = 10;
          return regeneratorRuntime.awrap(result.response);

        case 10:
          response = _context3.sent;
          text = response.text();
          return _context3.abrupt("return", {
            success: true,
            message: "Google AI test successful",
            response: text,
            timestamp: new Date().toISOString()
          });

        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](3);
          console.error("[Test API] Error generating content:", _context3.t0);
          return _context3.abrupt("return", {
            success: false,
            message: "Error: ".concat(_context3.t0.message),
            timestamp: new Date().toISOString()
          });

        case 19:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[3, 15]]);
}

function POST(request) {
  var authorizationHeader, token, body, prompt, googleAITest, genkitImportTest, apiImplementationPath;
  return regeneratorRuntime.async(function POST$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          // Check auth
          authorizationHeader = request.headers.get('Authorization');

          if (!(!authorizationHeader || !authorizationHeader.startsWith('Bearer '))) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", _server.NextResponse.json({
            error: 'Authentication required: Invalid or missing token.'
          }, {
            status: 401
          }));

        case 4:
          token = authorizationHeader.split('Bearer ')[1];
          _context4.prev = 5;
          _context4.next = 8;
          return regeneratorRuntime.awrap(_firebaseAdmin.authAdmin.verifyIdToken(token));

        case 8:
          _context4.next = 10;
          return regeneratorRuntime.awrap(request.json());

        case 10:
          body = _context4.sent;
          prompt = body.prompt || "Describe los beneficios de la telemedicina en 3 oraciones."; // Test Google AI with the provided prompt

          _context4.next = 14;
          return regeneratorRuntime.awrap(testGoogleAI(prompt));

        case 14:
          googleAITest = _context4.sent;
          _context4.next = 17;
          return regeneratorRuntime.awrap(testGenkitImport());

        case 17:
          genkitImportTest = _context4.sent;
          // Check for primary vs alternative implementation path
          apiImplementationPath = "/api/genkit/conversation";
          _context4.prev = 19;
          _context4.next = 22;
          return regeneratorRuntime.awrap(Promise.resolve().then(function () {
            return _interopRequireWildcard(require('@genkit-ai/core'));
          }));

        case 22:
          _context4.next = 28;
          break;

        case 24:
          _context4.prev = 24;
          _context4.t0 = _context4["catch"](19);
          apiImplementationPath = "/api/genkit/conversation-alt";
          console.log("[Test API] Genkit import failed, would use alternative implementation");

        case 28:
          return _context4.abrupt("return", _server.NextResponse.json({
            status: 'ok',
            aiInitialized: !!googleAI,
            googleAITest: googleAITest,
            genkitImportTest: genkitImportTest,
            recommendedPath: apiImplementationPath,
            timestamp: new Date().toISOString()
          }, {
            status: 200
          }));

        case 31:
          _context4.prev = 31;
          _context4.t1 = _context4["catch"](5);
          return _context4.abrupt("return", _server.NextResponse.json({
            error: 'Authentication failed',
            details: _context4.t1.message
          }, {
            status: 401
          }));

        case 34:
          _context4.next = 40;
          break;

        case 36:
          _context4.prev = 36;
          _context4.t2 = _context4["catch"](0);
          console.error("[Test API POST] Error:", _context4.t2);
          return _context4.abrupt("return", _server.NextResponse.json({
            status: 'error',
            error: _context4.t2.message,
            timestamp: new Date().toISOString()
          }, {
            status: 500
          }));

        case 40:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 36], [5, 31], [19, 24]]);
}