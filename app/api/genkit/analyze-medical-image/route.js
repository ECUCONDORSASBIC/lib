import { NextResponse } from 'next/server';
import { getGenkit } from '@/lib/genkit';

/**
 * API para analizar imágenes médicas usando Vertex AI Vision a través de Genkit
 * POST /api/genkit/analyze-medical-image
 */
export async function POST(request) {
  try {
    const genkit = await getGenkit();
    const data = await request.json();
    
    const { imageUrl, patientContext, currentSection, symptoms, previousDiagnoses } = data;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Se requiere URL de imagen para análisis' },
        { status: 400 }
      );
    }

    // Crear sistema de prompt para el análisis de imagen
    const systemPrompt = `
      Eres un asistente médico especializado en analizar imágenes médicas.
      Tu tarea es analizar la imagen proporcionada y extraer información médica relevante.
      Utiliza tu conocimiento médico para identificar posibles condiciones o hallazgos en la imagen.
      Basa tu análisis en el contexto del paciente y los síntomas proporcionados.
      
      Formato de respuesta:
      {
        "findings": "Descripción detallada de los hallazgos visibles en la imagen",
        "relevance": "Relevancia clínica de los hallazgos en el contexto del paciente",
        "suggestions": "Recomendaciones o sugerencias basadas en los hallazgos",
        "detectedConditions": ["Posible condición 1", "Posible condición 2"],
        "confidence": "Valor entre 0 y 1 que indica tu nivel de confianza"
      }
    `;

    // Crear mensaje de usuario con contexto
    const userPrompt = `
      Por favor, analiza esta imagen médica.
      
      Contexto del paciente:
      - Edad: ${patientContext?.age || 'No especificada'}
      - Género: ${patientContext?.gender || 'No especificado'}
      - Sección actual: ${currentSection || 'Evidencia visual'}
      
      Síntomas reportados:
      ${symptoms && symptoms.length > 0 
        ? symptoms.map(s => `- ${s}`).join('\n') 
        : '- No se han reportado síntomas específicos'}
      
      Diagnósticos previos:
      ${previousDiagnoses && previousDiagnoses.length > 0 
        ? previousDiagnoses.map(d => `- ${d}`).join('\n') 
        : '- No hay diagnósticos previos registrados'}
      
      Imagen: ${imageUrl}
    `;

    // Generar análisis con Genkit
    const result = await genkit.generateContent({
      model: 'gemini-pro-vision',
      contents: [
        {
          role: 'system',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'user',
          parts: [
            { text: userPrompt },
            { imageUrl: { url: imageUrl } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        responseStructure: {
          schema: {
            type: 'object',
            properties: {
              findings: { type: 'string' },
              relevance: { type: 'string' },
              suggestions: { type: 'string' },
              detectedConditions: { type: 'array', items: { type: 'string' } },
              confidence: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['findings', 'relevance', 'suggestions']
          }
        }
      }
    });

    // Extraer y devolver el resultado
    const analysisResult = result?.response?.parts?.[0]?.text;
    let parsedResult = {};
    
    try {
      parsedResult = typeof analysisResult === 'string' 
        ? JSON.parse(analysisResult) 
        : analysisResult;
    } catch (error) {
      console.error('Error al parsear resultado:', error);
      return NextResponse.json(
        { 
          findings: "No se pudo analizar la imagen correctamente. Por favor, consulte con un profesional médico.",
          error: "Error al procesar la respuesta" 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(parsedResult, { status: 200 });
  } catch (error) {
    console.error('Error en analyze-medical-image:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
