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

// Initialize Vertex AI client conditionally
let vertexAI;
let generativeModel;

try {
  const { VertexAI } = require('@google-cloud/vertexai');

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (!project) {
    console.warn('GOOGLE_CLOUD_PROJECT environment variable is not set. Vertex AI features will be disabled.');
  } else {
    // Initialize VertexAI Client
    vertexAI = new VertexAI({ project, location });

    // Initialize the model
    generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.0-pro',
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    });
  }
} catch (error) {
  console.error('Error initializing Vertex AI for health analysis:', error.message);
}

export async function POST(request) {
  // Check if Vertex AI is properly initialized
  if (!generativeModel) {
    console.error('Vertex AI SDK not initialized properly. Generative model is unavailable.');
    return NextResponse.json(
      {
        success: false,
        message: 'Servicio de análisis de salud no disponible. Por favor, verifica la configuración de Google Cloud.',
        error: 'Vertex AI not initialized'
      },
      { status: 503 } // Service Unavailable
    );
  }

  try {
    const patientData = await request.json();

    if (!patientData || typeof patientData !== 'object' || Object.keys(patientData).length === 0) {
      return NextResponse.json(
        { error: 'Patient data is required and must be a non-empty object.' },
        { status: 400 }
      );
    }

    // Construct a detailed prompt for health analysis
    const prompt = `
      Analyze the following patient health data and provide a comprehensive risk assessment.
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}

      Based on this data, identify key health risks, contributing factors, and provide actionable recommendations.
      The response MUST be a valid JSON object adhering strictly to the following structure. Do not include any explanatory text before or after the JSON object itself (e.g. no "Here is the JSON..." or markdown code fences like \\\`\\\`\\\`json).
      {
        "overallRiskLevel": "string (e.g., Low, Moderate, High, Very High)",
        "riskFactors": [
          {
            "factor": "string (e.g., High Blood Pressure, Smoking, Sedentary Lifestyle)",
            "details": "string (e.g., BP at 150/95 mmHg, Smokes 10 cigarettes/day)",
            "implication": "string (e.g., Increased risk of cardiovascular disease)"
          }
        ],
        "recommendations": [
          {
            "recommendation": "string (e.g., Dietary changes, Increase physical activity, Medication review)",
            "details": "string (e.g., Reduce sodium intake, Aim for 150 minutes of moderate exercise per week, Consult doctor about current medication effectiveness)",
            "priority": "string (e.g., High, Medium, Low)"
          }
        ],
        "positiveAspects": [
          {
            "aspect": "string (e.g., Regular check-ups, Good cholesterol levels)",
            "details": "string (e.g., Annual physical exam completed, HDL cholesterol at 60 mg/dL)"
          }
        ],
        "summary": "string (A brief textual summary of the overall health status and key concerns, max 200 words)"
      }
      Ensure all string values are properly escaped for JSON.
    `;

    const req = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    console.log("Sending request to Vertex AI Gemini model...");
    // Using generateContent for potentially simpler handling if streaming is not strictly needed for this use case
    // and the full JSON response is expected.
    const result = await generativeModel.generateContent(req);
    const response = result.response;

    if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts || response.candidates[0].content.parts.length === 0) {
      console.error("Invalid response structure from Vertex AI:", JSON.stringify(response, null, 2));
      return NextResponse.json(
        { error: 'Received an invalid or empty response from AI service.' },
        { status: 502 } // Bad Gateway
      );
    }

    const analysisText = response.candidates[0].content.parts[0].text;

    let analysisJson;
    try {
      // Attempt to directly parse, assuming the model adheres to the "no markdown" instruction.
      analysisJson = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse Vertex AI response as JSON. Raw text:", analysisText, "Error:", parseError);
      // Fallback: try to clean common markdown wrapping if direct parse fails
      const cleanedJsonString = analysisText.replace(/^```json\s *| ```$/g, '').trim();
      try {
        analysisJson = JSON.parse(cleanedJsonString);
      } catch (cleanedParseError) {
        console.error("Failed to parse even cleaned Vertex AI response. Cleaned text:", cleanedJsonString, "Error:", cleanedParseError);
        return NextResponse.json(
          { error: 'Failed to parse AI analysis. The response was not valid JSON.', rawResponse: analysisText },
          { status: 500 }
        );
      }
    }
    console.log("Successfully parsed AI response.");
    return NextResponse.json(analysisJson, { status: 200 });

  } catch (error) {
    console.error("[API /api/ai/analyze-health] Error:", error.message, error.stack);
    let errorMessage = 'Failed to analyze health data.';
    let statusCode = 500;

    // Check for specific Vertex AI related errors if possible (may need to inspect error object structure)
    if (error.message.toLowerCase().includes('vertex') || error.message.toLowerCase().includes('google api') || error.code) {
      errorMessage = `AI Service Error: ${error.message}`;
      statusCode = 502; // Bad Gateway, as our service depends on Vertex AI
    } else if (error instanceof SyntaxError && error.message.includes("JSON")) { // JSON parsing error from request.json()
      errorMessage = 'Invalid request body: not valid JSON.';
      statusCode = 400;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message }, // Provide details for server-side logging/debugging
      { status: statusCode }
    );
  }
}
