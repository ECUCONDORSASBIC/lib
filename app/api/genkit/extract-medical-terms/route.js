import { NextResponse } from 'next/server';
import { getGenkit } from '@/lib/genkit';

/**
 * API para extraer y explicar términos médicos de un texto usando Genkit
 * POST /api/genkit/extract-medical-terms
 */
export async function POST(request) {
  try {
    const genkit = await getGenkit();
    const data = await request.json();
    
    const { text } = data;
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { terms: [], success: true },
        { status: 200 }
      );
    }

    // Crear sistema de prompt para la extracción de términos médicos
    const systemPrompt = `
      Eres un asistente médico especializado en explicar terminología médica.
      Tu tarea es identificar términos médicos técnicos en un texto y proporcionar
      explicaciones claras y accesibles para pacientes sin formación médica.
      
      Debes extraer solo términos médicos relevantes y técnicos, no palabras comunes.
      Para cada término, proporciona una definición simple pero precisa en español.
      
      Formato de respuesta:
      {
        "terms": [
          {
            "term": "Término médico identificado",
            "definition": "Explicación clara y sencilla del término",
            "category": "Categoría médica (diagnóstico, anatomía, procedimiento, etc.)",
            "importance": "alta|media|baja"
          }
        ]
      }
    `;

    // Mensaje de usuario con contexto
    const userPrompt = `
      Por favor, identifica y explica los términos médicos técnicos en el siguiente texto:
      
      "${text}"
      
      Para cada término, proporciona una explicación que sea fácil de entender para un paciente
      sin conocimientos médicos.
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
              terms: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    term: { type: 'string' },
                    definition: { type: 'string' },
                    category: { type: 'string' },
                    importance: { type: 'string', enum: ['alta', 'media', 'baja'] }
                  },
                  required: ['term', 'definition']
                }
              }
            },
            required: ['terms']
          }
        }
      }
    });

    // Extraer y devolver el resultado
    const analysisResult = result?.response?.parts?.[0]?.text;
    let parsedResult = { terms: [] };
    
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
    console.error('Error en extract-medical-terms:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor',
        terms: [],
        success: false
      },
      { status: 500 }
    );
  }
}
