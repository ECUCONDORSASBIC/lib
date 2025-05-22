import { NextResponse } from 'next/server';
import { getGenkit } from '@/lib/genkit';

/**
 * API para analizar respuestas de pacientes durante anamnesis usando Genkit
 * POST /api/genkit/analyze-patient-response
 */
export async function POST(request) {
  try {
    const genkit = await getGenkit();
    const data = await request.json();
    
    const { 
      currentSection, 
      question, 
      patientResponse, 
      patientContext = {},
      previousQuestions = [],
      previousResponses = [],
      existingData = {}
    } = data;
    
    if (!patientResponse || !currentSection) {
      return NextResponse.json(
        { 
          extractedFields: {},
          error: 'Se requiere respuesta del paciente y sección actual'
        },
        { status: 400 }
      );
    }

    // Crear sistema de prompt para el análisis de respuestas
    const systemPrompt = `
      Eres un asistente médico especializado en analizar respuestas de pacientes durante anamnesis.
      Tu tarea es extraer información médica relevante de la respuesta del paciente, 
      identificar términos médicos que puedan necesitar explicación, detectar posibles contradicciones,
      y sugerir preguntas de seguimiento apropiadas.
      
      La sección actual de la anamnesis es: ${currentSection}
      
      Formato de respuesta:
      {
        "extractedFields": {
          "campo1": "valor1",
          "campo2": "valor2",
          ...
        },
        "confidence": "Valor entre 0 y 1 que indica tu nivel de confianza",
        "medicalTerms": [
          {
            "term": "Término médico identificado",
            "definition": "Explicación clara y sencilla del término",
            "importance": "alta|media|baja"
          }
        ],
        "suggestedFollowUps": [
          "Pregunta de seguimiento 1",
          "Pregunta de seguimiento 2"
        ],
        "contradictions": [
          {
            "description": "Descripción de la contradicción",
            "previousValue": "Valor anterior contradictorio",
            "currentValue": "Valor actual contradictorio",
            "importance": "alta|media|baja"
          }
        ],
        "suggestedResponses": [
          "Respuesta sugerida 1",
          "Respuesta sugerida 2"
        ]
      }
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
      Analiza esta respuesta del paciente a la siguiente pregunta:
      
      Pregunta: "${question}"
      Respuesta: "${patientResponse}"
      
      Contexto del paciente:
      - Edad: ${patientContext?.age || 'No especificada'}
      - Género: ${patientContext?.gender || 'No especificado'}
      - Condiciones médicas conocidas: ${patientContext?.medicalConditions || 'Ninguna reportada'}
      
      Historial de conversación previa:
      ${conversationContext.map(c => `
        - Pregunta: "${c.question}"
        - Respuesta: "${c.response}"
      `).join('\n')}
      
      Datos previamente recopilados:
      ${Object.entries(existingData || {}).map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      }).join('\n')}
      
      Extrae información médica relevante, detecta términos médicos que puedan necesitar explicación,
      identifica posibles contradicciones con respuestas anteriores, y sugiere preguntas de seguimiento.
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
              extractedFields: {
                type: 'object',
                additionalProperties: { type: 'string' }
              },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              medicalTerms: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    term: { type: 'string' },
                    definition: { type: 'string' },
                    importance: { type: 'string', enum: ['alta', 'media', 'baja'] }
                  }
                }
              },
              suggestedFollowUps: { type: 'array', items: { type: 'string' } },
              contradictions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    previousValue: { type: 'string' },
                    currentValue: { type: 'string' },
                    importance: { type: 'string', enum: ['alta', 'media', 'baja'] }
                  }
                }
              },
              suggestedResponses: { type: 'array', items: { type: 'string' } }
            },
            required: ['extractedFields', 'confidence']
          }
        }
      }
    });

    // Extraer y devolver el resultado
    const analysisResult = result?.response?.parts?.[0]?.text;
    let parsedResult = { 
      extractedFields: {}, 
      confidence: 0, 
      medicalTerms: [], 
      suggestedFollowUps: [],
      contradictions: [],
      suggestedResponses: []
    };
    
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
    console.error('Error en analyze-patient-response:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        extractedFields: {},
        success: false
      },
      { status: 500 }
    );
  }
}
