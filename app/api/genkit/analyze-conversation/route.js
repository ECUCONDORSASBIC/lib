import { authAdmin } from '@/lib/firebase/firebaseAdmin';
import { VertexAI } from '@google-cloud/vertexai';
import { NextResponse } from 'next/server';

// Configurar la conexión a Vertex AI
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const vertex = new VertexAI({ project: projectId, location });
const model = 'gemini-1.5-pro-preview-0409';

export async function POST(request) {
  try {
    // Verificar autenticación
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No se proporcionó un token de autenticación' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1]; try {
      await authAdmin.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return NextResponse.json({ error: 'Token inválido o vencido' }, { status: 401 });
    }

    // Obtener datos de la consulta
    const { context, patientId } = await request.json();

    if (!context || !patientId) {
      return NextResponse.json({ error: 'Se requiere contexto de conversación y ID del paciente' }, { status: 400 });
    }

    // Formatear el historial de conversación para la consulta a Vertex AI
    const conversationHistory = context.previousMessages?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    // Crear un sistema prompt para guiar la conversación
    const systemPrompt = `Eres un asistente médico virtual de Altamedica diseñado para realizar una anamnesis médica completa.
    Tu objetivo es obtener información médica relevante del paciente siguiendo un flujo de temas estructurado.

    Tema actual: ${context.currentTopic}

    Instrucciones:
    1. Responde como un médico profesional, empático y claro.
    2. Extrae información médica relevante de las respuestas del usuario.
    3. Si el usuario dice "no" a una pregunta sobre medicamentos, alergias, etc., registra esto como información negativa.
    4. Cuando hayas completado un tema, avanza al siguiente de forma natural.
    5. Mantén tus respuestas concisas y profesionales.
    6. Asegúrate de verificar información contradictoria o poco clara.
    7. No inventes información médica sobre el paciente.

    Formato de respuesta: Debes responder en formato JSON con la siguiente estructura:
    {
      "messages": [
        {"content": "Tu respuesta al paciente"}
      ],
      "extractedData": {
        // Información médica extraída, como:
        "tomaMedicamentos": false,
        "alergias": ["penicilina", "polen"]
      },
      "nextTopic": "El siguiente tema a tratar (ej: 'alergias', 'antecedentes_personales', etc.)"
    }`;

    // Invocar Vertex AI para analizar la conversación y generar respuesta
    const generativeModel = vertex.preview.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const chat = generativeModel.startChat({
      history: conversationHistory,
      systemInstruction: systemPrompt,
    });

    // Mensaje actual del usuario
    const userInput = context.userInput;

    const result = await chat.sendMessage(`Respuesta del paciente: ${userInput}`);
    const responseText = result.response.text();

    // Parsear la respuesta JSON de Vertex AI
    let parsedResponse;
    try {
      // Extraer solo la parte JSON de la respuesta
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```([\s\S]*?)```/) ||
        responseText.match(/({[\s\S]*})/);

      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      parsedResponse = JSON.parse(jsonString);

      // Asegurar que tiene la estructura correcta
      if (!parsedResponse.messages || !Array.isArray(parsedResponse.messages)) {
        parsedResponse.messages = [{ content: "Lo siento, no pude entender correctamente. ¿Podría aclarar su respuesta?" }];
      }

      // Asegurar que extractedData es un objeto
      if (!parsedResponse.extractedData) {
        parsedResponse.extractedData = {};
      }

    } catch (parseError) {
      console.error('Error al parsear respuesta del modelo:', parseError);
      console.log('Texto recibido:', responseText);

      // Fallback a una respuesta predeterminada
      parsedResponse = {
        messages: [{
          content: "Gracias por su respuesta. ¿Hay algo más que desee añadir sobre este tema?"
        }],
        extractedData: {},
        nextTopic: context.currentTopic // Mantener el tema actual
      };
    }

    // Convertir al formato esperado por el frontend
    const response = {
      messages: parsedResponse.messages,
      extractedData: parsedResponse.extractedData,
      nextTopic: parsedResponse.nextTopic || context.currentTopic
    };

    // Responder con los datos procesados
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error en la ruta de análisis de conversación:", error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 });
  }
}
