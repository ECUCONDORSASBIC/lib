'use client';

import { useToast } from '@/app/contexts/ToastContext';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * ConversationalAnamnesis - A component that presents anamnesis questions in a conversational
 * chat-like interface to reduce cognitive load and form fatigue
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.updateFormData - Function to update form data
 * @param {Array} props.visibleSteps - Array of step objects with form structure
 * @param {number} props.currentStepIndex - Current step index
 * @param {Function} props.onSaveProgress - Function to save progress
 * @param {boolean} props.isSubmitting - Whether the form is being submitted
 * @param {Object} props.patientContext - Context about the patient (age, gender, etc.)
 */
export default function ConversationalAnamnesis({
  formData = {},
  updateFormData,
  visibleSteps = [],
  currentStepIndex = 0,
  onSaveProgress,
  isSubmitting = false,
  patientContext = {}
}) {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [currentSectionProgress, setCurrentSectionProgress] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [lastInputTime, setLastInputTime] = useState(Date.now());
  const messagesEndRef = useRef(null);

  // Check if we need to load a particular section
  const currentStep = visibleSteps[currentStepIndex] || {};

  // Questions for the current section based on the step id
  const getQuestionsForSection = (stepId) => {
    // Dynamic question sets based on the current section
    const questionSets = {
      'datos-personales': [
        { id: 'nombre_completo', text: '¿Cuál es su nombre completo?', required: true },
        { id: 'fecha_nacimiento', text: '¿Cuál es su fecha de nacimiento?', required: true },
        { id: 'edad', text: '¿Cuál es su edad?', required: false },
        {
          id: 'sexo', text: '¿Cuál es su sexo?', required: true,
          options: ['Masculino', 'Femenino', 'Prefiero no decir']
        },
        {
          id: 'estado_civil', text: '¿Cuál es su estado civil?', required: false,
          options: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre']
        },
        { id: 'ocupacion', text: '¿A qué se dedica actualmente?', required: false }
      ],
      'motivo-consulta': [
        { id: 'motivo_principal', text: '¿Cuál es el principal motivo por el que busca atención médica hoy?', required: true },
        { id: 'tiempo_evolucion', text: '¿Hace cuánto tiempo comenzó a notar este problema?', required: false },
        { id: 'sintomas_asociados', text: '¿Presenta otros síntomas relacionados con este problema?', required: false }
      ],
      'historia-enfermedad': [
        { id: 'inicio_evolucion', text: '¿Cómo comenzó esta situación y cómo ha evolucionado hasta ahora?', required: false },
        { id: 'factores_desencadenantes', text: '¿Ha identificado factores que desencadenan o empeoran sus síntomas?', required: false },
        { id: 'tratamientos_previos', text: '¿Ha recibido algún tratamiento previo para esta condición?', required: false },
        { id: 'respuesta_tratamientos', text: 'Si ha recibido tratamientos, ¿cómo respondió a ellos?', required: false }
      ],
      'antecedentes-personales': [
        { id: 'enfermedades', text: '¿Tiene diagnóstico de alguna enfermedad crónica o condición médica importante?', required: false },
        { id: 'cirugias', text: '¿Le han realizado alguna cirugía?', required: false },
        { id: 'alergias', text: '¿Tiene alergias a medicamentos, alimentos u otras sustancias?', required: false },
        { id: 'medicamentos', text: '¿Toma actualmente algún medicamento?', required: false }
      ],
      'antecedentes-gineco': [
        { id: 'menarca', text: '¿A qué edad tuvo su primera menstruación?', required: false },
        { id: 'ciclo_menstrual', text: '¿Cómo es su ciclo menstrual? (regularidad, duración, etc.)', required: false },
        { id: 'gestas', text: '¿Cuántos embarazos ha tenido?', required: false },
        { id: 'partos', text: '¿Cuántos partos vaginales ha tenido?', required: false },
        { id: 'cesareas', text: '¿Cuántas cesáreas ha tenido?', required: false },
        { id: 'abortos', text: '¿Ha tenido algún aborto?', required: false },
        { id: 'metodo_anticonceptivo', text: '¿Utiliza algún método anticonceptivo?', required: false }
      ],
      // Add more sections as needed...
      'antecedentes-familiares': [
        { id: 'diabetes', text: '¿Algún familiar directo (padres, hermanos) tiene diabetes?', required: false },
        { id: 'hipertension', text: '¿Hay antecedentes de hipertensión arterial en su familia cercana?', required: false },
        { id: 'cancer', text: '¿Algún familiar ha sido diagnosticado con cáncer? ¿Qué tipo y parentesco?', required: false },
        { id: 'cardiopatias', text: '¿Existen enfermedades del corazón en su familia?', required: false }
      ],
      'habitos': [
        { id: 'tabaco', text: '¿Fuma o ha fumado? ¿Con qué frecuencia?', required: false },
        { id: 'alcohol', text: '¿Consume bebidas alcohólicas? ¿Con qué frecuencia?', required: false },
        { id: 'actividad_fisica', text: '¿Realiza actividad física? ¿Qué tipo y con qué frecuencia?', required: false },
        { id: 'dieta', text: '¿Cómo describiría sus hábitos alimenticios?', required: false },
        { id: 'sueno', text: '¿Cómo es la calidad de su sueño?', required: false }
      ]
    };

    return questionSets[stepId] || [];
  };

  // When current step changes, load the questions for that step
  useEffect(() => {
    if (currentStep && currentStep.id) {
      initializeSection(currentStep.id);
    }
  }, [currentStep]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Timer for session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize a section with a welcome message and the first question
  const initializeSection = (sectionId) => {
    const questions = getQuestionsForSection(sectionId);
    if (!questions || questions.length === 0) {
      console.error(`No questions found for section: ${sectionId}`);
      return;
    }

    // Get existing answers from formData
    const sectionData = formData[sectionId] || {};
    const alreadyAnswered = Object.keys(sectionData);
    setCompletedQuestions(alreadyAnswered);

    // Welcome message for the section
    const welcomeMessage = getWelcomeMessageForSection(sectionId);

    // Reset messages and start with welcome
    setMessages([{
      type: 'assistant',
      content: welcomeMessage,
      timestamp: Date.now()
    }]);

    // Calculate how many questions are already answered
    const completedCount = alreadyAnswered.length;
    const totalCount = questions.length;
    setCurrentSectionProgress(Math.round((completedCount / totalCount) * 100));

    // Set first unanswered question or first question if none answered
    const nextQuestion = questions.find(q => !alreadyAnswered.includes(q.id)) || questions[0];
    setTimeout(() => {
      addAssistantMessage(nextQuestion.text);
      setCurrentQuestion(nextQuestion);
    }, 500);
  };

  // Get appropriate welcome message based on section and progress
  const getWelcomeMessageForSection = (sectionId) => {
    const sectionTitles = {
      'datos-personales': 'Información Personal',
      'motivo-consulta': 'Motivo de Consulta',
      'historia-enfermedad': 'Historia de la Enfermedad Actual',
      'antecedentes-personales': 'Antecedentes Personales',
      'antecedentes-gineco': 'Antecedentes Gineco-Obstétricos',
      'antecedentes-familiares': 'Antecedentes Familiares',
      'habitos': 'Hábitos y Estilo de Vida'
    };

    const title = sectionTitles[sectionId] || 'Información Médica';
    const progress = formData[sectionId] ? Object.keys(formData[sectionId]).length : 0;

    if (progress > 0) {
      return `Continuemos con la sección "${title}". Ya has completado parte de esta información. Revisemos o completemos lo que falta.`;
    } else {
      return `Ahora vamos a completar la sección "${title}". Responde a las siguientes preguntas con la mayor precisión posible. Puedes escribir "No sé" o "No aplica" si no tienes la información.`;
    }
  };

  // Add a message from the assistant (AI)
  const addAssistantMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        type: 'assistant',
        content: text,
        timestamp: Date.now()
      }
    ]);

    setLastInputTime(Date.now());
  };

  // Add a message from the user
  const addUserMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        content: text,
        timestamp: Date.now()
      }
    ]);

    setLastInputTime(Date.now());
  };

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    const messages = [
      '¡Vas muy bien! Continuemos.',
      '¡Excelente progreso! Sigamos adelante.',
      'Tus respuestas nos ayudan a entender mejor tu situación.',
      'Gracias por tu paciencia, cada respuesta es importante.',
      '¡Continúa así! La información que proporcionas es valiosa.'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Handle user's answer submission
  const handleSubmitAnswer = async () => {
    if (!userInput.trim() || !currentQuestion) return;

    // Add user's response to messages
    addUserMessage(userInput);

    // Update form data with response
    const updatedSectionData = {
      ...formData[currentStep.id],
      [currentQuestion.id]: userInput.trim()
    };

    // Mark question as completed
    setCompletedQuestions(prev => [...prev, currentQuestion.id]);

    // Update section progress
    const questions = getQuestionsForSection(currentStep.id);
    const newCompletedCount = [...completedQuestions, currentQuestion.id].length;
    const totalCount = questions.length;
    const newProgress = Math.round((newCompletedCount / totalCount) * 100);
    setCurrentSectionProgress(newProgress);

    // Show loading indicator briefly
    setIsLoading(true);
    setUserInput('');

    try {
      // Update form data through the parent component
      updateFormData({
        [currentStep.id]: updatedSectionData
      });

      // Wait briefly to simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find next question
      const nextQuestion = questions.find(q =>
        !completedQuestions.includes(q.id) &&
        q.id !== currentQuestion.id
      );

      // If there are more questions, ask the next one
      if (nextQuestion) {
        // Sometimes add a motivational message
        if (newCompletedCount > 2 && newCompletedCount % 2 === 0) {
          addAssistantMessage(getMotivationalMessage());
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Ask the next question
        addAssistantMessage(nextQuestion.text);
        setCurrentQuestion(nextQuestion);
      } else {
        // Section completed
        addAssistantMessage(`¡Perfecto! Has completado la sección "${currentStep.title}". Puedes revisar tus respuestas o continuar con la siguiente sección.`);
        setCurrentQuestion(null);

        // Save progress
        onSaveProgress?.();
      }
    } catch (error) {
      console.error('Error updating form data:', error);
      toast.error('Hubo un problema al guardar tu respuesta. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input submission with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // Format timestamp for messages
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render option buttons if the question has predefined options
  const renderOptions = (question) => {
    if (!question || !question.options) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {question.options.map(option => (
          <button
            key={option}
            onClick={() => {
              setUserInput(option);
              setTimeout(handleSubmitAnswer, 100);
            }}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="p-4 bg-blue-50 rounded-t-lg border border-blue-200 shadow-sm">
        <h3 className="font-medium text-blue-800">{currentStep.title || 'Conversación Médica'}</h3>
        <div className="flex items-center mt-2">
          <div className="flex-1 bg-blue-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 ease-in-out"
              style={{ width: `${currentSectionProgress}%` }}
            />
          </div>
          <span className="ml-2 text-xs text-blue-700 font-medium">{currentSectionProgress}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Show typing indicator when loading */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-none shadow-sm p-3 max-w-[80%]">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Options buttons for multiple choice questions */}
      {currentQuestion && currentQuestion.options && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          {renderOptions(currentQuestion)}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion ? "Escribe tu respuesta..." : "Sección completada"}
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={1}
            disabled={isLoading || !currentQuestion || isSubmitting}
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!userInput.trim() || isLoading || !currentQuestion || isSubmitting}
            className={`px-4 py-2 rounded-r-lg text-white ${userInput.trim() && !isLoading && currentQuestion && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
