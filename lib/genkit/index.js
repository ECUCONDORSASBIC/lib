/**
 * Librería de utilidades para interactuar con Genkit y Vertex AI
 * Proporciona funciones para inicializar, gestionar modelos y formatear solicitudes
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Clase singleton para acceder a Genkit
let genkitInstance = null;

/**
 * Inicializa y devuelve una instancia de Genkit
 * @returns {Object} Instancia de Genkit con métodos para interactuar con Vertex AI
 */
export async function getGenkit() {
  if (genkitInstance) {
    return genkitInstance;
  }

  try {
    // Verificar si estamos en el servidor
    if (typeof window !== 'undefined') {
      throw new Error('Genkit solo puede inicializarse en el servidor');
    }

    // Obtener la API key de las variables de entorno
    const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_GENERATIVE_AI_KEY;
    
    if (!apiKey) {
      throw new Error('No se encontró la clave de API para Genkit en las variables de entorno');
    }

    // Inicializar el cliente de Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // Crear una instancia con métodos útiles
    genkitInstance = {
      // Método para generar contenido con modelos de texto
      generateContent: async ({ model = 'gemini-pro', contents, generationConfig = {} }) => {
        const modelInstance = genAI.getGenerativeModel({
          model,
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
            ...generationConfig
          }
        });

        return await modelInstance.generateContent(contents);
      },

      // Método para analizar imágenes
      analyzeImage: async (imageFile, options = {}) => {
        try {
          // Si recibimos un archivo, convertirlo a base64
          let imageData;
          if (imageFile instanceof Blob || imageFile instanceof File) {
            imageData = await fileToGenerativePart(imageFile);
          } else if (typeof imageFile === 'string' && imageFile.startsWith('data:')) {
            // Ya es un data URI
            imageData = {
              inlineData: {
                data: imageFile.split(',')[1],
                mimeType: imageFile.split(',')[0].split(':')[1].split(';')[0]
              }
            };
          } else if (typeof imageFile === 'string') {
            // Es una URL
            imageData = { imageUrl: { url: imageFile } };
          } else {
            throw new Error('Formato de imagen no válido');
          }

          const prompt = options.prompt || 'Analiza esta imagen médica y describe lo que ves.';
          
          const modelInstance = genAI.getGenerativeModel({
            model: 'gemini-pro-vision',
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
              ...options.generationConfig
            }
          });

          const result = await modelInstance.generateContent([
            { text: prompt },
            imageData
          ]);

          return result.response.text();
        } catch (error) {
          console.error('Error al analizar imagen con Genkit:', error);
          throw error;
        }
      },

      // Método para analizar conversaciones y detectar contradicciones
      analyzeConversation: async (messages, options = {}) => {
        try {
          const prompt = `
            Analiza esta conversación y detecta posibles contradicciones, términos médicos
            importantes, y extrae información médica relevante.

            ${options.additionalInstructions || ''}
          `;

          const formattedMessages = messages.map(msg => ({
            role: msg.role || (msg.isUser ? 'user' : 'model'),
            parts: [{ text: msg.content || msg.text }]
          }));

          const modelInstance = genAI.getGenerativeModel({
            model: 'gemini-pro',
            generationConfig: {
              temperature: 0.1,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
              ...options.generationConfig
            }
          });

          const result = await modelInstance.generateContent([
            { role: 'user', parts: [{ text: prompt }] },
            ...formattedMessages
          ]);

          return result.response.text();
        } catch (error) {
          console.error('Error al analizar conversación con Genkit:', error);
          throw error;
        }
      },

      // Permite saber si la instancia está procesando
      isProcessing: false
    };

    return genkitInstance;
  } catch (error) {
    console.error('Error al inicializar Genkit:', error);
    throw error;
  }
}

/**
 * Convierte un archivo a formato compatible con Generative AI
 * @param {File|Blob} file - Archivo a convertir
 * @returns {Promise<Object>} Parte de imagen compatible con la API
 */
async function fileToGenerativePart(file) {
  const base64EncodedData = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type
    }
  };
}

/**
 * Formatea una solicitud de análisis para Genkit
 * @param {Object} data - Datos a formatear
 * @returns {Object} Datos formateados para la API
 */
export function formatAnalysisRequest(data) {
  // Eliminar campos nulos o indefinidos
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
