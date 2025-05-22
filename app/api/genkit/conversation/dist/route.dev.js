"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _server = require("next/server");

var _firebaseAdmin = require("@/lib/firebase/firebaseAdmin");

var _core = require("@genkit-ai/core");

var _vertexai = require("@google-cloud/vertexai");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols(object)) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Initialize Genkit client if API key is available
var genkitClient;

try {
  if (process.env.NEXT_PUBLIC_GENKIT_API_KEY) {
    genkitClient = new _core.Genkit({
      apiKey: process.env.NEXT_PUBLIC_GENKIT_API_KEY
    });
    console.log("[Genkit] Client initialized successfully."); // Added console.log
  } else {
    console.warn("[Genkit] API key not found. Genkit client not initialized."); // Added warning
  }
} catch (error) {
  console.error("[Genkit] Initialization error:", error);
} // Initialize Vertex AI if project is available


var vertexAI;
var generativeModel;

try {
  var project = process.env.GOOGLE_CLOUD_PROJECT;
  var location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (project) {
    vertexAI = new _vertexai.VertexAI({
      project: project,
      location: location
    });
    generativeModel = vertexAI.getGenerativeModel({
      model: "gemini-1.0-pro",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.2,
        topP: 0.8
      }
    });
    console.log("[Vertex AI] Client and model initialized successfully."); // Added console.log
  } else {
    console.warn("[Vertex AI] Project ID not found. Vertex AI not initialized."); // Added warning
  }
} catch (error) {
  console.error("[Vertex AI] Initialization error:", error);
} // Primary function to process conversation using available AI services


function invokeGenkitConversationAnalysis(conversationContext) {
  var userInput, currentTopic, detailedPrompt, anamnesisData, previousMessages, extractedData, botMessages, nextTopic, confirmationMessage, aiPrompt, aiResponse, parsedResponse;
  return regeneratorRuntime.async(function invokeGenkitConversationAnalysis$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("[App Router API] invokeGenkitConversationAnalysis - Received context:", JSON.stringify(conversationContext, null, 2));
          userInput = conversationContext.userInput, currentTopic = conversationContext.currentTopic, detailedPrompt = conversationContext.detailedPrompt, anamnesisData = conversationContext.anamnesisData, previousMessages = conversationContext.previousMessages;
          extractedData = {};
          botMessages = [];
          nextTopic = currentTopic;
          _context.prev = 5;

          if (!(currentTopic === 'datos_personales' && userInput)) {
            _context.next = 28;
            break;
          }

          if (generativeModel) {
            _context.next = 10;
            break;
          }

          console.error("[AI] Generative model not available.");
          return _context.abrupt("return", {
            extractedData: {},
            messages: [{ role: 'assistant', content: "Lo siento, el servicio de IA no está disponible en este momento para procesar tus datos personales." }],
            nextTopic: currentTopic
          });

        case 10:
          // Construct prompt for AI
          aiPrompt = "Extrae el nombre, DNI y fecha de nacimiento del siguiente texto del usuario. Si alguno de los datos no está presente, omítelo en la respuesta. Formatea la respuesta como un objeto JSON con las claves 'nombre', 'dni', y 'fechaNacimiento'. Texto del usuario: \"".concat(userInput, "\"");

          if (previousMessages && previousMessages.length > 0) {
            aiPrompt += "\nContexto de mensajes anteriores: ".concat(JSON.stringify(previousMessages.slice(-3))); // Include last 3 messages for context
          }
          console.log("[AI] Prompt:", aiPrompt);
          _context.next = 15;
          return regeneratorRuntime.awrap(generativeModel.generateContent({
            contents: [{ role: "user", parts: [{ text: aiPrompt }] }]
          }));

        case 15:
          aiResponse = _context.sent;
          console.log("[AI] Raw response:", JSON.stringify(aiResponse, null, 2));

          // Ensure response and parts exist and are in the expected format
          if (!(aiResponse && aiResponse.response && aiResponse.response.candidates && aiResponse.response.candidates[0] && aiResponse.response.candidates[0].content && aiResponse.response.candidates[0].content.parts && aiResponse.response.candidates[0].content.parts[0] && aiResponse.response.candidates[0].content.parts[0].text)) {
            _context.next = 25;
            break;
          }

          parsedResponse = JSON.parse(aiResponse.response.candidates[0].content.parts[0].text);
          extractedData.datos_personales = {};
          if (parsedResponse.nombre) extractedData.datos_personales.nombre = parsedResponse.nombre;
          if (parsedResponse.dni) extractedData.datos_personales.dni = parsedResponse.dni;
          if (parsedResponse.fechaNacimiento) extractedData.datos_personales.fechaNacimiento = parsedResponse.fechaNacimiento;

          if (extractedData.datos_personales.nombre || extractedData.datos_personales.dni || extractedData.datos_personales.fechaNacimiento) {
            confirmationMessage = "Entendido. He registrado:";
            if (extractedData.datos_personales.nombre) confirmationMessage += " Nombre: ".concat(extractedData.datos_personales.nombre);
            if (extractedData.datos_personales.dni) confirmationMessage += ", DNI: ".concat(extractedData.datos_personales.dni);
            if (extractedData.datos_personales.fechaNacimiento) confirmationMessage += ", Fecha de Nacimiento: ".concat(extractedData.datos_personales.fechaNacimiento);
            confirmationMessage += ". ¿Es correcto?";
            botMessages.push({
              role: 'assistant',
              content: confirmationMessage
            });
            nextTopic = 'motivo_consulta';
          } else {
            botMessages.push({
              role: 'assistant',
              content: "No he podido identificar tu nombre, DNI o fecha de nacimiento en tu respuesta. ¿Podrías intentarlo de nuevo de forma más clara?"
            });
          }
          _context.next = 26;
          break;

        case 25:
          // Fallback if AI response is not as expected or parsing fails
          console.error("[AI] Failed to parse AI response or response structure is invalid.");
          botMessages.push({
            role: 'assistant',
            content: "No pude procesar la información de tus datos personales con claridad. ¿Podrías intentarlo de nuevo?"
          });

        case 26:
          _context.next = 31;
          break; // End of currentTopic if/else

        case 28:
          if (!(currentTopic === 'motivo_consulta')) {
            _context.next = 30;
            break;
          }
          // ... existing code for motivo_consulta ...
          // This part remains unchanged
          extractedData = {
            motivo_consulta: {
              descripcion_motivo: userInput
            }
          };
          botMessages.push({
            role: 'assistant',
            content: "Entendido, el motivo es: ".concat(userInput, ". Ahora, cuéntame sobre tus síntomas principales.")
          });
          nextTopic = 'sintomas_principales'; // O el siguiente tema lógico
          _context.next = 31;
          break;
        case 30:
          // ... existing code for other topics ...
          // This part remains unchanged
          botMessages.push({
            role: 'assistant',
            content: "Lo siento, no estoy seguro de cómo procesar eso en este momento."
          });
        case 31:
          _context.next = 35;
          break; // End of currentTopic if/else

        case 32:
          _context.prev = 32;
          _context.t0 = _context["catch"](5);
          console.error("[AI] Error during AI processing or data extraction:", _context.t0);
          botMessages.push({
            role: 'assistant',
            content: "Hubo un problema al procesar tu solicitud con la IA. Por favor, inténtalo de nuevo."
          });

        case 35:
          // Map bot messages to include IDs
          botMessages = botMessages.map(function (msg, index) {
            return _objectSpread({}, msg, {
              id: "bot-".concat(Date.now(), "-").concat(index)
            });
          });
          return _context.abrupt("return", {
            extractedData: extractedData,
            messages: botMessages,
            nextTopic: nextTopic
          });

        case 37:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 32]]); // Added try-catch block
}

function POST(request) {
  var authorizationHeader, token, body, conversationContext, patientId, analysisResult;
  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          authorizationHeader = request.headers.get('Authorization');

          if (!(!authorizationHeader || !authorizationHeader.startsWith('Bearer '))) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Authentication required: Invalid or missing token.',
            code: 'auth/missing-token'
          }, {
            status: 401
          }));

        case 3:
          token = authorizationHeader.split('Bearer ')[1];
          _context2.prev = 4;
          // Firebase Admin should already be initialized by our import
          console.log("[App Router API] Firebase Admin instance status:", !!_firebaseAdmin.adminAppInstance ? "Available" : "Not available");
          console.log("[App Router API] Verifying ID token...");
          _context2.next = 9;
          return regeneratorRuntime.awrap(_firebaseAdmin.authAdmin.verifyIdToken(token));

        case 9:
          console.log("[App Router API] ID token verified successfully.");
          _context2.next = 12;
          return regeneratorRuntime.awrap(request.json());

        case 12:
          body = _context2.sent;
          conversationContext = body.conversationContext, patientId = body.patientId;

          if (!(!conversationContext || !patientId)) {
            _context2.next = 16;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Missing conversationContext or patientId in request body.'
          }, {
            status: 400
          }));

        case 16:
          console.log("[App Router API] Invoking Genkit conversation analysis...");
          _context2.next = 19;
          return regeneratorRuntime.awrap(invokeGenkitConversationAnalysis(conversationContext));

        case 19:
          analysisResult = _context2.sent;
          console.log("[App Router API] Genkit analysis result:", analysisResult);
          return _context2.abrupt("return", _server.NextResponse.json(analysisResult, {
            status: 200
          }));

        case 24:
          _context2.prev = 24;
          _context2.t0 = _context2["catch"](4);
          console.error('[App Router API] Error in /api/genkit/conversation POST:', _context2.t0);

          if (!(_context2.t0.code === 'auth/id-token-expired')) {
            _context2.next = 29;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Authentication required: Token expired.',
            code: _context2.t0.code
          }, {
            status: 401
          }));

        case 29:
          if (!(_context2.t0.code && _context2.t0.code.startsWith('auth/'))) {
            _context2.next = 31;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Authentication required: ".concat(_context2.t0.message),
            code: _context2.t0.code
          }, {
            status: 401
          }));

        case 31:
          if (!(_context2.t0 instanceof SyntaxError && _context2.t0.message.includes("JSON"))) {
            _context2.next = 33;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Invalid JSON in request body.',
            details: _context2.t0.message
          }, {
            status: 400
          }));

        case 33:
          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Error processing conversation analysis.',
            details: _context2.t0.message
          }, {
            status: 500
          }));

        case 34:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 24]]);
}
