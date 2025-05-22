'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import LoadingIndicator from '../ui/LoadingIndicator';
import Textarea from '../ui/Textarea';
import { useToast } from '../ui/Toast';

// Mock implementation as a placeholder
const mockAnalyzeAnamnesisData = async ({ patientId, text, context }) => {
  console.log("Mock analyzeAnamnesisData called with:", { patientId, text, context });
  // Wait a bit to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock data
  return {
    insights: {
      keywords: ["simulado", "desarrollo"],
      patientConcerns: ["Ejemplo de preocupación simulada"],
      probableConditions: [],
      riskFactors: []
    },
    summary: "He analizado tu mensaje y actualizado tu historial. Este es un mensaje simulado para desarrollo."
  };
};

const ConversationalAnamnesis = ({ patientId, existingData, onInsightsGenerated }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const addMessage = (sender, text, type = 'text') => {
    setMessages(prev => [...prev, { sender, text, type, timestamp: new Date() }]);
  };

  useEffect(() => {
    addMessage('assistant', 'Hola! Soy tu asistente de anamnesis. ¿Cómo te sientes hoy? ¿Hay algo en particular que te gustaría discutir sobre tu salud?');
    if (existingData && Object.keys(existingData).length > 0) {
      addMessage('assistant', 'He cargado tus datos existentes. Puedes pedirme que los revise o actualice.');
    }
  }, [existingData]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    setIsLoading(true);
    setUserInput('');

    try {
      // Use the mock function for development
      const genkitResponse = await mockAnalyzeAnamnesisData({
        patientId,
        text: userInput,
        context: existingData
      });

      if (genkitResponse && genkitResponse.insights) {
        addMessage('assistant', genkitResponse.summary || 'Aquí tienes un resumen de nuestra conversación y los datos actualizados.');
        onInsightsGenerated(genkitResponse.insights);
        toast.success('Información procesada y actualizada.');
      } else if (genkitResponse && genkitResponse.error) {
        addMessage('assistant', `Hubo un problema al procesar tu solicitud: ${genkitResponse.error}`);
        toast.error(`Error del asistente: ${genkitResponse.error}`);
      }
      else {
        addMessage('assistant', 'No pude extraer información estructurada de eso, pero lo he anotado. ¿Hay algo más que quieras añadir o aclarar?');
      }
    } catch (error) {
      console.error('Error in conversational AI interaction:', error);
      addMessage('assistant', 'Lo siento, tuve un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.');
      toast.error('Error de comunicación con el asistente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to scroll to the bottom of messages
  useEffect(() => {
    const chatView = document.getElementById('chat-view');
    if (chatView) {
      chatView.scrollTop = chatView.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-lg shadow-sm">
      <div id="chat-view" className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <LoadingIndicator message="Procesando..." />
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe cómo te sientes o cualquier síntoma que tengas..."
            className="flex-grow min-h-[80px] rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalAnamnesis;
