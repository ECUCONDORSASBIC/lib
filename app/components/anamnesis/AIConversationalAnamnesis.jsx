'use client';

import { useGenkit } from '@/app/contexts/GenkitContext';
import { useToast } from '@/app/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { generateSmartQuestion, analyzePatientResponse } from '@/app/services/aiAnamnesisService';

/**
 * AIConversationalAnamnesis - Un componente mejorado que presenta anamnesis con IA
 * usando un formato conversacional impulsado por modelos de lenguaje avanzados
 *
 * @param {Object} props
 * @param {Object} props.formData - Datos actuales del formulario
 * @param {Function} props.updateFormData - Función para actualizar datos del formulario
 * @param {Array} props.visibleSteps - Pasos visibles del formulario
 * @param {number} props.currentStepIndex - Índice del paso actual
 * @param {Function} props.onSaveProgress - Función para guardar progreso
 * @param {boolean} props.isSubmitting - Si se está enviando el formulario
 * @param {Object} props.patientContext - Contexto del paciente (edad, género, etc.)
 * @param {string} props.patientId - ID del paciente
 */
export default function AIConversationalAnamnesis({
  formData = {},
  updateFormData,
  visibleSteps = [],
  currentStepIndex = 0,
  onSaveProgress,
  isSubmitting = false,
  patientContext = {},
  patientId = ''
}) {
  const toast = useToast();
  const { analyzeConversation, isProcessing: isAiProcessing } = useGenkit();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedFields, setCompletedFields] = useState({});
  const [currentSectionProgress, setCurrentSectionProgress] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [lastInputTime, setLastInputTime] = useState(Date.now());
  const [isAITyping, setIsAITyping] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [previousResponses, setPreviousResponses] = useState([]);
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [aiTypingText, setAiTypingText] = useState('');
  const [typingInterval, setTypingInterval] = useState(null);
  const messagesEndRef = useRef(null);

  // Obtener el paso/sección actual
  const currentStep = visibleSteps[currentStepIndex] || {};
  const currentSectionId = currentStep?.id || '';

  // Convertir patientContext a formato esperado por la API
  const formattedPatientContext = {
    age: patientContext.age || calculateAgeFromBirthdate(formData.fecha_nacimiento || formData['datos-personales']?.fecha_nacimiento),
    gender: patientContext.gender || formData.sexo || formData['datos-personales']?.sexo,
    medicalConditions: patientContext.medicalConditions || ''
  };

  // Función para calcular edad desde fecha de nacimiento
  function calculateAgeFromBirthdate(birthdateStr) {
    if (!birthdateStr) return '';
    
    try {
      const birthdate = new Date(birthdateStr);
      if (isNaN(birthdate.getTime())) return '';
      
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      
      return age.toString();
    } catch (error) {
      console.error('Error calculando edad:', error);
      return '';
    }
  }

  // Efecto para inicializar el chat al cambiar de sección
  useEffect(() => {
    if (currentSectionId) {
      initializeAIChat(currentSectionId);
    }
  }, [currentSectionId]);

  // Auto-scroll al final del chat cuando llegan nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Timer para la duración de la sesión
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Limpiar el intervalo de tipeo al desmontar
  useEffect(() => {
    return () => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [typingInterval]);

  // Inicializar el chat con IA para la sección actual
  const initializeAIChat = async (sectionId) => {
    // Verificar si ya hay datos para esta sección
    const sectionData = formData[sectionId] || {};
    const existingSectionFields = Object.keys(sectionData);
    
    setCompletedFields(prev => ({
      ...prev,
      [sectionId]: new Set(existingSectionFields)
    }));

    // Mensaje de bienvenida específico para la sección
    const welcomeMessage = getWelcomeMessageForSection(sectionId);
    
    // Resetear mensajes anteriores
    setMessages([{
      type: 'assistant',
      content: welcomeMessage,
      timestamp: Date.now(),
      isSpecial: true
    }]);
    
    setPreviousQuestions([]);
    setPreviousResponses([]);
    
    // Calcular progreso actual
    calculateSectionProgress(sectionId, existingSectionFields);
    
    // Generar la primera pregunta automáticamente
    await generateNextAIQuestion(sectionId);
  };

  // Calcular el progreso de la sección actual
  const calculateSectionProgress = (sectionId, completedFieldsList) => {
    // Estimar el total de campos esperados por sección
    const expectedFieldCounts = {
      'datos-personales': 10,
      'motivo-consulta': 5,
      'historia-enfermedad': 8,
      'antecedentes-personales': 12,
      'antecedentes-gineco': 10,
      'antecedentes-familiares': 8,
      'habitos': 8,
      'revision-sistemas': 15,
      'pruebas-previas': 5,
      'salud-mental': 6,
      'percepcion-paciente': 5
    };
    
    const totalExpected = expectedFieldCounts[sectionId] || 10;
    const completedCount = completedFieldsList?.length || 0;
    const progressPercentage = Math.min(Math.round((completedCount / totalExpected) * 100), 100);
    
    setCurrentSectionProgress(progressPercentage);
  };

  // Mensaje de bienvenida según la sección
  const getWelcomeMessageForSection = (sectionId) => {
    const sectionTitles = {
      'datos-personales': 'Información Personal',
      'motivo-consulta': 'Motivo de Consulta',
      'historia-enfermedad': 'Historia de la Enfermedad Actual',
      'antecedentes-personales': 'Antecedentes Personales',
      'antecedentes-gineco': 'Antecedentes Gineco-Obstétricos',
      'antecedentes-familiares': 'Antecedentes Familiares',
      'habitos': 'Hábitos y Estilo de Vida',
      'revision-sistemas': 'Revisión por Sistemas',
      'pruebas-previas': 'Pruebas e Informes Previos',
      'salud-mental': 'Salud Mental y Bienestar',
      'percepcion-paciente': 'Percepción del Paciente'
    };

    const title = sectionTitles[sectionId] || 'Información Médica';
    const existingData = formData[sectionId];
    const hasData = existingData && Object.keys(existingData).length > 0;

    if (hasData) {
      return `Continuemos con la sección "${title}". Ya tenemos parte de esta información. Voy a hacerle algunas preguntas adicionales para completar su historia clínica. Responda con la mayor precisión posible o indique si no conoce algún dato.`;
    } else {
      return `Ahora vamos a completar la sección "${title}". Le haré algunas preguntas para recopilar esta información. Responda con la mayor precisión posible o indique si no conoce algún dato.`;
    }
  };

  // Generar la siguiente pregunta con IA
  const generateNextAIQuestion = async (sectionId = currentSectionId) => {
    try {
      setIsAITyping(true);
      simulateTyping('Analizando información y generando pregunta...');
      
      // Obtener datos para la generación de preguntas
      const result = await generateSmartQuestion({
        currentSection: sectionId,
        previousQuestions,
        patientResponses: previousResponses,
        patientContext: formattedPatientContext,
        existingData: formData
      });
      
      // Manejar posibles errores
      if (result.error) {
        console.error('Error generando pregunta:', result.error);
        
        // Usar pregunta de respaldo si está disponible
        if (result.fallbackQuestion) {
          stopTypingSimulation();
          addAssistantMessage(result.fallbackQuestion);
          return;
        }
        
        toast.error('Error generando pregunta. Intente de nuevo.');
        setIsAITyping(false);
        stopTypingSimulation();
        return;
      }
      
      // Agregar la pregunta generada al chat
      stopTypingSimulation();
      addAssistantMessage(result.question);
      
      // Guardar la pregunta en el historial
      setPreviousQuestions(prev => [...prev, result.question]);
      
      // Generar respuestas sugeridas si hay opciones
      if (result.suggestedFollowUps && result.suggestedFollowUps.length > 0) {
        // Tomar solo las primeras 3 sugerencias
        setSuggestedResponses(result.suggestedFollowUps.slice(0, 3));
      } else {
        setSuggestedResponses([]);
      }
    } catch (error) {
      console.error('Error en generateNextAIQuestion:', error);
      toast.error('Error al generar la siguiente pregunta. Por favor intente de nuevo.');
      setIsAITyping(false);
      stopTypingSimulation();
    }
  };

  // Simular efecto de tipeo para la IA
  const simulateTyping = (initialText = '') => {
    stopTypingSimulation();
    
    let text = initialText || 'Pensando';
    let dots = 0;
    
    setAiTypingText(text);
    
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
      const newText = text.replace(/\.+$/, '') + '.'.repeat(dots);
      setAiTypingText(newText);
    }, 300);
    
    setTypingInterval(interval);
  };
  
  // Detener simulación de tipeo
  const stopTypingSimulation = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      setTypingInterval(null);
    }
    setAiTypingText('');
  };

  // Añadir mensaje del asistente (IA)
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
    setIsAITyping(false);
  };

  // Añadir mensaje del usuario
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
    setPreviousResponses(prev => [...prev, text]);
  };

  // Procesar la respuesta del usuario con IA
  const processUserResponse = async (userResponse) => {
    if (!userResponse.trim() || !currentSectionId) return;
    
    try {
      setIsAITyping(true);
      simulateTyping('Analizando su respuesta...');
      
      // Obtener la última pregunta formulada
      const lastQuestion = previousQuestions.length > 0 
        ? previousQuestions[previousQuestions.length - 1] 
        : '';
      
      // Analizar la respuesta del paciente
      const result = await analyzePatientResponse({
        currentSection: currentSectionId,
        question: lastQuestion,
        patientResponse: userResponse,
        patientContext: formattedPatientContext
      });
      
      // Manejar errores
      if (result.error) {
        console.error('Error analizando respuesta:', result.error);
        stopTypingSimulation();
        
        // Continuar con la siguiente pregunta a pesar del error
        setTimeout(() => {
          generateNextAIQuestion();
        }, 1000);
        
        return;
      }
      
      // Actualizar datos del formulario con la información extraída
      if (result.extractedData && Object.keys(result.extractedData).length > 0) {
        const updatedSectionData = {
          ...formData[currentSectionId],
          ...result.extractedData
        };
        
        // Actualizar el formulario
        updateFormData({
          [currentSectionId]: updatedSectionData
        });
        
        // Actualizar campos completados
        const newCompletedFields = new Set([
          ...(completedFields[currentSectionId] || []),
          ...Object.keys(result.extractedData)
        ]);
        
        setCompletedFields(prev => ({
          ...prev,
          [currentSectionId]: newCompletedFields
        }));
        
        // Recalcular progreso
        calculateSectionProgress(currentSectionId, [...newCompletedFields]);
      }
      
      // Si se detectaron riesgos, informar al usuario
      if (result.detectedRisks && result.detectedRisks.length > 0) {
        const riskMessage = `He notado algo importante en su respuesta: ${result.detectedRisks[0].description}`;
        setTimeout(() => {
          stopTypingSimulation();
          addAssistantMessage(riskMessage);
          
          // Esperar un momento antes de generar la siguiente pregunta
          setTimeout(() => {
            generateNextAIQuestion();
          }, 1500);
        }, 1000);
      } else {
        // Si se necesita seguimiento específico
        if (result.followUpNeeded && result.suggestedFollowUp) {
          stopTypingSimulation();
          addAssistantMessage(result.suggestedFollowUp);
          setPreviousQuestions(prev => [...prev, result.suggestedFollowUp]);
        } else {
          // Generar siguiente pregunta
          stopTypingSimulation();
          
          // Ocasionalmente agregar un mensaje de reconocimiento
          if (Math.random() > 0.7) {
            const acknowledgments = [
              "Gracias por esa información.",
              "Entiendo, continuemos.",
              "Comprendo, esto es útil para su historia clínica.",
              "Perfecto, gracias por compartir eso."
            ];
            
            const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
            addAssistantMessage(acknowledgment);
            
            setTimeout(() => {
              generateNextAIQuestion();
            }, 800);
          } else {
            generateNextAIQuestion();
          }
        }
      }
    } catch (error) {
      console.error('Error procesando respuesta del usuario:', error);
      stopTypingSimulation();
      toast.error('Error al procesar su respuesta');
      
      // Intentar continuar a pesar del error
      setTimeout(() => {
        generateNextAIQuestion();
      }, 1000);
    }
  };

  // Manejar envío de respuesta del usuario
  const handleSubmitAnswer = async () => {
    if (!userInput.trim()) return;

    // Agregar respuesta del usuario a mensajes
    addUserMessage(userInput);
    
    // Limpiar input y sugerencias
    setUserInput('');
    setSuggestedResponses([]);
    
    // Procesar la respuesta
    await processUserResponse(userInput);
  };

  // Manejar tecla Enter para enviar
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // Formatear timestamp para mensajes
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Manejar clic en respuesta sugerida
  const handleSuggestedResponseClick = (response) => {
    setUserInput(response);
    setTimeout(handleSubmitAnswer, 100);
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="p-4 bg-blue-50 rounded-t-lg border border-blue-200 shadow-sm">
        <h3 className="font-medium text-blue-800">{currentStep.title || 'Conversación Médica Asistida por IA'}</h3>
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
        <AnimatePresence>
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
                  : message.isSpecial 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-bl-none'
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
        </AnimatePresence>

        {/* Indicador de que la IA está escribiendo */}
        {isAITyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-none shadow-sm p-3 max-w-[80%]">
              {aiTypingText ? (
                <p className="text-sm text-gray-600">{aiTypingText}</p>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Elemento para scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Respuestas sugeridas */}
      {suggestedResponses.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Respuestas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedResponses.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedResponseClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Área de input */}
      <div className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba su respuesta..."
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={1}
            disabled={isAITyping || isSubmitting}
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!userInput.trim() || isAITyping || isSubmitting}
            className={`px-4 py-2 rounded-r-lg text-white ${userInput.trim() && !isAITyping && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Indicador de procesamiento de IA */}
        {isAiProcessing && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando con IA médica...
          </div>
        )}
      </div>
    </div>
  );
}
