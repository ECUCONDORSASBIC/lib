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
 * Safely initializes the Vertex AI client if needed for notification processing
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
        maxOutputTokens: 512,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
    });

    return { generativeModel, error: null };
  } catch (error) {
    console.error('Error initializing Vertex AI for notifications:', error.message);
    return { generativeModel: null, error: error.message };
  }
}

/**
 * Process and enhance notification content if needed
 * @param {Object} notificationData - The notification data to process
 * @param {Object} generativeModel - The AI model for text enhancements
 * @returns {Promise<Object>} - The processed notification data
 */
async function processNotificationContent(notificationData, generativeModel) {
  // If no AI model is available, return the original data
  if (!generativeModel || !notificationData.content || notificationData.skipAIProcessing) {
    return notificationData;
  }

  try {
    // Example: Use AI to improve notification wording or add relevant details
    const prompt = `
      Enhance the following medical notification message to be clear, professional, and empathetic.
      Keep it concise but ensure all important information is included.
      Only return the enhanced text, without any explanations or other text.

      Original message: "${notificationData.content}"
    `;

    const req = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const response = await generativeModel.generateContent(req);
    const result = await response.response;

    if (result.candidates && result.candidates.length > 0 &&
      result.candidates[0].content && result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0) {

      const enhancedContent = result.candidates[0].content.parts[0].text.trim();

      // Return enhanced notification
      return {
        ...notificationData,
        content: enhancedContent,
        aiEnhanced: true
      };
    }

    return notificationData;
  } catch (error) {
    console.error('Error enhancing notification content:', error);
    return notificationData; // Return original on error
  }
}

/**
 * Handles POST requests for notification management
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} A promise that resolves to the response
 */
export async function POST(request) {
  return asyncLocalStorage.run({}, async () => {
    try {
      // --- Security check ---
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'No autorizado: falta el token Bearer.' },
          { status: 401 }
        );
      }

      // Initialize Vertex AI if needed for notification processing
      const { generativeModel } = await initializeVertexAI();

      // --- Data validation ---
      const body = await request.json();
      const { type, recipient, content, priority, metadata } = body;

      if (!type || !recipient || !content) {
        return NextResponse.json(
          { success: false, message: 'Campos requeridos faltantes (tipo, destinatario, o contenido).' },
          { status: 400 }
        );
      }

      // Create notification object
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        recipient,
        content,
        priority: priority || 'normal',
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Process notification content with AI if available
      const processedNotification = await processNotificationContent(notification, generativeModel);

      // In a real implementation, you would save to database and trigger actual notification
      // For now, just return success with the notification data

      return NextResponse.json({
        success: true,
        message: 'Notificación procesada correctamente.',
        data: processedNotification
      });
    } catch (error) {
      console.error('Error processing notification request:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Error procesando la solicitud de notificación.',
          error: error.message,
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Handles GET requests to retrieve notifications or check API status
 */
export async function GET(request) {
  return asyncLocalStorage.run({}, async () => {
    // For demonstration, this just returns API status
    // In a real implementation, this could retrieve notifications for a user
    return NextResponse.json({
      status: 'Notification API is running',
      timestamp: new Date().toISOString()
    });
  });
}

export const runtime = 'nodejs';
