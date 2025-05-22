"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGenkitInstance = createGenkitInstance;
exports["default"] = void 0;

/**
 * Genkit API wrapper to handle browser compatibility
 * This module provides a safe way to use Genkit in both server and client contexts
 */
// Only import Genkit on the server side
var Genkit;
var GoogleAI;
var isServer = typeof window === 'undefined'; // Dynamically import only on the server side

if (isServer) {
  try {
    var GenKitLib = require('@genkit-ai/core');

    var GoogleAILib = require('@genkit-ai/googleai');

    Genkit = GenKitLib.Genkit;
    GoogleAI = GoogleAILib.GoogleAI;
  } catch (error) {
    console.error('Failed to import Genkit libraries:', error);
  }
}
/**
 * Creates a server-compatible Genkit instance
 * @returns {Object} Genkit instance or mock for client-side
 */


function createGenkitInstance() {
  // On the server, return a real Genkit instance
  if (isServer && Genkit && GoogleAI) {
    return new Genkit({
      provider: new GoogleAI({
        apiKey: process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY
      })
    });
  } // On the client, return a mock object that will delegate to API routes


  return {
    action: function action() {
      return {
        run: function run(actionName, params) {
          var response;
          return regeneratorRuntime.async(function run$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return regeneratorRuntime.awrap(fetch('/api/genkit/analyze', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      action: actionName,
                      params: params
                    })
                  }));

                case 2:
                  response = _context.sent;

                  if (response.ok) {
                    _context.next = 5;
                    break;
                  }

                  throw new Error("Genkit API error: ".concat(response.statusText));

                case 5:
                  _context.next = 7;
                  return regeneratorRuntime.awrap(response.json());

                case 7:
                  return _context.abrupt("return", _context.sent);

                case 8:
                case "end":
                  return _context.stop();
              }
            }
          });
        }
      };
    },
    prompt: function prompt(params) {
      var response;
      return regeneratorRuntime.async(function prompt$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(fetch('/api/genkit/prompt', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
              }));

            case 2:
              response = _context2.sent;

              if (response.ok) {
                _context2.next = 5;
                break;
              }

              throw new Error("Genkit API error: ".concat(response.statusText));

            case 5:
              _context2.next = 7;
              return regeneratorRuntime.awrap(response.json());

            case 7:
              return _context2.abrupt("return", _context2.sent);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // Add more methods as needed

  };
}

var _default = createGenkitInstance;
exports["default"] = _default;