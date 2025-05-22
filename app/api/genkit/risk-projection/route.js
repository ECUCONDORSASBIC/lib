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
 * @returns {Promise<{vertexAI: any, generativeModel: any, error: string|null}>}
 */
async function initializeVertexAI() {
  try {
    // Only load Vertex AI on the server side
    if (typeof window !== 'undefined') {
      return { vertexAI: null, generativeModel: null, error: 'Cannot run Vertex AI in the browser' };
    }

    const { HarmBlockThreshold, HarmCategory, VertexAI } = await import('@google-cloud/vertexai');

    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
    const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!PROJECT_ID) {
      console.warn('GOOGLE_CLOUD_PROJECT environment variable is not set. Vertex AI features will be disabled.');
      return {
        vertexAI: null,
        generativeModel: null,
        error: 'GOOGLE_CLOUD_PROJECT environment variable is not set'
      };
    }

    // Initialize VertexAI Client
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

    // Instantiate the model
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.0-pro-001', // Or your preferred model
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
    });

    return { vertexAI, generativeModel, error: null };
  } catch (error) {
    console.error('Error initializing Vertex AI for risk projection:', error.message);
    return { vertexAI: null, generativeModel: null, error: error.message };
  }
}

/**
 * Handles POST requests to calculate future risk projection via GenKit.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
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

      // --- Security: Verify JWT (example) ---
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'No autorizado: falta el token Bearer.' },
          { status: 401 }
        );
      }

      // --- Data Validation ---
      const body = await request.json();
      const { patientData, currentRiskAnalysis } = body;
      if (!patientData || typeof patientData !== 'object' || !patientData.id) {
        return NextResponse.json(
          { success: false, message: 'Datos de paciente inválidos o faltantes.' },
          { status: 400 }
        );
      }
      if (!currentRiskAnalysis || typeof currentRiskAnalysis !== 'object') {
        return NextResponse.json(
          { success: false, message: 'currentRiskAnalysis inválido o faltante.' },
          { status: 400 }
        );
      }

      // Construct the prompt for Vertex AI
      const prompt = `
        You are a medical AI assistant. Your task is to analyze the following patient data and current health risk assessment, and project future health risks for the next 5 years.

        STRICT INSTRUCTIONS:
        - Your response MUST be a single, strictly valid JSON object. Do NOT include any markdown, comments, explanations, or extra text.
        - Do NOT wrap the JSON in code blocks or add any non-JSON content.
        - All fields must match the schema exactly. If a value is unknown, use null or an empty array as appropriate.
        - Dates must be in ISO 8601 format.
        - Only output the JSON object, nothing else.

        Patient Data:
        ${JSON.stringify(patientData, null, 2)}

        Current Health Risk Analysis:
        ${JSON.stringify(currentRiskAnalysis, null, 2)}

        Based on this information, provide a future risk projection including:
        1.  Key potential future health risks (e.g., specific conditions like 'Type 2 Diabetes', 'Hypertension').
        2.  A general future risk score or category (e.g., low, moderate, high).
        3.  Confidence level of this projection.
        4.  A concise summary of the projection.
        5.  Actionable, prioritized recommendations to mitigate these future risks.

        The JSON object must have this structure:
        {
          "patientId": "string",
          "projectionYears": "number (e.g., 5)",
          "keyFutureRisks": ["string"],
          "futureRiskScore": "number (0-100) or category string",
          "confidenceLevel": "number (0-1)",
          "summary": "string",
          "detailedRecommendations": [
            { "id": "string", "text": "string", "priority": "high|medium|low" }
          ],
          "generatedAt": "ISO_date_string"
        }
      `;

      const req = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      try {
        const streamingResp = await generativeModel.generateContentStream(req);
        const aggregatedResponse = await streamingResp.response;
        let analysisText = '';
        if (aggregatedResponse.candidates && aggregatedResponse.candidates.length > 0 &&
          aggregatedResponse.candidates[0].content && aggregatedResponse.candidates[0].content.parts &&
          aggregatedResponse.candidates[0].content.parts.length > 0) {
          analysisText = aggregatedResponse.candidates[0].content.parts[0].text;
        } else {
          return NextResponse.json({
            success: false,
            message: 'No se recibió contenido válido de Vertex AI.',
            error: 'Empty response from Vertex AI',
          }, { status: 502 });
        }

        const cleanedJsonText = analysisText.replace(/^```json\s*|```$/g, '').trim();
        let futureRiskAnalysis;
        try {
          futureRiskAnalysis = JSON.parse(cleanedJsonText);
        } catch (parseError) {
          console.error('Vertex AI JSON parse error (risk-projection):', parseError, '\nRaw response:', cleanedJsonText);
          return NextResponse.json({
            success: false,
            message: 'Error al parsear la respuesta de Vertex AI.',
            error: parseError.message,
            raw: cleanedJsonText,
          }, { status: 502 });
        }

        if (!futureRiskAnalysis.patientId && patientData.id) {
          futureRiskAnalysis.patientId = patientData.id;
        }
        if (!futureRiskAnalysis.generatedAt) {
          futureRiskAnalysis.generatedAt = new Date().toISOString();
        }

        return NextResponse.json({
          success: true,
          message: 'Future risk projection successful.',
          data: futureRiskAnalysis,
        });
      } catch (vertexError) {
        console.error('Error communicating with Vertex AI (risk-projection):', vertexError);
        return NextResponse.json({
          success: false,
          message: 'Error comunicándose con Vertex AI.',
          error: vertexError.message,
        }, { status: 502 });
      }
    } catch (error) {
      console.error('Error processing risk projection request:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Error procesando la solicitud de proyección de riesgo futuro.',
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}

export async function GET(request) {
  return asyncLocalStorage.run({}, async () => {
    return NextResponse.json({ status: 'GenKit Risk Projection API is running' });
  });
}

export const runtime = 'nodejs';  // Changed from 'edge' to 'nodejs'
