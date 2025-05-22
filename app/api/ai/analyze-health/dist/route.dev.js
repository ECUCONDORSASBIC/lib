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

// Initialize Vertex AI client conditionally
var vertexAI;
var generativeModel;

try {
  var _require = require('@google-cloud/vertexai'),
      VertexAI = _require.VertexAI;

  var project = process.env.GOOGLE_CLOUD_PROJECT;
  var location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!project) {
    console.warn('GOOGLE_CLOUD_PROJECT environment variable is not set. Vertex AI features will be disabled.');
  } else {
    // Initialize VertexAI Client
    vertexAI = new VertexAI({
      project: project,
      location: location
    }); // Initialize the model

    generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.0-pro',
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [{
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }, {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }, {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }, {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }]
    });
  }
} catch (error) {
  console.error('Error initializing Vertex AI for health analysis:', error.message);
}

function POST(request) {
  var patientData, prompt, req, result, response, analysisText, analysisJson, cleanedJsonString, errorMessage, statusCode;
  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (generativeModel) {
            _context.next = 3;
            break;
          }

          console.error('Vertex AI SDK not initialized properly. Generative model is unavailable.');
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Servicio de análisis de salud no disponible. Por favor, verifica la configuración de Google Cloud.',
            error: 'Vertex AI not initialized'
          }, {
            status: 503
          } // Service Unavailable
          ));

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(request.json());

        case 6:
          patientData = _context.sent;

          if (!(!patientData || _typeof(patientData) !== 'object' || Object.keys(patientData).length === 0)) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Patient data is required and must be a non-empty object.'
          }, {
            status: 400
          }));

        case 9:
          // Construct a detailed prompt for health analysis
          prompt = "\n      Analyze the following patient health data and provide a comprehensive risk assessment.\n      Patient Data:\n      ".concat(JSON.stringify(patientData, null, 2), "\n\n      Based on this data, identify key health risks, contributing factors, and provide actionable recommendations.\n      The response MUST be a valid JSON object adhering strictly to the following structure. Do not include any explanatory text before or after the JSON object itself (e.g. no \"Here is the JSON...\" or markdown code fences like \\`\\`\\`json).\n      {\n        \"overallRiskLevel\": \"string (e.g., Low, Moderate, High, Very High)\",\n        \"riskFactors\": [\n          {\n            \"factor\": \"string (e.g., High Blood Pressure, Smoking, Sedentary Lifestyle)\",\n            \"details\": \"string (e.g., BP at 150/95 mmHg, Smokes 10 cigarettes/day)\",\n            \"implication\": \"string (e.g., Increased risk of cardiovascular disease)\"\n          }\n        ],\n        \"recommendations\": [\n          {\n            \"recommendation\": \"string (e.g., Dietary changes, Increase physical activity, Medication review)\",\n            \"details\": \"string (e.g., Reduce sodium intake, Aim for 150 minutes of moderate exercise per week, Consult doctor about current medication effectiveness)\",\n            \"priority\": \"string (e.g., High, Medium, Low)\"\n          }\n        ],\n        \"positiveAspects\": [\n          {\n            \"aspect\": \"string (e.g., Regular check-ups, Good cholesterol levels)\",\n            \"details\": \"string (e.g., Annual physical exam completed, HDL cholesterol at 60 mg/dL)\"\n          }\n        ],\n        \"summary\": \"string (A brief textual summary of the overall health status and key concerns, max 200 words)\"\n      }\n      Ensure all string values are properly escaped for JSON.\n    ");
          req = {
            contents: [{
              role: "user",
              parts: [{
                text: prompt
              }]
            }]
          };
          console.log("Sending request to Vertex AI Gemini model..."); // Using generateContent for potentially simpler handling if streaming is not strictly needed for this use case
          // and the full JSON response is expected.

          _context.next = 14;
          return regeneratorRuntime.awrap(generativeModel.generateContent(req));

        case 14:
          result = _context.sent;
          response = result.response;

          if (!(!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts || response.candidates[0].content.parts.length === 0)) {
            _context.next = 19;
            break;
          }

          console.error("Invalid response structure from Vertex AI:", JSON.stringify(response, null, 2));
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Received an invalid or empty response from AI service.'
          }, {
            status: 502
          } // Bad Gateway
          ));

        case 19:
          analysisText = response.candidates[0].content.parts[0].text;
          _context.prev = 20;
          // Attempt to directly parse, assuming the model adheres to the "no markdown" instruction.
          analysisJson = JSON.parse(analysisText);
          _context.next = 36;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](20);
          console.error("Failed to parse Vertex AI response as JSON. Raw text:", analysisText, "Error:", _context.t0); // Fallback: try to clean common markdown wrapping if direct parse fails

          cleanedJsonString = analysisText.replace(/^```json\s *| ```$/g, '').trim();
          _context.prev = 28;
          analysisJson = JSON.parse(cleanedJsonString);
          _context.next = 36;
          break;

        case 32:
          _context.prev = 32;
          _context.t1 = _context["catch"](28);
          console.error("Failed to parse even cleaned Vertex AI response. Cleaned text:", cleanedJsonString, "Error:", _context.t1);
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Failed to parse AI analysis. The response was not valid JSON.',
            rawResponse: analysisText
          }, {
            status: 500
          }));

        case 36:
          console.log("Successfully parsed AI response.");
          return _context.abrupt("return", _server.NextResponse.json(analysisJson, {
            status: 200
          }));

        case 40:
          _context.prev = 40;
          _context.t2 = _context["catch"](3);
          console.error("[API /api/ai/analyze-health] Error:", _context.t2.message, _context.t2.stack);
          errorMessage = 'Failed to analyze health data.';
          statusCode = 500; // Check for specific Vertex AI related errors if possible (may need to inspect error object structure)

          if (_context.t2.message.toLowerCase().includes('vertex') || _context.t2.message.toLowerCase().includes('google api') || _context.t2.code) {
            errorMessage = "AI Service Error: ".concat(_context.t2.message);
            statusCode = 502; // Bad Gateway, as our service depends on Vertex AI
          } else if (_context.t2 instanceof SyntaxError && _context.t2.message.includes("JSON")) {
            // JSON parsing error from request.json()
            errorMessage = 'Invalid request body: not valid JSON.';
            statusCode = 400;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: errorMessage,
            details: _context.t2.message
          }, // Provide details for server-side logging/debugging
          {
            status: statusCode
          }));

        case 47:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 40], [20, 24], [28, 32]]);
}