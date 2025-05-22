/**
 * Conversational Anamnesis API - Alternative Implementation
 *
 * This API route handles the conversational medical history taking feature
 * using a multi-layered AI approach without relying on the problematic Genkit dependency:
 *
 * 1. Primary: Google Generative AI (Gemini) for medical conversation analysis
 * 2. Fallback: Rule-based simulated responses
 *
 * The API extracts structured medical data from patient conversations,
 * enabling a natural dialogue-based medical history taking experience.
 */

import { NextResponse } from 'next/server';
// Import for Firebase Admin
import { adminAppInstance, authAdmin } from '@/lib/firebase/firebaseAdmin';
// Import for Google AI
import { saveAnamnesisData } from '@/app/services/anamnesisService';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI client if API key is available
let googleAI;
try {
  if (process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY) {
    googleAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY
    );
    console.log("[Alternative API] Google Generative AI initialized successfully");
  }
} catch (error) {
  console.error("[Alternative API] Google AI Initialization error:", error);
}

// Helper function to generate topic-specific instructions for better medical extraction
function generateTopicSpecificInstructions(topic, formFields) {
  let instructions = "";
  switch (topic) {
    case "datos-personales": instructions = `
        OBJETIVO: Recopilar y confirmar los datos personales básicos del paciente.
        PREGUNTAS AGRUPADAS: Inicia solicitando el nombre completo, número de documento de identidad (DNI/cédula/pasaporte), fecha de nacimiento y género. Hazlo en una sola pregunta o en un flujo conversacional muy corto y agrupado.
        Ejemplo de inicio: "Para comenzar, como parte de Altamedica 2.0, necesito verificar algunos datos. Por favor, indíqueme su nombre completo, su número de documento de identidad, su fecha de nacimiento y su género."
        CONFIRMACIÓN OBLIGATORIA: Una vez que tengas todos estos datos (nombre completo, DNI, fecha de nacimiento, género), DEBES resumirlos y pedir confirmación explícita al paciente ANTES de considerar este tema como completo.
        Ejemplo de confirmación: "Muy bien. Para asegurar la precisión de su expediente en Altamedica 2.0, he registrado: Nombre: [Nombre Completo], Documento: [Número de Documento], Fecha de Nacimiento: [Fecha], Género: [Género]. ¿Es toda la información correcta?"
        Si el paciente confirma, entonces currentTopicComplete puede ser true y puedes proceder a 'motivo-consulta'.
        Si el paciente necesita corregir algo, mantén currentTopicComplete en false, actualiza la información en extractedData y vuelve a confirmar amablemente.

        CAMPOS A EXTRAER (en extractedData.datos_personales):
        - nombreCompleto (string) - USAR EXACTAMENTE ESTE NOMBRE DE CAMPO para actualizar perfil del paciente
        - documentoIdentidad (string) - USAR EXACTAMENTE ESTE NOMBRE DE CAMPO para actualizar perfil del paciente
        - fechaNacimiento (string, formato YYYY-MM-DD si es posible, o como lo provea el usuario) - USAR EXACTAMENTE ESTE NOMBRE DE CAMPO para actualizar perfil del paciente
        - genero (string: Masculino, Femenino, Otro, Prefiero no decirlo) - USAR EXACTAMENTE ESTE NOMBRE DE CAMPO para actualizar perfil del paciente
        - email (string, opcional): correo electrónico del paciente - USAR EXACTAMENTE ESTE NOMBRE DE CAMPO para actualizar perfil del paciente
        - telefono (string, opcional): número telefónico del paciente - USAR EXACTAMENTE ESTE NOMBRE DE CAMPO para actualizar perfil del paciente

        IMPORTANTE: Estos campos se usarán para actualizar automáticamente el perfil del paciente en el dashboard, por lo que es crucial usar exactamente estos nombres de campos y extraerlos correctamente.

        FORMATO DE DATOS A DEVOLVER:
        extractedData: {
          "datos_personales": {
            "nombreCompleto": "Nombre completo del paciente",
            "documentoIdentidad": "12345678X",
            "fechaNacimiento": "YYYY-MM-DD",
            "genero": "Masculino/Femenino/Otro"
          }
        }
      `;
      break;
    case "motivo-consulta":
      instructions = `
        OBJETIVO: Comprender la razón principal por la que el paciente busca atención médica en Altamedica 2.0.
        PREGUNTAS CLAVE:
        - "Excelente. Ahora, ¿cuál es el motivo principal de su consulta con Altamedica 2.0 hoy?"
        - "¿Podría describirme los síntomas que está experimentando?"
        - "¿Cuándo comenzaron estos síntomas?"
        - "¿Hay algo que mejore o empeore sus síntomas?"
        - "¿Ha experimentado estos síntomas antes?"
        PROFUNDIZAR: Si la respuesta es vaga (ej: "me siento mal"), pide detalles específicos con profesionalismo.
        CAMPOS A EXTRAER (en extractedData):
        - motivoPrincipal (string)
        - sintomas (string)
        - inicioSintomas (string)
        - factoresAgravantesAliviantes (string)
        - historiaPreviaSintomas (string)
      `;
      break;
    case "sintomas-principales":
      instructions = `Extrae información detallada sobre los síntomas: localización,
    intensidad (en escala 1-10 si aplica), duración, características (constante/intermitente),
    factores que lo agravan o alivian.`;
      break;
    case "historia-enfermedad":
      instructions = `Documenta la evolución cronológica de la enfermedad actual,
    tratamientos previos y su efectividad, y resultados de exámenes anteriores si se mencionan.`;
      break;
    case "antecedentes-personales":
      instructions = `Registra enfermedades previas, cirugías, hospitalizaciones,
    alergias, medicación actual y hábitos (tabaco, alcohol, drogas, alimentación, ejercicio).`;
      break;
    case "antecedentes-familiares":
      instructions = `Identifica enfermedades hereditarias o condiciones presentes
    en familiares de primer grado (padres, hermanos, hijos), especialmente diabetes, hipertensión,
    cáncer y enfermedades cardiovasculares.`;
      break;
    case "revision-sistemas":
      instructions = `Revisa sistemáticamente cada aparato/sistema del cuerpo.
    Para cada sistema mencionado por el paciente, extrae síntomas presentes o ausentes.`;
      break;
    default:
      instructions = `Extrae información médica relevante relacionada con el tema "${topic}".`;
  }

  // Add form fields if available
  let formFieldsInstructions = '';
  if (formFields && Object.keys(formFields).length > 0) {
    formFieldsInstructions = `\nPara este tema, debes extraer específicamente los siguientes campos:\n${JSON.stringify(formFields, null, 2)}`;
  }

  return `${instructions}${formFieldsInstructions}\n\nExtrae SOLO los datos mencionados por el paciente, no inventes información.`;
}

// Primary function to process conversation using Google AI directly
async function processConversationWithGoogleAI(conversationContext) {
  console.log("[Alternative API] processConversationWithGoogleAI - Received context:", JSON.stringify(conversationContext, null, 2));

  const { userInput, currentTopic, detailedPrompt, anamnesisData, previousMessages } = conversationContext;
  const formFields = conversationContext.formFields || {};

  // Primero intentamos con Google AI si está disponible
  if (googleAI) {
    try {
      console.log("[Alternative API] Using Google AI for conversation analysis");

      // Get the generative model
      const model = googleAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Preparar el contexto conversacional para el modelo con instrucciones específicas para medicina
      const systemInstructionContent = `Eres un asistente médico virtual de Altamedica 2.0, una plataforma de vanguardia. Tu rol es realizar una anamnesis (historia clínica) conversacional.
Este es un proceso médico serio. La información que recopiles será revisada por doctores.
Respuestas no serias, bromas o intentos de engañar al sistema pueden resultar en cargos adicionales o la suspensión de tu acceso a la plataforma.
Aunque soy avanzado, no puedo reemplazar a un doctor humano, ya que no puedo realizar exámenes físicos ni ofrecer diagnósticos definitivos.

ROL Y TONO:
- Actúa como un profesional de la salud altamente capacitado, orgulloso de representar a Altamedica 2.0, y paciente.
- Usa un lenguaje claro, preciso y comprensible para el paciente.
- Sé empático y muestra comprensión, especialmente si el paciente expresa preocupación o malestar. Mantén siempre un tono formal y respetuoso.

PROCESO GENERAL DE CONVERSACIÓN POR TEMA:
1.  Estás en un TEMA ACTUAL: ${currentTopic}.
2.  Tus INSTRUCCIONES DETALLADAS para este tema son: ${detailedPrompt || 'Extrae información médica relevante según el tema.'}
3.  Sigue las directrices específicas proporcionadas en ${generateTopicSpecificInstructions(currentTopic, formFields)} para guiar la conversación y qué datos extraer.
4.  RECOLECCIÓN DE DATOS: Para el TEMA ACTUAL, asegúrate de preguntar por todos los campos o aspectos indicados en sus instrucciones. Si el paciente da información incompleta, haz preguntas de seguimiento específicas para obtener los detalles faltantes. Agrupa las preguntas cuando sea natural y eficiente (ej. solicitar nombre completo, DNI y fecha de nacimiento juntos).
5.  CONFIRMACIÓN (Especialmente para 'datos-personales'): Al finalizar la recolección de datos para el tema 'datos-personales', resume la información obtenida (nombre completo, DNI, fecha de nacimiento, género) y pide confirmación explícita al paciente antes de marcar el tema como completo. Por ejemplo: "Muy bien. He registrado: Nombre: [Nombre], DNI: [DNI], Fecha de Nacimiento: [Fecha], Género: [Género]. ¿Es toda la información correcta?".
6.  TRANSICIÓN DE TEMA: Solo cuando hayas recopilado toda la información necesaria para el TEMA ACTUAL (y confirmado, si aplica), o si el paciente indica explícitamente que no tiene más información para ese tema, debes considerar \"currentTopicComplete\": true. El campo \"nextTopic\" en tu respuesta JSON puede sugerir el siguiente tema lógico o mantener el actual si no está completo.
7.  RESPUESTAS DEL PACIENTE: Escucha atentamente. Si el paciente se desvía del tema, redirígelo amablemente pero con firmeza para completar la información necesaria para el TEMA ACTUAL. Si el paciente hace preguntas (ej: \"¿y mi DNI?\"), respóndelas de forma concisa y profesional, y luego retoma la recolección de datos.
8.  VARIEDAD EN RESPUESTAS: Evita la monotonía. En lugar de repetir \"He registrado su respuesta\", usa alternativas como \"Entendido.\", \"Gracias, lo he anotado.\", \"Perfecto, procedamos.\", \"Comprendo.\", \"Información registrada.\", etc., manteniendo siempre un tono profesional.

FORMATO DE RESPUESTA JSON OBLIGATORIO:
Tu respuesta SIEMPRE debe ser un objeto JSON válido con la siguiente estructura:
{
  "extractedData": {
    // Si estamos en el tema 'datos-personales', usa exactamente estos nombres de campo:
    "datos_personales": {
      "nombreCompleto": "Nombre completo del paciente", // Para actualizar el perfil del paciente
      "documentoIdentidad": "12345678X", // Para actualizar el perfil del paciente
      "fechaNacimiento": "YYYY-MM-DD", // Para actualizar el perfil del paciente
      "genero": "Masculino/Femenino/Otro" // Para actualizar el perfil del paciente
    },
    // Para otros temas, usa el formato apropiado según las instrucciones específicas
    // El nombre del tema debe ser la clave principal, como "motivo-consulta", "antecedentes-personales", etc.
  },
  "responseMessage": "Tu respuesta conversacional, natural y empática al paciente. Esta es la frase que el paciente leerá/escuchará.",
  "nextTopic": "${currentTopic}", // Mantén el mismo tema si no está completo, o indica el siguiente tema lógico si el actual se completó.
  "completionStatus": {
    "currentTopicComplete": true/false // true si has obtenido toda la información necesaria para este tema, false en caso contrario.
  }
}

EJEMPLO DE INTERACCIÓN PARA 'datos-personales':
Asistente (responseMessage): "Hola, soy su asistente médico virtual. Para comenzar, ¿podría decirme su nombre completo?"
Paciente (userInput): "Soy Ana."
Asistente (responseMessage): "Hola Ana, ¿podría darme sus apellidos también, por favor?" (extractedData se actualiza, currentTopicComplete: false)
Paciente (userInput): "Ana Pérez."
Asistente (responseMessage): "Gracias Ana Pérez. Ahora, ¿cuál es su número de documento de identidad?" (extractedData se actualiza, currentTopicComplete: false)
... y así sucesivamente hasta completar todos los campos de 'datos-personales'.
Al final de 'datos-personales':
Asistente (responseMessage): "Muy bien, [Nombre del Paciente]. He registrado: Nombre: [Nombre Completo], Documento de Identidad: [Número de Documento], Fecha de Nacimiento: [Fecha de Nacimiento], Género: [Género]. ¿Es toda la información correcta?"
Si [Nombre del Paciente] confirma: (currentTopicComplete: true, nextTopic: 'motivo-consulta')
Si [Nombre del Paciente] corrige: (currentTopicComplete: false, se actualiza extractedData y se continúa hasta corregir)

¡IMPORTANTE!: Sigue rigurosamente las instrucciones para el TEMA ACTUAL. No te adelantes a otros temas si el actual no está completo. Tu profesionalismo y la calidad de la información recopilada son cruciales.
¡MUY IMPORTANTE!: Usa EXACTAMENTE los nombres de campo especificados para extractedData, especialmente para 'datos-personales', ya que estos se utilizan para actualizar automáticamente el perfil del paciente en el sistema.`;

      // Build the chat history, ensuring it starts with 'user' and alternates.
      let chatHistory = [];
      if (previousMessages && previousMessages.length > 0) {
        let historyStartIndex = 0;
        // Find the first user message to start the history
        while (historyStartIndex < previousMessages.length && previousMessages[historyStartIndex].role === 'assistant') {
          historyStartIndex++;
        }

        if (historyStartIndex < previousMessages.length) {
          // Ensure the first message is 'user'
          chatHistory.push({
            role: 'user',
            parts: [{ text: previousMessages[historyStartIndex].content }]
          });

          // Add subsequent messages, alternating roles
          let expectedRole = 'model';
          for (let i = historyStartIndex + 1; i < previousMessages.length; i++) {
            const msg = previousMessages[i];
            if (msg.role === 'assistant' && expectedRole === 'model') {
              chatHistory.push({ role: 'model', parts: [{ text: msg.content }] });
              expectedRole = 'user';
            } else if (msg.role === 'user' && expectedRole === 'user') {
              chatHistory.push({ role: 'user', parts: [{ text: msg.content }] });
              expectedRole = 'model';
            }
            // Skip messages that break the alternating pattern or are redundant
          }
        }
      }

      // The full prompt for the current turn will be a combination of system instructions and user input.
      const currentUserMessageParts = [
        { text: systemInstructionContent + "\n\nPATIENT INPUT: " + userInput }
      ];

      // Start the chat
      const chat = model.startChat({
        history: chatHistory, // chatHistory is now validated or empty
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.2,
          topP: 0.8,
          responseMimeType: "application/json",
        },
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('La solicitud a Google AI expiró después de 15 segundos')), 15000)
      );

      // Send the current "user" message (which includes our detailed system prompt + actual user input)
      const responsePromise = chat.sendMessage(currentUserMessageParts);
      const result = await Promise.race([responsePromise, timeoutPromise]);

      // Extract the content
      const responseText = result.response.text();
      if (!responseText) {
        throw new Error("No se recibió respuesta de texto de Google AI");
      }

      // Parse the JSON response
      try {
        // Extraer la parte JSON de la respuesta
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn("[Alternative API] No se pudo extraer JSON de Google AI. Respuesta recibida:", responseText);
          throw new Error("No se pudo extraer JSON de Google AI");
        }

        // Parse the JSON
        const parsedResponse = JSON.parse(jsonMatch[0]);

        // Check required fields
        if (!parsedResponse.responseMessage) {
          console.warn("[Alternative API] Respuesta de Google AI sin formato esperado:", parsedResponse);
          parsedResponse.responseMessage = "Entendido. ¿Podría decirme más sobre su situación médica?";
        }      // Format and validate extractedData before returning
        let extractedData = parsedResponse.extractedData || {};

        // Ensure datos_personales fields are properly structured for profile updates
        if (extractedData.datos_personales) {
          console.log("[Alternative API] Validating datos_personales fields for profile update compatibility");

          // Make sure field names exactly match what updatePatientProfile expects
          const personalData = extractedData.datos_personales;

          // Log the extracted personal data for debugging
          console.log("[Alternative API] Personal data extracted:", JSON.stringify(personalData, null, 2));
        }

        // Return the expected format
        return {
          extractedData: extractedData,
          messages: [{
            role: 'assistant',
            content: parsedResponse.responseMessage,
            id: `bot-gemini-${Date.now()}`
          }],
          nextTopic: parsedResponse.nextTopic || currentTopic,
          completionStatus: parsedResponse.completionStatus || { currentTopicComplete: false }
        };
      } catch (parseError) {
        console.error("[Alternative API] Error parsing JSON:", parseError, "Text received:", responseText);
        throw new Error("El formato de respuesta no es válido");
      }
    } catch (error) {
      console.error("[Alternative API] Error with Google AI:", error);
      // If Google AI fails, use the fallback response
    }
  }

  // --- Respuesta Simulada como fallback ---
  console.log("[Alternative API] AI service unavailable or failed, using simulated response");

  // Si es el primer mensaje en la conversación, proporcionamos un mensaje de bienvenida especial
  if (!previousMessages || previousMessages.length === 0) {
    // Detectar si es un dispositivo móvil o tiene configuraciones de accesibilidad especiales
    const userAgent = conversationContext.userAgent || '';
    const isSimplifiedExperience = conversationContext.accessibilityPreferences?.simplified || userAgent.includes('Mobile');

    const welcomeMessage = isSimplifiedExperience
      ? "Bienvenido. Por favor indique su nombre completo, edad, fecha de nascimiento,documento y genero  para iniciar su historia clínica."
      : "Bienvenido a la anamnesis conversacional. Estoy aquí para ayudarle a registrar su historial médico de manera natural. ¿Podría decirme su datos completo para comenzar?";

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

  // --- Simple pattern matching fallback ---
  let extractedData = {};
  let botMessages = [];
  let nextTopic = currentTopic;
  if (currentTopic === 'datos-personales' && userInput) {
    // Lógica simplificada para extraer información básica
    const patterns = {
      nombre: /(?:me llamo|mi nombre es|soy)\s+([a-záéíóúñ\s]+)/i,
      dni: /(?:dni|documento es|identificación es)\s*([\d\w]+)/i,
      fechaNacimiento: /(?:nací el|fecha de nacimiento es|nacimiento)\s*(\d{1,2}[\/\\-\\.]\d{1,2}[\/\\-\\.]\d{2,4})/i
    };

    // Check previous messages to see if we were explicitly asking for the name
    const askingForName = previousMessages && previousMessages.some(msg =>
      msg.role === 'assistant' &&
      (msg.content.includes('nombre completo') ||
        msg.content.includes('decirme su nombre') ||
        msg.content.includes('¿Cuál es su nombre?'))
    );

    let tempNombre = null;

    // First try with existing patterns
    const nameMatch = userInput.match(patterns.nombre);
    if (nameMatch) {
      tempNombre = nameMatch[1].trim();
    }
    // If we were asking for name and no match yet, treat the entire input as a name
    else if (askingForName) {
      // Simple heuristic: if input is likely a name (2-3 words, first letter of each capitalized)
      const words = userInput.split(' ').filter(word => word.trim().length > 0);
      if (words.length >= 1 && words.length <= 4) {
        tempNombre = userInput.trim();
      }
    }

    let tempDni = null;
    const dniMatch = userInput.match(patterns.dni);
    if (dniMatch) tempDni = dniMatch[1].trim();

    let tempFechaNacimiento = null;
    const birthDateMatch = userInput.match(patterns.fechaNacimiento);
    if (birthDateMatch) tempFechaNacimiento = birthDateMatch[1].trim(); if (tempNombre) {
      extractedData.datos_personales = { nombre: tempNombre, nombre_completo: tempNombre };
      if (tempDni) extractedData.datos_personales.dni = tempDni;
      if (tempFechaNacimiento) extractedData.datos_personales.fecha_nacimiento = tempFechaNacimiento;

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
  console.log("[Alternative API] Received POST request to /api/genkit/conversation-alt");

  // Check for AI service availability upfront
  const aiServiceStatus = {
    googleAI: !!googleAI,
    timestamp: new Date().toISOString()
  };
  console.log("[Alternative API] AI Service Status:", JSON.stringify(aiServiceStatus));

  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.error("[Alternative API] Missing or invalid authorization token");
    return NextResponse.json({ error: 'Authentication required: Invalid or missing token.', code: 'auth/missing-token' }, { status: 401 });
  }
  const token = authorizationHeader.split('Bearer ')[1];

  try {
    // Firebase Admin should already be initialized by our import
    console.log("[Alternative API] Firebase Admin instance status:", !!adminAppInstance ? "Available" : "Not available");

    console.log("[Alternative API] Verifying ID token...");
    const decodedToken = await authAdmin.verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log("[Alternative API] ID token verified successfully for user:", userId);

    const body = await request.json();
    const { conversationContext, patientId } = body;

    if (!conversationContext || !patientId) {
      return NextResponse.json({ error: 'Missing conversationContext or patientId in request body.' }, { status: 400 });
    }

    console.log("[Alternative API] Processing conversation...");
    const analysisResult = await processConversationWithGoogleAI(conversationContext);
    console.log("[Alternative API] Analysis result:", JSON.stringify(analysisResult, null, 2));

    // Save the extracted data to Firestore
    if (analysisResult.extractedData && Object.keys(analysisResult.extractedData).length > 0) {
      try {
        console.log("[Alternative API] Saving extracted anamnesis data to Firestore for patient:", patientId);
        await saveAnamnesisData(patientId, analysisResult.extractedData, { uid: userId });
        console.log("[Alternative API] Anamnesis data saved successfully for patient:", patientId);        // Check if we've extracted datos_personales specifically and update the patient profile              // Verificar si hay datos personales para actualizar el perfil
        // Comprobación más robusta para evitar errores si los objetos no existen
        const hasPersonalData = analysisResult.extractedData.datos_personales &&
          typeof analysisResult.extractedData.datos_personales === 'object' &&
          Object.keys(analysisResult.extractedData.datos_personales).length > 0;

        // Also check for datos-personales (with hyphen) format
        const hasHyphenatedPersonalData = analysisResult.extractedData['datos-personales'] &&
          typeof analysisResult.extractedData['datos-personales'] === 'object' &&
          Object.keys(analysisResult.extractedData['datos-personales']).length > 0;

        if (hasPersonalData || hasHyphenatedPersonalData) {
          try {
            console.log("[Alternative API] Detected personal data, explicitly updating patient profile");

            // Log the personal data fields found
            if (hasPersonalData) {
              console.log("[Alternative API] Personal data (datos_personales):",
                JSON.stringify(analysisResult.extractedData.datos_personales, null, 2));
            }

            if (hasHyphenatedPersonalData) {
              console.log("[Alternative API] Personal data (datos-personales):",
                JSON.stringify(analysisResult.extractedData['datos-personales'], null, 2));
            }

            // Importar el servicio de actualización de perfil
            const { updatePatientProfile } = await import('@/app/services/anamnesisService');

            // Verificar que la información esté estructurada adecuadamente
            let dataToUpdate = { ...analysisResult.extractedData };

            // Si no hay datos_personales pero sí hay datos-personales, reorganizar
            if (!hasPersonalData && hasHyphenatedPersonalData) {
              dataToUpdate.datos_personales = dataToUpdate['datos-personales'];
            }

            // Intentar actualizar el perfil con los datos extraídos
            const profileUpdated = await updatePatientProfile(patientId, dataToUpdate); if (profileUpdated) {
              console.log("[Alternative API] Patient profile successfully updated with conversational data");

              // Si no hay mensajes, crear el array
              if (!analysisResult.messages) {
                analysisResult.messages = [];
              }
              // Solo añadir mensaje del sistema si no hay ya muchos mensajes
              if (analysisResult.messages.length < 2) {
                analysisResult.messages.push({
                  role: 'system',
                  content: 'Su perfil ha sido actualizado con la información proporcionada.',
                  id: `profile-update-${Date.now()}`
                });
              }
            } else {
              console.warn("[Alternative API] Failed to update patient profile or no relevant data to update");
            }
          } catch (profileError) {
            console.error("[Alternative API] Error updating patient profile:", profileError);
            // Continue processing even if profile update fails
          }
        }
      } catch (dbError) {
        console.error("[Alternative API] Error saving anamnesis data:", dbError);
        // Continue processing the response even if saving fails, but log the error
      }
    } else {
      console.log("[Alternative API] No data extracted to save for patient:", patientId);
    }

    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error) {
    console.error('[Alternative API] Error in /api/genkit/conversation-alt POST:', error);
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
