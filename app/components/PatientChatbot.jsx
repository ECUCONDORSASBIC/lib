import { AcademicCapIcon, ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';

const PatientChatbot = ({ patientData }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hola, soy tu asistente médico virtual. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Sugerencias dinámicas basadas en el perfil del paciente
  const suggestions = useMemo(() => {
    const baseSuggestions = [
      '¿Qué significan mis últimos resultados de laboratorio?',
      '¿Cuándo debo contactar a mi médico urgentemente?',
      '¿Cómo tomar correctamente mi medicación?',
      'Consejos sobre dieta y ejercicio general'
    ];

    if (patientData?.nextAppointment) {
      baseSuggestions.unshift(`¿Cómo me preparo para mi cita del ${patientData.nextAppointment}?`);
    }

    if (patientData?.medications?.length > 0) {
      baseSuggestions.push(`Recordatorios para ${patientData.medications[0].name}`);
    }

    // Limitar a 5 sugerencias para no saturar la UI
    return baseSuggestions.slice(0, 5);
  }, [patientData]);

  // Scroll al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función simulada de envío al modelo de IA (en producción, usaría una API real)
  const handleSendToAI = async (userMessage) => {
    setLoading(true);

    // Simular respuesta demorada (reemplazar por API real)
    setTimeout(() => {
      // Respuestas predefinidas basadas en palabras clave (en producción, usaría IA real)
      let response;
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('medicación') || lowerMessage.includes('medicina')) {
        response = `Basado en tu historial, ${patientData?.firstName || 'paciente'}, debes tomar tu medicación según lo indicado por tu médico. Recuerda tomar ${patientData?.medications?.[0]?.name || 'tu medicación'} cada ${patientData?.medications?.[0]?.frequency || '8'} horas con alimentos.`;
      }
      else if (lowerMessage.includes('estudio') || lowerMessage.includes('preparar')) {
        response = 'Para prepararte para tu próximo estudio, recuerda: ayuno de 8 horas, llevar tus estudios previos, y estar con ropa cómoda. Tu médico proporcionó instrucciones específicas en tu última cita.';
      }
      else if (lowerMessage.includes('resultado') || lowerMessage.includes('laboratorio')) {
        response = 'Tus últimos resultados de laboratorio están dentro de los rangos normales. Tu nivel de glucosa ha mejorado respecto al estudio anterior. Tu médico los revisará en detalle en tu próxima consulta.';
      }
      else if (lowerMessage.includes('urgente') || lowerMessage.includes('emergencia')) {
        response = 'Debes contactar a tu médico urgentemente si presentas: dolor intenso, fiebre alta persistente, dificultad para respirar, o cualquier síntoma que consideres grave. El número de emergencia está en tu tarjeta de paciente.';
      }
      else if (lowerMessage.includes('dieta') || lowerMessage.includes('ejercicio')) { // Nueva condición
        response = 'Mantener una dieta balanceada y realizar ejercicio regularmente es crucial para tu salud. ¿Te gustaría información específica sobre dietas para tu condición o rutinas de ejercicio recomendadas?';
      }
      else {
        response = `Gracias por tu pregunta. Basado en tu historial médico, te recomendaría consultar con tu Dr. ${patientData?.doctor || 'López'} en tu próxima cita del ${patientData?.nextAppointment || '22 de mayo'}. ¿Hay algo específico que te preocupe?`;
      }

      setMessages(prev => [...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
      ]);
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    handleSendToAI(input);
    setInput('');
    setShowSuggestions(false);
  };

  const handleSuggestion = (suggestion) => {
    handleSendToAI(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white bg-blue-600 rounded-t-lg">
        <div className="flex items-center">
          <AcademicCapIcon className="w-5 h-5 mr-2" />
          <h2 className="font-medium">Asistente Médico Virtual</h2>
        </div>
        <div className="px-2 py-1 text-xs bg-blue-700 rounded">Especializado</div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'user' ? (
              <div className="max-w-[75%] rounded-lg px-4 py-2 bg-blue-500 text-white rounded-br-none">
                <p className="text-sm">{message.content}</p>
              </div>
            ) : (
              <div className="max-w-[75%] rounded-lg px-4 py-2 bg-gray-100 text-gray-800 rounded-bl-none">
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-lg px-4 py-3 bg-gray-100">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-4 pb-2">
          <p className="mb-2 text-xs text-gray-500">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestion(suggestion)}
                className="px-3 py-1 text-xs text-gray-700 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta médica..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            className="absolute right-1 top-1 rounded-full p-1.5 bg-blue-500 text-white disabled:bg-gray-300"
            disabled={loading || input.trim() === ''}
          >
            {loading ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-center text-gray-500">
          Este asistente está entrenado con tu historial clínico personal
          <br />
          <span className="text-blue-500 cursor-pointer hover:underline">
            Ver política de privacidad
          </span>
        </p>
      </form>
    </div>
  );
};

export default PatientChatbot;
