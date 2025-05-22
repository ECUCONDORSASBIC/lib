/**
 * Conversational Anamnesis API
 *
 * This API route handles the conversational medical history taking feature
 * using a multi-layered AI approach:
 *
 * 1. Primary: Genkit AI for medical conversation analysis
 * 2. Fallback: Vertex AI (Google's Gemini model) for robust backup
 * 3. Final fallback: Rule-based simulated responses
 *
 * The API extracts structured medical data from patient conversations,
 * enabling a natural dialogue-based medical history taking experience.
 */

import { NextResponse } from 'next/server';
// Import for Firebase Admin
import { adminAppInstance, authAdmin } from '@/lib/firebase/firebaseAdmin';
// Import for Vertex AI
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize clients
let genkitClient;
let genAI;

// We'll use a graceful fallback approach that combines both implementations
const initializeAI = async () => {
  try {
    // First try to initialize Google AI directly (most reliable method)
    if (process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY) {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY);
      console.log("[AI Init] Google Generative AI initialized successfully");
    }

    // Then try to initialize Genkit (may fail due to dependency issues)
    if (process.env.NEXT_PUBLIC_GENKIT_API_KEY) {
      try {
        // Use dynamic import with ES modules for better compatibility
        const { Genkit } = await import('@genkit-ai/core');
        genkitClient = new Genkit({
          apiKey: process.env.NEXT_PUBLIC_GENKIT_API_KEY
        });
        console.log("[AI Init] Genkit initialized successfully");
      } catch (genkitError) {
        console.warn("[AI Init] Genkit initialization failed, will use direct Google AI instead:", genkitError.message);
      }
    }
  } catch (error) {
    console.error("[AI Init] AI services initialization error:", error);
  }
};

// Initialize AI services
initializeAI().catch(err => console.error("[AI Init] Failed to initialize AI services:", err));

// Helper function to generate topic-specific instructions for better medical extraction
function generateTopicSpecificInstructions(topic, formFields) {
  // Base set of instructions for common medical topics
  const topicInstructions = {
    'datos-personales': `Extrae el nombre completo, DNI/documento de identidad, fecha de nacimiento,
    género/sexo y cualquier otro dato de identificación del paciente. Usa un tono formal pero cercano.`,

    'motivo-consulta': `Identifica el motivo principal de la consulta, duración de los síntomas,
    y factores precipitantes. Haz preguntas de seguimiento para entender la razón exacta de la visita.`,

    'sintomas-principales': `Extrae información detallada sobre los síntomas: localización,
    intensidad (en escala 1-10 si aplica), duración, características (constante/intermitente),
    factores que lo agravan o alivian.`,

    'historia-enfermedad': `Documenta la evolución cronológica de la enfermedad actual,
    tratamientos previos y su efectividad, y resultados de exámenes anteriores si se mencionan.`,

    'antecedentes-personales': `Registra enfermedades previas, cirugías, hospitalizaciones,
    alergias, medicación actual y hábitos (tabaco, alcohol, drogas, alimentación, ejercicio).`,

    'antecedentes-familiares': `Identifica enfermedades hereditarias o condiciones presentes
    en familiares de primer grado (padres, hermanos, hijos), especialmente diabetes, hipertensión,
    cáncer y enfermedades cardiovasculares.`,

    'revision-sistemas': `Revisa sistemáticamente cada aparato/sistema del cuerpo.
    Para cada sistema mencionado por el paciente, extrae síntomas presentes o ausentes.`
  };

  // Get specific instructions or use generic ones
  const specificInstructions = topicInstructions[topic] ||
    `Extrae información médica relevante relacionada con el tema "${topic}".`;

  // Add form fields if available
  let formFieldsInstructions = '';
  if (formFields && Object.keys(formFields).length > 0) {
    formFieldsInstructions = `\nPara este tema, debes extraer específicamente los siguientes campos:\n${JSON.stringify(formFields, null, 2)}`;
  }

  return `${specificInstructions}${formFieldsInstructions}\n\nExtrae SOLO los datos mencionados por el paciente, no inventes información.`;
}

// Initialize Vertex AI if project is available
let vertexAI;
let generativeModel;
try {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

  if (project) {
    vertexAI = new VertexAI({ project, location });
    generativeModel = vertexAI.getGenerativeModel({
      model: "gemini-1.0-pro",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.2,
        topP: 0.8,
      }
    });
  }
} catch (error) {
  console.error("[Vertex AI] Initialization error:", error);
}

// Primary function to process conversation using available AI services
async function invokeGenkitConversationAnalysis(conversationContext) {
  console.log("[App Router API] invokeGenkitConversationAnalysis - Received context:", JSON.stringify(conversationContext, null, 2));

  const { userInput, currentTopic, detailedPrompt, anamnesisData, previousMessages } = conversationContext;
  const formFields = conversationContext.formFields || {};

  // Primero intentamos con Genkit si está disponible
  if (genkitClient) {
    try {
      console.log("[App Router API] Using Genkit for conversation analysis");
      // Preparar el contexto conversacional para el modelo con instrucciones específicas para medicina
      const systemMessage = `Eres un asistente médico profesional especializado en realizar anamnesis.
Tu objetivo es ayudar a extraer información médica relevante de las respuestas del paciente.
Debes ser empático, profesional y seguir un formato de extracción de datos estructurado.

TEMA ACTUAL: ${currentTopic}
INSTRUCCIONES DETALLADAS: ${detailedPrompt || 'Extrae información médica relevante'}

${generateTopicSpecificInstructions(currentTopic, formFields)}

Tu respuesta debe seguir este formato JSON:
{
  "extractedData": {
    // Datos médicos extraídos según el tema actual
  },
  "responseMessage": "Tu respuesta natural y empática al paciente",
  "nextTopic": "${currentTopic}", // Mantén el mismo tema o avanza si ya has obtenido suficiente información
  "completionStatus": {
    "currentTopicComplete": true/false // Indica si has obtenido toda la información necesaria para este tema
  }
}`;      // Construir el contexto de mensajes previos con optimización de tokens
      let conversationHistory;

      // Función para estimar tokens (aproximadamente 4 caracteres por token)
      const estimateTokens = (text) => Math.ceil(text.length / 4);

      if (previousMessages && previousMessages.length > 0) {
        // Crear historial limitando el número total de tokens estimados
        const maxHistoryTokens = 2048; // Límite para evitar exceder el contexto máximo
        let totalTokens = 0;
        let relevantMessages = [];

        // Siempre incluir los últimos 3 mensajes para mantener el contexto inmediato
        const essentialMessages = previousMessages.slice(-3);
        for (const msg of essentialMessages) {
          totalTokens += estimateTokens(msg.content);
        }

        // Agregar mensajes anteriores si hay espacio, priorizando los más recientes
        for (let i = previousMessages.length - 4; i >= 0 && totalTokens < maxHistoryTokens; i--) {
          const tokensNeeded = estimateTokens(previousMessages[i].content);
          if (totalTokens + tokensNeeded <= maxHistoryTokens) {
            relevantMessages.unshift(previousMessages[i]);
            totalTokens += tokensNeeded;
          } else {
            break;
          }
        }

        // Construir el historial final combinando los mensajes esenciales y relevantes
        conversationHistory = [...relevantMessages, ...essentialMessages].map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }));
      } else {
        conversationHistory = [];
      }

      // Agregar el mensaje del usuario actual
      conversationHistory.push({
        role: 'user',
        content: userInput
      });

      // Llamar a Genkit para el análisis con un timeout para evitar que la llamada se quede esperando indefinidamente
      const genkitPromise = genkitClient.prompt({
        messages: [
          { role: 'system', content: systemMessage },
          ...conversationHistory
        ],
        response_format: { type: 'json_object' }
      });

      // Crear un timeout para la llamada de 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('La solicitud a Genkit expiró después de 10 segundos')), 10000)
      );

      const response = await Promise.race([genkitPromise, timeoutPromise]);

      // Procesar la respuesta
      const parsedResponse = typeof response.content === 'string'
        ? JSON.parse(response.content)
        : response.content;

      // Estructura esperada por el frontend
      return {
        extractedData: parsedResponse.extractedData || {},
        messages: [{
          role: 'assistant',
          content: parsedResponse.responseMessage || "Entendido. ¿Hay algo más que quieras compartir sobre tu historial médico?",
          id: `bot-${Date.now()}`
        }],
        nextTopic: parsedResponse.nextTopic || currentTopic,
        completionStatus: parsedResponse.completionStatus || { currentTopicComplete: false }
      };
    } catch (error) {
      console.error("[App Router API] Error with Genkit, falling back to Vertex AI:", error);
      // Continuará con Vertex AI en caso de error
    }
  }

  // Si Genkit no está disponible o falló, intentamos con Vertex AI
  if (generativeModel) {
    try {
      console.log("[App Router API] Using Vertex AI for conversation analysis");
      // Crear un prompt estructurado para Vertex AI, usando las mismas instrucciones específicas de tema
      const prompt = `
Eres un asistente médico profesional especializado en realizar anamnesis médicas.
Tu objetivo es ayudar a extraer información médica relevante de las respuestas del paciente.

TEMA ACTUAL: ${currentTopic}
${detailedPrompt || ''}

${generateTopicSpecificInstructions(currentTopic, formFields)}

Historial de la conversación:
${previousMessages?.map(msg => `${msg.role === 'assistant' ? 'Asistente' : 'Paciente'}: ${msg.content}`).join('\n') || 'No hay mensajes previos'}

El paciente dice: "${userInput}"

Extrae información médica relevante y responde de manera profesional y empática.
Proporciona tu respuesta en formato JSON con esta estructura exacta:
{
  "extractedData": {
    // Datos médicos extraídos según el tema actual
  },
  "responseMessage": "Tu respuesta natural y empática al paciente",
  "nextTopic": "${currentTopic}", // Mantén el mismo tema o avanza si ya has obtenido suficiente información
  "completionStatus": {
    "currentTopicComplete": true/false // Indica si has obtenido toda la información necesaria para este tema
  }
}

IMPORTANTE:
1. Responde SIEMPRE en español
2. Sé empático pero profesional
3. NO inventes datos médicos que el paciente no haya proporcionado
4. Asegúrate de que tu respuesta sea un JSON válido
`;

      // Llamada a Vertex AI con timeout
      const vertexPromise = generativeModel.generateContent(prompt);

      // Crear un timeout para la llamada de 12 segundos (un poco más que Genkit para darle tiempo al fallback)
      const vertexTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('La solicitud a Vertex AI expiró después de 12 segundos')), 12000)
      );

      const result = await Promise.race([vertexPromise, vertexTimeoutPromise]);
      const response = result.response;
      const textResponse = response.candidates[0]?.content?.parts[0]?.text;      // Verificar que tenemos texto en la respuesta
      if (!textResponse) {
        throw new Error("No se recibió respuesta de texto de Vertex AI");
      }

      // Extraer la parte JSON de la respuesta
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("[App Router API] No se pudo extraer JSON de la respuesta de Vertex AI. Respuesta recibida:", textResponse);
        throw new Error("No se pudo extraer JSON de la respuesta de Vertex AI");
      }

      // Parsear la respuesta JSON con manejo de errores
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);

        // Verificar formato esperado
        if (!parsedResponse.responseMessage) {
          console.warn("[App Router API] Respuesta de Vertex AI sin formato esperado:", parsedResponse);
          parsedResponse.responseMessage = "Entendido. ¿Podría decirme más sobre su situación médica?";
        }
      } catch (parseError) {
        console.error("[App Router API] Error al parsear JSON de Vertex AI:", parseError, "JSON recibido:", jsonMatch[0]);
        throw new Error("El formato de respuesta de Vertex AI no es válido");
      }

      return {
        extractedData: parsedResponse.extractedData || {},
        messages: [{
          role: 'assistant',
          content: parsedResponse.responseMessage || "Entendido. ¿Podría proporcionarme más información?",
          id: `bot-vertex-${Date.now()}`
        }],
        nextTopic: parsedResponse.nextTopic || currentTopic,
        completionStatus: parsedResponse.completionStatus || { currentTopicComplete: false }
      };
    } catch (vertexError) {
      console.error("[App Router API] Error with Vertex AI:", vertexError);
      // Si ambos servicios fallan, usamos la respuesta simulada como fallback
    }
  }
  // Fallback a respuesta simulada si tanto Genkit como Vertex AI fallaron o no están disponibles
  console.log("[App Router API] Both AI services unavailable or failed, using simulated response");
  // Si es el primer mensaje en la conversación, proporcionamos un mensaje de bienvenida especial
  if (!previousMessages || previousMessages.length === 0) {
    // Detectar si es un dispositivo móvil o tiene configuraciones de accesibilidad especiales
    const userAgent = conversationContext.userAgent || '';
    const isSimplifiedExperience = conversationContext.accessibilityPreferences?.simplified || userAgent.includes('Mobile');

    const welcomeMessage = isSimplifiedExperience
      ? "Bienvenido. Por favor indique su nombre completo para iniciar su historia clínica."
      : "Bienvenido a la anamnesis conversacional. Estoy aquí para ayudarle a registrar su historial médico de manera natural. ¿Podría decirme su nombre completo para comenzar?";

    return {
      extractedData: {},
      messages: [{
        role: 'assistant',
        content: welcomeMessage,
        id: `welcome-${Date.now()}`
      }],
      nextTopic: currentTopic || 'datos_personales',
      // Proporcionar información adicional para mostrar una interfaz adecuada
      interfacePreferences: {
        simplified: isSimplifiedExperience,
        voiceEnabled: !!conversationContext.accessibilityPreferences?.voiceEnabled
      }
    };
  }

  // --- Respuesta Simulada como fallback ---
  let extractedData = {};
  let botMessages = [];
  let nextTopic = currentTopic;
  if (currentTopic === 'datos_personales' && userInput) {
    // Lógica simplificada para extraer información básica
    const patterns = {
      nombre: /(?:me llamo|mi nombre es|soy)\s+([a-záéíóúñ\s]+)/i,
      dni: /(?:dni|documento es|identificación es)\s*([\d\w]+)/i,
      fechaNacimiento: /(?:nací el|fecha de nacimiento es|nacimiento)\s*(\d{1,2}[\/\\-\\.]\d{1,2}[\/\\-\\.]\d{2,4})/i
    };

    let tempNombre = null;
    const nameMatch = userInput.match(patterns.nombre);
    if (nameMatch) tempNombre = nameMatch[1].trim();

    let tempDni = null;
    const dniMatch = userInput.match(patterns.dni);
    if (dniMatch) tempDni = dniMatch[1].trim();

    let tempFechaNacimiento = null;
    const birthDateMatch = userInput.match(patterns.fechaNacimiento);
    if (birthDateMatch) tempFechaNacimiento = birthDateMatch[1].trim();

    if (tempNombre) {
      extractedData.datos_personales = { nombre: tempNombre, nombre_completo: tempNombre };
      if (tempDni) extractedData.datos_personales.dni = tempDni;
      if (tempFechaNacimiento) extractedData.datos_personales.fechaNacimiento = tempFechaNacimiento;

      botMessages.push({
        role: 'assistant',
        content: `Gracias ${tempNombre}. ¿Cuál es el motivo de su consulta hoy?`,
        id: `bot-fallback-${Date.now()}`
      });
      nextTopic = 'motivo_consulta';
    } else {
      botMessages.push({
        role: 'assistant',
        content: "Por favor, cuénteme su nombre completo para comenzar con la historia clínica.",
        id: `bot-fallback-${Date.now()}`
      });
    }
  } else {
    // Respuesta genérica para otros temas
    botMessages.push({
      role: 'assistant',
      content: "He registrado su respuesta. ¿Hay algo más que quiera añadir a su historial médico?",
      id: `bot-fallback-${Date.now()}`
    });
  }

  return {
    extractedData,
    messages: botMessages,
    nextTopic,
  };
}

export async function POST(request) {
  console.log("[App Router API] Received POST request to /api/genkit/conversation");

  // Check for AI service availability upfront
  const aiServiceStatus = {
    genkit: !!genkitClient,
    vertexAI: !!generativeModel,
    timestamp: new Date().toISOString()
  };
  console.log("[App Router API] AI Service Status:", JSON.stringify(aiServiceStatus));

  const authorizationHeader = request.headers.get('Authorization'); if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.error("[App Router API] Missing or invalid authorization token");
    return NextResponse.json({ error: 'Authentication required: Invalid or missing token.', code: 'auth/missing-token' }, { status: 401 });
  }
  const token = authorizationHeader.split('Bearer ')[1];

  try {
    // Firebase Admin should already be initialized by our import
    console.log("[App Router API] Firebase Admin instance status:", !!adminAppInstance ? "Available" : "Not available");

    console.log("[App Router API] Verifying ID token...");
    await authAdmin.verifyIdToken(token);
    console.log("[App Router API] ID token verified successfully.");

    const body = await request.json();
    const { conversationContext, patientId } = body;

    if (!conversationContext || !patientId) {
      return NextResponse.json({ error: 'Missing conversationContext or patientId in request body.' }, { status: 400 });
    }

    console.log("[App Router API] Invoking Genkit conversation analysis...");
    const analysisResult = await invokeGenkitConversationAnalysis(conversationContext);
    console.log("[App Router API] Genkit analysis result:", analysisResult);

    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error) {
    console.error('[App Router API] Error in /api/genkit/conversation POST:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Authentication required: Token expired.', code: error.code }, { status: 401 });
    }
    if (error.code && error.code.startsWith('auth/')) {
      return NextResponse.json({ error: `Authentication required: ${error.message}`, code: error.code }, { status: 401 });
    }
    // Verificar si el error es de JSON parsing (cuerpo malformado)
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json({ error: 'Invalid JSON in request body.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error processing conversation analysis.', details: error.message }, { status: 500 });
  }
}
