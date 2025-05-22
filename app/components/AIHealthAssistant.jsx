import { ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

// Helper function to determine proactive suggestions
const getProactiveSuggestion = (healthMetrics, patientName) => {
  if (!healthMetrics) return null;

  const bpValue = healthMetrics.bloodPressure?.value;
  if (bpValue) {
    const [systolic, diastolic] = bpValue.split('/').map(Number);
    if (systolic >= 140 || diastolic >= 90) {
      return {
        id: 'bp_high',
        text: `He notado que tu presión arterial registrada es de ${bpValue}. ¿Te gustaría ver algunos consejos para controlarla o contactar a tu médico?`,
        options: [
          { text: "Ver consejos", action: "show_bp_tips" },
          { text: "Contactar médico", action: "contact_doctor_bp" }
        ]
      };
    }
  }

  if (healthMetrics.glucose?.value) {
    const glucose = parseFloat(healthMetrics.glucose.value);
    if (glucose >= 126) { // Umbral para glucosa en ayunas elevada
      return {
        id: 'glucose_high',
        text: `Tu nivel de glucosa es ${glucose} mg/dL, lo cual podría estar por encima del rango normal. ¿Quieres saber más?`,
        options: [
          { text: "Consejos", action: "show_glucose_tips" },
          { text: "Consultar", action: "contact_doctor_glucose" }
        ]
      };
    }
  }

  if (healthMetrics.cholesterol?.value) {
    const cholesterol = parseFloat(healthMetrics.cholesterol.value);
    if (cholesterol >= 200) {
      return {
        id: 'cholesterol_high',
        text: `Tu colesterol total es ${cholesterol} mg/dL. Esto está ligeramente elevado. ¿Quieres recibir recomendaciones?`,
        options: [
          { text: "Dieta recomendada", action: "show_cholesterol_diet" },
          { text: "Más información", action: "show_cholesterol_info" }
        ]
      };
    }
  }

  // New BMI Check
  if (healthMetrics.bmi?.value) {
    const bmi = parseFloat(healthMetrics.bmi.value);
    if (bmi >= 25 && bmi < 30) { // Overweight
      return {
        id: 'bmi_overweight',
        text: `Tu IMC es ${bmi}, lo que indica sobrepeso. ¿Te gustaría recibir consejos sobre manejo de peso?`,
        options: [
          { text: "Consejos de dieta", action: "show_bmi_diet_tips" },
          { text: "Rutinas de ejercicio", action: "show_bmi_exercise_tips" }
        ]
      };
    } else if (bmi >= 30) { // Obese
      return {
        id: 'bmi_obese',
        text: `Tu IMC es ${bmi}, lo que indica obesidad. Es importante abordar esto para tu salud general. ¿Quisieras discutir estrategias?`,
        options: [
          { text: "Hablar con un nutricionista", action: "contact_nutritionist_bmi" },
          { text: "Programas de pérdida de peso", action: "info_weight_loss_programs" }
        ]
      };
    }
  }

  return null;
};

const AIHealthAssistant = ({ patientName, healthMetrics }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveSuggestion, setProactiveSuggestion] = useState(null);

  useEffect(() => {
    // Mensaje de bienvenida inicial
    setMessages([{
      id: Date.now(),
      text: `Hola ${patientName || 'paciente'}, soy tu asistente de salud IA. ¿En qué puedo ayudarte hoy?`,
      sender: 'ai'
    }]);

    // Verificar métricas para sugerencias proactivas
    const suggestion = getProactiveSuggestion(healthMetrics, patientName);
    if (suggestion) {
      setProactiveSuggestion(suggestion);
    }

  }, [patientName, healthMetrics]);

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim() && !proactiveSuggestion) return;

    const userMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProactiveSuggestion(null); // Limpiar sugerencia proactiva una vez que se interactúa

    // Simulación de respuesta de la IA
    setTimeout(() => {
      let aiResponseText = "Gracias por tu mensaje. Estoy procesando tu solicitud...";
      if (messageText.toLowerCase().includes("hola") || messageText.toLowerCase().includes("buenos dias")) {
        aiResponseText = `¡Hola ${patientName || ''}! ¿Cómo puedo asistirte hoy?`;
      } else if (messageText.toLowerCase().includes("presion arterial")) {
        aiResponseText = "Claro, puedo ayudarte con eso. ¿Qué te gustaría saber sobre tu presión arterial?";
      } else if (messageText.toLowerCase().includes("dieta")) {
        aiResponseText = "Puedo ofrecerte información general sobre dietas saludables. ¿Tienes alguna condición específica en mente?";
      } else {
        aiResponseText = "Entendido. Estoy buscando información relevante para ti...";
      }

      // Simular una respuesta más larga después de un momento
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponseText, sender: 'ai' }]);
        setIsLoading(false);
      }, 1500);
    }, 500);
  };

  const handleProactiveOptionClick = (option) => {
    // Simular acción basada en la opción seleccionada
    let responseText = "";
    if (option.action === "show_bp_tips") {
      responseText = "Aquí tienes algunos consejos para controlar la presión arterial: 1. Reduce el consumo de sal. 2. Realiza actividad física regularmente. 3. Mantén un peso saludable. 4. Limita el consumo de alcohol. 5. Gestiona el estrés. ¿Necesitas más detalles sobre alguno de estos puntos?";
    } else if (option.action === "contact_doctor_bp") {
      responseText = "Entendido. Te recomiendo que te pongas en contacto con tu médico para discutir tu presión arterial. ¿Puedo ayudarte a encontrar su información de contacto o a programar una cita?";
    } else if (option.action === "show_glucose_tips") {
      responseText = "Consejos para controlar tus niveles de glucosa: 1. Limita los carbohidratos refinados. 2. Aumenta tu actividad física. 3. Mantén un horario regular de comidas. 4. Prioriza alimentos con bajo índice glucémico. 5. Mantén un registro diario de tus niveles. ¿Quieres más información sobre algún punto específico?";
    } else if (option.action === "show_cholesterol_diet") {
      responseText = "Recomendaciones dietéticas para controlar el colesterol: 1. Aumenta el consumo de fibra soluble (avena, legumbres). 2. Incorpora ácidos grasos omega-3 (pescados, nueces). 3. Limita las grasas saturadas y trans. 4. Consume más frutas y verduras. 5. Considera añadir esteroles vegetales a tu dieta. ¿Te gustaría un plan alimenticio más detallado?";
    } else if (option.action === "show_bmi_diet_tips") {
      responseText = "Consejos de dieta para el manejo del peso: 1. Prioriza alimentos integrales y minimamente procesados. 2. Controla las porciones. 3. Asegura una ingesta adecuada de proteínas y fibra. 4. Limita azúcares añadidos y bebidas azucaradas. 5. Hidrátate bien. ¿Te gustaría un plan de ejemplo?";
    } else if (option.action === "show_bmi_exercise_tips") {
      responseText = "Rutinas de ejercicio recomendadas: 1. Intenta al menos 150 minutos de actividad aeróbica moderada por semana (caminar rápido, nadar). 2. Incluye ejercicios de fortalecimiento muscular 2 días por semana. 3. Encuentra actividades que disfrutes para mantener la constancia. ¿Quieres ejemplos específicos?";
    } else if (option.action === "contact_nutritionist_bmi") {
      responseText = "Excelente decisión. Un nutricionista puede ofrecerte un plan personalizado. ¿Te gustaría que te ayude a buscar un profesional en tu área o te proporcione recursos para encontrar uno?";
    } else if (option.action === "info_weight_loss_programs") {
      responseText = "Existen diversos programas de pérdida de peso que combinan dieta, ejercicio y apoyo conductual. Algunos pueden estar cubiertos por tu seguro. Te recomiendo investigar opciones locales o programas en línea reconocidos. ¿Necesitas ayuda para buscar?";
    }

    const userMessage = { id: Date.now(), text: `He seleccionado: "${option.text}"`, sender: 'user' };
    const aiMessage = { id: Date.now() + 1, text: responseText, sender: 'ai' };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setProactiveSuggestion(null); // Limpiar sugerencia
  };


  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-md">
      <div className="flex items-center p-4 text-white rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-700">
        <SparklesIcon className="w-6 h-6 mr-2" />
        <h3 className="text-lg font-semibold">Asistente de Salud IA</h3>
      </div>

      <div className="flex-grow p-4 space-y-3 overflow-y-auto scrolling-touch">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'user' ? (
              <div
                className="max-w-xs px-4 py-2 rounded-xl lg:max-w-md bg-blue-500 text-white rounded-br-none"
              >
                {msg.text}
              </div>
            ) : (
              <div
                className="max-w-xs px-4 py-2 rounded-xl lg:max-w-md bg-gray-100 text-gray-800 rounded-bl-none"
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 bg-gray-100 rounded-bl-none rounded-xl">
              <div className="flex items-center space-x-1 text-sm">
                <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-600 animate-pulse" />
                <span className="text-white">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        {proactiveSuggestion && !isLoading && (
          <div className="p-3 my-3 border-l-4 border-indigo-500 rounded-r-lg bg-indigo-50">
            <p className="mb-2 text-sm text-gray-800">{proactiveSuggestion.text}</p>
            <div className="flex flex-wrap gap-2">
              {proactiveSuggestion.options.map(opt => (
                <button
                  key={opt.action}
                  onClick={() => handleProactiveOptionClick(opt)}
                  className="px-3 py-1 text-sm text-indigo-700 transition bg-indigo-100 rounded-full hover:bg-indigo-200"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 rounded-b-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu consulta aquí..."
            className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
