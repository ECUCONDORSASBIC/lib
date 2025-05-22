'use client';

import { app, db } from '@/lib/firebase';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getGenerativeModel, getVertexAI } from "firebase/vertexai";
import { useEffect, useMemo, useState } from 'react';

const GeminiTrainer = () => {
  const [trainingPrompt, setTrainingPrompt] = useState('');
  const [trainingResponse, setTrainingResponse] = useState('');
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedExamples, setSavedExamples] = useState([]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');  // Inicializar el modelo Gemini (similar a WelcomeSection)
  const model = useMemo(() => {
    if (!app) {
      console.error("Firebase app is not initialized.");
      return null;
    }
    try {
      const vertexAI = getVertexAI(app);
      return getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });
    } catch (error) {
      console.error("Error initializing Vertex AI model:", error);
      return null;
    }
  }, []);

  // Ejemplos preguardados para entrenamiento
  const trainingExamples = useMemo(() => [
    {
      conversation: [
        { role: "user", content: "¡Hola! ¿En qué puedo ayudarte hoy? 😊" },
        { role: "assistant", content: "realice algunos examenes sabes de los resultados?" },
        { role: "user", content: "Como modelo de lenguaje, no tengo acceso a información personal identificable, incluyendo resultados de exámenes médicos. **No sé qué exámenes te has realizado ni sus resultados.** Para conocer los resultados de tus exámenes, debes: 1. **Contactar al médico o centro de salud** donde te realizaste los exámenes. Ellos son los únicos autorizados para proporcionarte esa información. 2. **Consultar el portal del paciente (si lo tienen)**. Muchos centros de salud tienen portales en línea donde puedes acceder a tus resultados. 3. **Programar una cita con tu médico** para discutir los resultados y su significado. Es **crucial** obtener los resultados directamente de una fuente autorizada y discutirlo con un profesional de la salud. No intentes auto-diagnosticarte ni interpretar los resultados por tu cuenta, ya que podría llevarte a conclusiones incorrectas y generar ansiedad innecesaria." }
      ],
      label: "Privacidad de datos médicos"
    },
    {
      conversation: [
        { role: "user", content: "utilice altamedica" },
        { role: "assistant", content: "Para poder ayudarte de la mejor manera con \"Altamedica\", necesito saber qué necesitas hacer exactamente. Altamedica es una organización grande que ofrece muchos servicios. Por favor, dime: * **¿Qué necesitas hacer con Altamedica?** Por ejemplo: * ¿Necesitas encontrar un médico? * ¿Necesitas programar una cita? * ¿Necesitas información sobre seguros? * ¿Necesitas encontrar una clínica cercana? * ¿Necesitas ayuda para pagar tu factura? * ¿Necesitas saber qué servicios ofrecen? * ¿Necesitas contactarlos por teléfono o correo electrónico? * **¿Ya eres paciente de Altamedica?** * **¿Qué tipo de información necesitas?** Cuanto más detalles me des, mejor podré ayudarte." }
      ],
      label: "Solicitud de contexto para Altamedica"
    },
    // Añadir el resto de ejemplos proporcionados
  ], []);

  useEffect(() => {
    // Cargar ejemplos previamente guardados desde Firestore
    const fetchSavedExamples = async () => {
      try {
        const q = query(
          collection(db, "trainingExamples"),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const examples = [];
        querySnapshot.forEach((doc) => {
          examples.push({ id: doc.id, ...doc.data() });
        });

        setSavedExamples(examples);
      } catch (error) {
        console.error("Error al cargar ejemplos guardados:", error);
      }
    };

    fetchSavedExamples();
  }, []);  const handleSubmitTrainingPrompt = async (e) => {
    e.preventDefault();
    if (!trainingPrompt.trim() || !model) return;

    setIsLoading(true);

    try {
      // Generamos respuesta con el modelo
      const result = await model.generateContent(trainingPrompt);
      const response = result.response;
      const text = response.text();

      setTrainingResponse(text || "No se pudo obtener una respuesta.");

      // Actualizamos el historial de conversación
      setConversationHistory([
        ...conversationHistory,
        { role: 'user', content: trainingPrompt },
        { role: 'assistant', content: text || "No se pudo obtener una respuesta." }
      ]);

      // Activamos el modo de feedback
      setFeedbackMode(true);
      setTrainingPrompt('');
    } catch (error) {
      console.error('Error al generar contenido con Vertex AI:', error);
      setTrainingResponse("Lo siento, ocurrió un error al procesar tu solicitud.");
    } finally {
      setIsLoading(false);
    }
  };  const handleSaveExample = async (wasGoodResponse) => {
    if (conversationHistory.length < 2) return;

    try {
      // Guardamos el ejemplo en Firestore
      await addDoc(collection(db, "trainingExamples"), {
        conversation: conversationHistory,
        isGoodExample: wasGoodResponse,
        feedback: feedbackMessage,
        createdAt: serverTimestamp()
      });

      setFeedbackMessage('');
      setFeedbackMessage(`Ejemplo ${wasGoodResponse ? 'positivo' : 'negativo'} guardado correctamente`);

      setTimeout(() => {
        setFeedbackMode(false);
        setFeedbackMessage('');
        setConversationHistory([]);
      }, 2000);

    } catch (error) {
      console.error("Error al guardar ejemplo:", error);
      setFeedbackMessage("Error al guardar el ejemplo. Inténtalo de nuevo.");
    }
  };

  const loadNextPresetExample = () => {
    const nextIndex = (currentExampleIndex + 1) % trainingExamples.length;
    setCurrentExampleIndex(nextIndex);
  };

  const useCurrentExample = () => {
    const currentExample = trainingExamples[currentExampleIndex];
    setConversationHistory(currentExample.conversation);
    setFeedbackMode(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Entrenamiento de Asistente Virtual - Gemini</h2>
        <p className="text-gray-600">Ayuda a mejorar las respuestas del asistente proporcionando ejemplos y feedback</p>
      </div>

      {!feedbackMode ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Ejemplos Preparados</h3>
            <div className="bg-white border rounded-md p-3">
              <p className="text-sm font-medium mb-2">Ejemplo {currentExampleIndex + 1}/{trainingExamples.length}: {trainingExamples[currentExampleIndex].label}</p>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {trainingExamples[currentExampleIndex].conversation.map((msg, idx) => (
                  <div key={idx} className={`p-2 rounded-md text-sm ${msg.role === 'user' ? 'bg-gray-100' : 'bg-blue-50'}`}>
                    <span className="font-medium">{msg.role === 'user' ? 'Usuario: ' : 'Asistente: '}</span>
                    {msg.content.length > 100 ? `${msg.content.substring(0, 100)}...` : msg.content}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={loadNextPresetExample}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md transition-colors"
                >
                  Siguiente ejemplo
                </button>
                <button
                  onClick={useCurrentExample}
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Usar este ejemplo
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="trainingPrompt" className="block text-sm font-medium text-gray-700">
              Nueva instrucción para entrenar
            </label>
            <form onSubmit={handleSubmitTrainingPrompt} className="flex space-x-2">
              <textarea
                id="trainingPrompt"
                value={trainingPrompt}
                onChange={(e) => setTrainingPrompt(e.target.value)}
                placeholder="Escribe una instrucción o pregunta para entrenar al asistente..."
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px] resize-y"
                disabled={isLoading || !model}
              />
              <button
                type="submit"
                className="self-end bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50"
                disabled={isLoading || !trainingPrompt.trim() || !model}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando
                  </span>
                ) : "Enviar para entrenamiento"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Conversación para entrenar</h3>
            <div className="border rounded-md p-4 bg-gray-50 space-y-3 max-h-80 overflow-y-auto">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 border-blue-200' : 'bg-green-100 border-green-200'
                    } border`}
                >
                  <p className="font-medium mb-1">{msg.role === 'user' ? 'Usuario:' : 'Asistente:'}</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium text-gray-800 mb-3">Evaluar respuesta del asistente</h3>
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios (opcional)
              </label>
              <textarea
                id="feedback"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="¿Qué estuvo bien o mal en esta respuesta? ¿Cómo se podría mejorar?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSaveExample(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Buena respuesta
              </button>
              <button
                onClick={() => handleSaveExample(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Necesita mejora
              </button>
            </div>
            <button
              onClick={() => {
                setFeedbackMode(false);
                setConversationHistory([]);
              }}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            {feedbackMessage && (
              <div className={`mt-3 p-3 rounded-md ${feedbackMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {feedbackMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {savedExamples.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Ejemplos guardados recientemente</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {savedExamples.map((example) => (
                  <tr key={example.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {example.createdAt?.toDate().toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${example.isGoodExample ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {example.isGoodExample ? 'Positivo' : 'Necesita mejora'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {example.conversation[0]?.content || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {example.feedback || 'Sin feedback'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiTrainer;
