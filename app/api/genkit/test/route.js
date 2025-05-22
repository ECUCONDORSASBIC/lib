/**
 * Test route for Genkit API
 *
 * This API provides diagnostic information about AI service availability
 * and dependency loading status, helping debug configuration issues.
 */
import { NextResponse } from 'next/server';

// Import for Firebase Admin
import { authAdmin } from '@/lib/firebase/firebaseAdmin';

// For Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI for testing
let googleAI;
try {
  if (process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY) {
    googleAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY
    );
    console.log("[Test API] Google Generative AI initialized successfully");
  }
} catch (error) {
  console.error("[Test API] Google AI Initialization error:", error);
}

/**
 * Test if Genkit can be imported
 */
async function testGenkitImport() {
  try {
    // Attempt to dynamically import Genkit
    const { Genkit } = await import('@genkit-ai/core');

    return {
      success: true,
      message: "Genkit package imported successfully",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("[Test API] Genkit import error:", error);
    return {
      success: false,
      message: `Genkit import error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET(request) {
  // Enhanced health check with dependency tests
  try {
    // Test Genkit import
    const genkitImportTest = await testGenkitImport();

    // Check AI initialization status
    const aiStatus = {
      googleAI: !!googleAI,
      hasGenkitKey: !!process.env.NEXT_PUBLIC_GENKIT_API_KEY,
      hasGoogleAIKey: !!process.env.GOOGLE_GENAI_API_KEY
    };

    return NextResponse.json({
      status: 'ok',
      message: 'API test route is working',
      timestamp: new Date().toISOString(),
      genkitImportTest,
      aiStatus,
      environment: {
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[Test API GET] Error:", error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Simple test function that uses Google AI for a basic prompt
 */
async function testGoogleAI(prompt = "Describe los beneficios de la telemedicina en 3 oraciones.") {
  if (!googleAI) {
    return {
      success: false,
      message: "Google AI client not initialized. Check API key configuration.",
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Use the generative model
    const model = googleAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: "Google AI test successful",
      response: text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("[Test API] Error generating content:", error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

export async function POST(request) {
  // Enhanced test functionality with authenticated AI interaction
  try {
    // Check auth
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required: Invalid or missing token.' }, { status: 401 });
    }
    const token = authorizationHeader.split('Bearer ')[1];

    try {
      // Verify the token
      await authAdmin.verifyIdToken(token);

      // Parse prompt from request body
      const body = await request.json();
      const prompt = body.prompt || "Describe los beneficios de la telemedicina en 3 oraciones.";

      // Test Google AI with the provided prompt
      const googleAITest = await testGoogleAI(prompt);

      // Test Genkit import
      const genkitImportTest = await testGenkitImport();

      // Check for primary vs alternative implementation path
      let apiImplementationPath = "/api/genkit/conversation";
      try {
        // Try loading Genkit dynamically as a test
        await import('@genkit-ai/core');
      } catch (err) {
        apiImplementationPath = "/api/genkit/conversation-alt";
        console.log("[Test API] Genkit import failed, would use alternative implementation");
      }

      return NextResponse.json({
        status: 'ok',
        aiInitialized: !!googleAI,
        googleAITest,
        genkitImportTest,
        recommendedPath: apiImplementationPath,
        timestamp: new Date().toISOString()
      }, { status: 200 });

    } catch (authError) {
      return NextResponse.json({
        error: 'Authentication failed',
        details: authError.message
      }, { status: 401 });
    }

  } catch (error) {
    console.error("[Test API POST] Error:", error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
