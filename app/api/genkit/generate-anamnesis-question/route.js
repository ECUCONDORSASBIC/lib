// Polyfill for process.stdout and process.stderr to fix isTTY errors
if (typeof process !== 'undefined' && process) {
  const mockStdout = { fd: 1, write: () => true, isTTY: false };
  const mockStderr = { fd: 2, write: () => true, isTTY: false };

  // Ensure process.stdout and process.stderr are available
  process.stdout = process.stdout || mockStdout;
  process.stderr = process.stderr || mockStderr;

  // Fix missing properties
  if (!process.stdout.fd) process.stdout.fd = 1;
  if (!process.stderr.fd) process.stderr.fd = 2;
  if (process.stdout.isTTY === undefined) process.stdout.isTTY = false;
  if (process.stderr.isTTY === undefined) process.stderr.isTTY = false;
}

import { NextResponse } from 'next/server';
const AsyncLocalStorageClass = require('../../../../lib/polyfills/async-local-storage-polyfill');

// Create an instance of AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorageClass();

/**
 * Safely initializes the Vertex AI client
 * @returns {Promise<{generativeModel: any, error: string|null}>}
 */
async function initializeVertexAI() {
  try {
    // Only load Vertex AI on the server side
    if (typeof window !== 'undefined') {
      return { generativeModel: null, error: 'Cannot run Vertex AI in the browser' };
    }

    const { HarmBlockThreshold, HarmCategory, VertexAI } = await import('@google-cloud/vertexai');

    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
    const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!PROJECT_ID) {
      console.warn('GOOGLE_CLOUD_PROJECT environment variable is not set. Vertex AI features will be disabled.');
      return {
        generativeModel: null,
        error: 'GOOGLE_CLOUD_PROJECT environment variable is not set'
      };
    }

    // Initialize VertexAI Client
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

    // Instantiate the model
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.0-pro-001',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
    });

    return { generativeModel, error: null };
  } catch (error) {
    console.error('Error initializing Vertex AI for anamnesis question generation:', error.message);
    return { generativeModel: null, error: error.message };
  }
}

/**
 * Handles POST requests to generate anamnesis questions via GenKit
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} A promise that resolves to the response
 */
export async function POST(request) {
  return asyncLocalStorage.run({}, async () => {
    try {
      // Initialize Vertex AI when the request is received
      const { generativeModel, error } = await initializeVertexAI();

      // Check if Vertex AI is properly initialized
      if (!generativeModel) {
        return NextResponse.json(
          {
            success: false,
            message: 'Servicio de IA no disponible. Por favor, verifica la configuración de Google Cloud.',
            error
          },
          { status: 503 }
        );
      }

      // --- Security check ---
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'No autorizado: falta el token Bearer.' },
          { status: 401 }
        );
      }

      // --- Data validation ---
      const body = await request.json();
      const { patientInfo, medicalHistory, currentContext } = body;

      if (!patientInfo || typeof patientInfo !== 'object') {
        return NextResponse.json(
          { success: false, message: 'Información del paciente inválida o faltante.' },
          { status: 400 }
        );
      }

      // Prepare the prompt for Vertex AI
      const prompt = `
        You are a medical professional conducting an anamnesis (medical interview).
        Based on the following patient information and context, generate the next relevant
        question to ask the patient. The question should be specific, focused on gathering
        important medical information, and help clarify the patient's condition.

        Patient Information:
        ${JSON.stringify(patientInfo, null, 2)}

        ${medicalHistory ? `Medical History:
        ${JSON.stringify(medicalHistory, null, 2)}` : ''}

        ${currentContext ? `Current Context:
        ${JSON.stringify(currentContext, null, 2)}` : ''}

        Generate a single, concise, relevant question to continue the anamnesis.
        Format it as a valid JSON object with the following structure:
        {
          "question": "Your clear, concise question here",
          "relevance": "Brief explanation of why this question is important",
          "possibleFollowUps": ["Potential follow-up question 1", "Potential follow-up question 2"]
        }

        Only output the JSON, no additional text.
      `;

      const req = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      try {
        const response = await generativeModel.generateContent(req);
        const result = await response.response;

        if (!result.candidates || result.candidates.length === 0 ||
          !result.candidates[0].content || !result.candidates[0].content.parts ||
          result.candidates[0].content.parts.length === 0) {
          return NextResponse.json({
            success: false,
            message: 'No se generó ninguna pregunta válida.',
          }, { status: 502 });
        }

        const responseText = result.candidates[0].content.parts[0].text;

        // Clean JSON if wrapped in markdown code blocks
        const cleanedJson = responseText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

        let questionData;
        try {
          questionData = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, '\nRaw response:', cleanedJson);
          return NextResponse.json({
            success: false,
            message: 'Error al parsear la respuesta de IA.',
            error: parseError.message,
          }, { status: 502 });
        }

        return NextResponse.json({
          success: true,
          message: 'Pregunta generada correctamente.',
          data: questionData,
        });
      } catch (aiError) {
        console.error('Error generating anamnesis question:', aiError);
        return NextResponse.json({
          success: false,
          message: 'Error generando pregunta de anamnesis.',
          error: aiError.message,
        }, { status: 502 });
      }
    } catch (error) {
      console.error('Error processing anamnesis question request:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Error procesando la solicitud de generación de pregunta de anamnesis.',
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}

export async function GET() {
  return asyncLocalStorage.run({}, async () => {
    return NextResponse.json({
      status: 'Anamnesis Question Generation API is running',
      timestamp: new Date().toISOString()
    });
  });
}

export const runtime = 'nodejs';
