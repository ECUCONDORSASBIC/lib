import { NextResponse } from 'next/server';
import { getGenkit } from '@/lib/genkit';

/**
 * API para detectar contradicciones en respuestas de anamnesis usando Genkit
 * POST /api/genkit/detect-contradictions
 */
export async function POST(request) {
  try {
    const genkit = await getGenkit();
    const data = await request.json();
    
    const { previousResponses, currentResponse, previousQuestions, formData } = data;
    
    if (!currentResponse) {
      return NextResponse.json(
        { contradictions: [], success: true },
        { status: 200 }
      );
    }

    // Crear sistema de prompt para la detección de contradicciones
    const systemPrompt = `
      Eres un asistente médico especializado en anamnesis. Tu tarea es analizar las respuestas
      de un paciente y detectar posibles contradicciones o inconsistencias en la información proporcionada.
      
      Debes analizar cuidadosamente la respuesta actual del paciente en comparación con sus respuestas anteriores
      y los datos ya recopilados. Detecta cualquier información contradictoria o inconsistente que pueda
      afectar el diagnóstico o tratamiento.
      
      Formato de respuesta:
      {
        "contradictions": [
          {
            "description": "Descripción clara de la contradicción detectada",
            "previousValue": "Valor o respuesta anterior contradictoria",
            "currentValue": "Valor o respuesta actual contradictoria",
            "importance": "alta|media|baja",
            "field": "Nombre del campo relacionado"
          }
        ],
        "suggestedClarifications": ["Sugerencia 1 para resolver la contradicción", "Sugerencia 2"],
        "confidence": "Valor entre 0 y 1 que indica tu nivel de confianza"
      }
      
      Si no hay contradicciones, devuelve un array vacío.
    `;

    // Preparar contexto de la conversación
    const conversationContext = [];
    
    for (let i = 0; i < Math.min(previousQuestions.length, previousResponses.length); i++) {
      conversationContext.push({
        question: previousQuestions[i],
        response: previousResponses[i]
      });
    }
    
    // Mensaje de usuario con contexto
    const userPrompt = `
      Por favor, analiza esta respuesta del paciente y detecta posibles contradicciones:
      
      Respuesta actual: "${currentResponse}"
      
      Historial de conversación previa:
      ${conversationContext.map(c => `
        - Pregunta: "${c.question}"
        - Respuesta: "${c.response}"
      `).join('\n')}
      
      Datos previamente recopilados:
      ${Object.entries(formData || {}).map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      }).join('\n')}
    `;

    // Generar análisis con Genkit
    const result = await genkit.generateContent({
      model: 'gemini-pro',
      contents: [
        {
          role: 'system',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseStructure: {
          schema: {
            type: 'object',
            properties: {
              contradictions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    previousValue: { type: 'string' },
                    currentValue: { type: 'string' },
                    importance: { type: 'string', enum: ['alta', 'media', 'baja'] },
                    field: { type: 'string' }
                  }
                }
              },
              suggestedClarifications: { type: 'array', items: { type: 'string' } },
              confidence: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['contradictions']
          }
        }
      }
    });

    // Extraer y devolver el resultado
    const analysisResult = result?.response?.parts?.[0]?.text;
    let parsedResult = { contradictions: [], suggestedClarifications: [], confidence: 0 };
    
    try {
      if (typeof analysisResult === 'string') {
        parsedResult = JSON.parse(analysisResult);
      } else if (analysisResult) {
        parsedResult = analysisResult;
      }
    } catch (error) {
      console.error('Error al parsear resultado:', error);
    }

    return NextResponse.json({
      ...parsedResult,
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error en detect-contradictions:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        contradictions: [],
        success: false
      },
      { status: 500 }
    );
  }
}
