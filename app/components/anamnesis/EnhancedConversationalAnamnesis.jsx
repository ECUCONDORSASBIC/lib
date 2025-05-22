'use client';

import Button from '@/app/components/ui/Button';
import LoadingIndicator from '@/app/components/ui/LoadingIndicator';
import Textarea from '@/app/components/ui/Textarea';
import { useToast } from '@/app/components/ui/Toast';
import { useGenkit } from '@/app/contexts/GenkitContext';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import FatigueDetection from './FatigueDetection';

// Constantes para manejar las etapas de anamnesis
const ANAMNESIS_STAGES = {
  INITIAL: 'initial',
  PERSONAL_INFO: 'personal_info',
  CURRENT_SYMPTOMS: 'current_symptoms',
  MEDICAL_HISTORY: 'medical_history',
  FAMILY_HISTORY: 'family_history',
  MEDICATIONS: 'medications',
  LIFESTYLE: 'lifestyle',
  SUMMARY: 'summary'
};

// Estructura de progreso para cada etapa
const STAGE_PROGRESS = {
  [ANAMNESIS_STAGES.INITIAL]: { order: 0, weight: 5, label: 'Inicio', icon: '👋' },
  [ANAMNESIS_STAGES.PERSONAL_INFO]: { order: 1, weight: 15, label: 'Información Personal', icon: '📋' },
  [ANAMNESIS_STAGES.CURRENT_SYMPTOMS]: { order: 2, weight: 20, label: 'Síntomas Actuales', icon: '🩺' },
  [ANAMNESIS_STAGES.MEDICAL_HISTORY]: { order: 3, weight: 20, label: 'Historial Médico', icon: '📚' },
  [ANAMNESIS_STAGES.FAMILY_HISTORY]: { order: 4, weight: 10, label: 'Historial Familiar', icon: '👪' },
  [ANAMNESIS_STAGES.MEDICATIONS]: { order: 5, weight: 10, label: 'Medicación', icon: '💊' },
  [ANAMNESIS_STAGES.LIFESTYLE]: { order: 6, weight: 15, label: 'Estilo de Vida', icon: '🏃‍♂️' },
  [ANAMNESIS_STAGES.SUMMARY]: { order: 7, weight: 5, label: 'Resumen', icon: '✅' }
};

/**
 * Componente de anamnesis conversacional mejorado con detección de fatiga,
 * mensajes motivacionales contextuales, y mejor experiencia de usuario
 */
export default function EnhancedConversationalAnamnesis({ patientId, existingData, onInsightsGenerated }) {
  // Estado de la conversación y progreso
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('general_health');
  const [currentStage, setCurrentStage] = useState(ANAMNESIS_STAGES.INITIAL);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [timeSinceLastInput, setTimeSinceLastInput] = useState(0);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  // Referencias y contextos
  const toast = useToast();
  const { analyzeConversation, isProcessing, error } = useGenkit();
  const isLoading = isLocalLoading || isProcessing;
  const chatViewRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const lastInputTimeRef = useRef(Date.now());

  // Usar localStorage para mantener estado entre sesiones
  const [savedSession, setSavedSession, clearSavedSession] = useLocalStorage(
    `anamnesis-session-${patientId}`,
    null
  );

  // Función para añadir mensajes al chat
  const addMessage = (sender, text, type = 'text') => {
    const newMessage = { sender, text, type, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // Crear un ID único para trackear inputs del usuario
  const generateConversationId = () => {
    return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  // Función para guardar el estado de la sesión
  const saveSession = useCallback(async (forceServerSave = false) => {
    if (!patientId) return;

    const sessionData = {
      messages,
      currentTopic,
      currentStage,
      sessionProgress,
      lastUpdated: new Date().toISOString(),
      completed: currentStage === ANAMNESIS_STAGES.SUMMARY,
      sessionDuration
    };

    // Guardar en localStorage siempre
    setSavedSession(sessionData);

    // Guardar en servidor cada cierto tiempo o si se fuerza
    if (forceServerSave || !lastSaved || (new Date() - new Date(lastSaved)) > 60000) { // 1 minuto
      try {
        setIsAutosaving(true);

        // Importar Firebase dinámicamente para evitar problemas en entornos sin soporte
        const { db } = await import('@/lib/firebase/firebaseClient');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

        const sessionRef = doc(db, 'anamnesissSessions', `${patientId}_session`);
        await setDoc(sessionRef, {
          ...sessionData,
          patientId,
          lastUpdated: serverTimestamp()
        }, { merge: true });

        setLastSaved(new Date().toISOString());
      } catch (error) {
        console.error('Error al guardar la sesión:', error);
        // No mostrar error al usuario, ya que tenemos respaldo en localStorage
      } finally {
        setIsAutosaving(false);
      }
    }
  }, [patientId, messages, currentTopic, currentStage, sessionProgress, lastSaved, setSavedSession, sessionDuration]);

  // Recuperar sesión anterior
  const recoverSession = useCallback(async () => {
    if (!patientId) return false;

    // Primero intentar desde localStorage para respuesta rápida
    if (savedSession) {
      setMessages(savedSession.messages || []);
      setCurrentTopic(savedSession.currentTopic || 'general_health');
      setCurrentStage(savedSession.currentStage || ANAMNESIS_STAGES.INITIAL);
      setSessionProgress(savedSession.sessionProgress || 0);
      setSessionDuration(savedSession.sessionDuration || 0);

      // Indicar cuando se guardó por última vez
      if (savedSession.lastUpdated) {
        const lastDate = new Date(savedSession.lastUpdated);
        const now = new Date();
        const minutesAgo = Math.round((now - lastDate) / 60000);

        if (minutesAgo < 60) {
          toast.info(`Retomando conversación de hace ${minutesAgo} minutos`);
        } else {
          const hoursAgo = Math.round(minutesAgo / 60);
          toast.info(`Retomando conversación de hace ${hoursAgo} ${hoursAgo === 1 ? 'hora' : 'horas'}`);
        }
      }

      return true;
    }

    // Si no hay en localStorage, intentar desde servidor
    try {
      const { db } = await import('@/lib/firebase/firebaseClient');
      const { doc, getDoc } = await import('firebase/firestore');

      const sessionRef = doc(db, 'anamnesissSessions', `${patientId}_session`);
      const docSnap = await getDoc(sessionRef);

      if (docSnap.exists()) {
        const serverData = docSnap.data();
        setMessages(serverData.messages || []);
        setCurrentTopic(serverData.currentTopic || 'general_health');
        setCurrentStage(serverData.currentStage || ANAMNESIS_STAGES.INITIAL);
        setSessionProgress(serverData.sessionProgress || 0);
        setSessionDuration(serverData.sessionDuration || 0);

        // Actualizar localStorage también
        setSavedSession(serverData);

        toast.info('Retomando tu conversación anterior');
        return true;
      }
    } catch (error) {
      console.error('Error al recuperar sesión desde servidor:', error);
    }

    return false;
  }, [patientId, savedSession, toast, setSavedSession]);

  // Calcular progreso basado en etapa actual
  const calculateProgress = useCallback(() => {
    const currentStageInfo = STAGE_PROGRESS[currentStage];
    if (!currentStageInfo) return 0;

    // Sumar pesos de todas las etapas completadas
    let completedWeight = 0;
    let totalWeight = 0;

    Object.values(STAGE_PROGRESS).forEach(stage => {
      totalWeight += stage.weight;
      if (stage.order < currentStageInfo.order) {
        completedWeight += stage.weight;
      }
    });

    // Añadir porcentaje del peso de la etapa actual basado en la cantidad de mensajes
    // Asumimos que cada etapa necesita aproximadamente 5 interacciones para completarse
    const messagesInCurrentStage = messages.filter(m =>
      m.sender === 'user' &&
      m.stageId === currentStage
    ).length;

    const stageCompletionRatio = Math.min(messagesInCurrentStage / 5, 1);
    completedWeight += (currentStageInfo.weight * stageCompletionRatio);

    return Math.round((completedWeight / totalWeight) * 100);
  }, [currentStage, messages]);

  // Inicialización del chat al cargar
  useEffect(() => {
    const initChat = async () => {
      // Intentar recuperar sesión anterior
      const recovered = await recoverSession();

      // Si no hay sesión anterior, iniciar nueva
      if (!recovered) {
        // Mensaje inicial
        addMessage('assistant', 'Hola! Soy tu asistente para completar tu historia clínica. Te haré preguntas adaptadas a ti y puedes responder a tu propio ritmo.');

        setTimeout(() => {
          addMessage('assistant', 'Toda esta información es importante para tu atención médica. Puedes pausar en cualquier momento y tu progreso se guardará automáticamente.');
        }, 1000);

        if (existingData && Object.keys(existingData).length > 0) {
          setTimeout(() => {
            addMessage('assistant', 'Veo que ya tenemos algunos datos tuyos. Iremos actualizándolos durante nuestra conversación.');
          }, 2000);
        }

        // Preguntar si quiere comenzar
        setTimeout(() => {
          addMessage('assistant', '¿Te gustaría comenzar ahora? Puedes decirme qué te trae por aquí o alguna preocupación que tengas sobre tu salud.');
        }, 3000);
      }

      // Iniciar timer de sesión
      startSessionTimer();
    };

    initChat();

    // Limpieza al desmontar
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [existingData, recoverSession]);

  // Iniciar temporizador para medir duración de sesión
  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);

      // Actualizar tiempo desde la última interacción
      const now = Date.now();
      const elapsed = now - lastInputTimeRef.current;
      setTimeSinceLastInput(elapsed);
    }, 1000);
  };

  // Función para obtener un mensaje motivacional contextual
  const getMotivationalMessage = useCallback(() => {
    // Determinar la etapa actual para mensajes más relevantes al contexto
    const currentProgress = calculateProgress();

    // Mensajes adaptados a diferentes etapas de progreso
    const EARLY_STAGE_MESSAGES = [
      '¡Empezamos bien! Cada detalle que compartes es importante para conocer tu salud.',
      'Gracias por compartir esta información. Nos ayuda a conocerte mejor.',
      'Estamos creando tu historial paso a paso. ¡Sigamos avanzando!',
      'Tu participación mejora significativamente la calidad de tu atención médica.'
    ];

    const MID_STAGE_MESSAGES = [
      '¡Excelente progreso! Ya llevamos aproximadamente la mitad del proceso.',
      'Estás compartiendo información muy valiosa. Continuemos a tu ritmo.',
      `Llevamos un ${currentProgress}% completado. Puedes tomarte un descanso si lo necesitas.`,
      'La información que estás proporcionando es fundamental para tu atención médica personalizada.'
    ];

    const LATE_STAGE_MESSAGES = [
      `¡${currentProgress}% completado! Solo faltan unos pocos detalles más.`,
      'Gracias por tu paciencia. Esta información completa será muy útil para tu médico.',
      'Estamos finalizando. Cada detalle que has compartido contribuye a una mejor atención.',
      'Tu dedicación para completar este proceso ayudará a ofrecerte la mejor atención posible.'
    ];

    // Seleccionar conjunto de mensajes según el progreso
    const messageSet =
      currentProgress < 30 ? EARLY_STAGE_MESSAGES :
        currentProgress < 70 ? MID_STAGE_MESSAGES :
          LATE_STAGE_MESSAGES;

    // Seleccionar un mensaje aleatorio del conjunto apropiado
    return messageSet[Math.floor(Math.random() * messageSet.length)];
  }, [calculateProgress]);

  // Función para detectar transición de etapa
  const detectStageTransition = useCallback((response) => {
    // Detectar cambio de etapa a partir de la respuesta de la IA
    if (response?.stage && ANAMNESIS_STAGES[response.stage.toUpperCase()]) {
      const newStageKey = response.stage.toUpperCase();
      const newStage = ANAMNESIS_STAGES[newStageKey];
      if (newStage !== currentStage) {
        setCurrentStage(newStage);
        return true;
      }
    }

    // Si no hay etapa explícita, intentar inferir basado en el tema
    const topicToStageMap = {
      'personal_info': ANAMNESIS_STAGES.PERSONAL_INFO,
      'general_health': ANAMNESIS_STAGES.PERSONAL_INFO,
      'current_symptoms': ANAMNESIS_STAGES.CURRENT_SYMPTOMS,
      'medical_history': ANAMNESIS_STAGES.MEDICAL_HISTORY,
      'family_history': ANAMNESIS_STAGES.FAMILY_HISTORY,
      'medications': ANAMNESIS_STAGES.MEDICATIONS,
      'allergies': ANAMNESIS_STAGES.MEDICAL_HISTORY,
      'lifestyle': ANAMNESIS_STAGES.LIFESTYLE,
      'diet': ANAMNESIS_STAGES.LIFESTYLE,
      'physical_activity': ANAMNESIS_STAGES.LIFESTYLE,
      'substance_use': ANAMNESIS_STAGES.LIFESTYLE
    };

    if (response?.nextTopic &&
      topicToStageMap[response.nextTopic] &&
      topicToStageMap[response.nextTopic] !== currentStage) {
      setCurrentStage(topicToStageMap[response.nextTopic]);
      return true;
    }

    return false;
  }, [currentStage]);

  // Manejar envío de mensajes
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Actualizar tiempo de la última interacción
    lastInputTimeRef.current = Date.now();
    setTimeSinceLastInput(0);

    // Añadir mensaje del usuario al chat
    const messageId = generateConversationId(); // ID único para este mensaje
    addMessage('user', userInput, 'text', messageId);
    setIsLocalLoading(true);
    const inputText = userInput;
    setUserInput('');

    try {
      // Guardar estado antes de enviar la solicitud por si hay fallo
      await saveSession(false);

      // Preparar el contexto para el análisis
      const conversationContext = {
        text: inputText,
        context: {
          currentTopic,
          currentStage,
          sessionProgress: sessionProgress,
          patientData: existingData,
          previousMessages: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
        }
      };

      // Llamar al servicio de análisis de IA
      const response = await analyzeConversation(conversationContext, patientId);

      // Procesar respuesta del asistente
      if (response) {
        if (response.messages && response.messages.length > 0) {
          // Añadir respuestas del asistente al chat
          for (const msg of response.messages) {
            addMessage('assistant', msg.content);
          }

          // Detectar cambio de etapa y actualizar progreso
          const stageChanged = detectStageTransition(response);

          // Actualizar el tema actual si se proporciona
          if (response.nextTopic) {
            setCurrentTopic(response.nextTopic);
          }

          // Informar al componente padre sobre los datos extraídos
          if (response.extractedData && Object.keys(response.extractedData).length > 0) {
            onInsightsGenerated(response.extractedData);
            toast.success('Información médica actualizada');
          }

          // Añadir mensaje motivacional con cierta lógica
          const shouldAddMotivational = (
            // Cuando hay transición de etapa
            stageChanged ||
            // O cuando se alcanza un nuevo umbral de progreso
            (Math.floor(sessionProgress / 10) !== Math.floor(calculateProgress() / 10)) ||
            // O cada cierto número de interacciones
            (messages.filter(m => m.sender === 'user').length % 5 === 0)
          );

          if (shouldAddMotivational) {
            setTimeout(() => {
              addMessage('assistant', getMotivationalMessage());
            }, 1000);
          }

          // Si ya completamos todas las etapas, marcar como finalizado
          if (currentStage === ANAMNESIS_STAGES.SUMMARY || sessionProgress >= 95) {
            addMessage('assistant', '¡Felicidades! Has completado tu historia clínica. Esta información será muy útil para tu atención médica.');

            // Mensaje final con próximos pasos
            setTimeout(() => {
              addMessage('assistant', 'Tu médico tendrá acceso a esta información antes de tu consulta. ¿Hay algo más que quieras añadir o modificar?');
            }, 1500);
          }
        } else if (response.error) {
          // Manejar errores en la respuesta
          addMessage('assistant', `Disculpa, tuve un problema al procesar tu consulta. ¿Podrías reformularla?`);
          console.error(`Error en respuesta de IA:`, response.error);
        } else {
          // Respuesta sin mensajes ni error
          addMessage('assistant', 'Gracias por compartir esa información. ¿Hay algo más que quieras comentar sobre tu salud?');
        }
      } else {
        // Sin respuesta del servicio
        addMessage('assistant', 'Lo siento, parece que hay un problema técnico. Tu información se ha guardado. ¿Te gustaría intentar de nuevo?');
      }

      // Calcular y actualizar progreso
      const newProgress = calculateProgress();
      if (newProgress !== sessionProgress) {
        setSessionProgress(newProgress);
      }
    } catch (error) {
      console.error('Error en la interacción con IA:', error);
      addMessage('assistant', 'Lo siento, ocurrió un error al procesar tu mensaje. Tu progreso ha sido guardado y puedes continuar más tarde.');

      toast.error('Error de comunicación. Tu información está guardada.');
    } finally {
      setIsLocalLoading(false);

      // Guardar cambios después de cada interacción
      await saveSession(true);
    }
  };

  // Función para pausar y guardar la sesión
  const pauseSession = async () => {
    setSessionActive(false);
    await saveSession(true);
    addMessage('system', 'Tu progreso ha sido guardado. Puedes continuar más tarde.', 'status');
    toast.info('Sesión pausada. Tu progreso está guardado.');
  };

  // Función para reanudar la sesión
  const resumeSession = () => {
    setSessionActive(true);
    addMessage('system', 'Continuando con tu historia clínica.', 'status');
  };

  // Manejar notificación de fatiga
  const handleFatigueDetected = (source) => {
    console.log(`Fatiga detectada: ${source}`);
  };

  // Manejar cuando se descarta una notificación
  const handleDismissNotification = (id) => {
    setDismissedNotifications(prev => [...prev, id]);
  };

  // Desplazamiento automático al último mensaje
  useEffect(() => {
    if (chatViewRef.current) {
      chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
    }
  }, [messages]);

  // Mostrar error persistente si existe
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error, toast]);

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Cabecera con tema actual y barra de progreso */}
      <div className="bg-blue-600 text-white px-4 py-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">Asistente de Historia Clínica</h3>
            {isAutosaving && (
              <div className="ml-2 flex items-center text-white/70 text-xs">
                <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sessionActive ? (
              <button
                onClick={pauseSession}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
                title="Pausar y guardar sesión"
              >
                Pausar
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
                title="Reanudar sesión"
              >
                Reanudar
              </button>
            )}
            <div className="text-xs bg-white/20 px-2 py-1 rounded-md flex items-center">
              <span className="mr-1">{STAGE_PROGRESS[currentStage]?.icon}</span>
              <span>{STAGE_PROGRESS[currentStage]?.label}</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: `${sessionProgress}%` }}
            animate={{ width: `${sessionProgress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>

        {/* Porcentaje y etapa actual */}
        <div className="flex justify-between items-center text-xs mt-1 text-white/80">
          <span>{sessionProgress}% completado</span>
          <span>{messages.filter(m => m.sender === 'user').length} respuestas</span>
        </div>
      </div>

      {/* Vista de mensajes */}
      <div className="relative flex-grow overflow-hidden bg-gray-50">
        {/* Componente de detección de fatiga */}
        <FatigueDetection
          sessionDuration={sessionDuration}
          timeBetweenInputs={timeSinceLastInput}
          completedSections={Object.values(STAGE_PROGRESS)
            .filter(stage => stage.order < STAGE_PROGRESS[currentStage]?.order)
            .map(stage => stage.label)}
          totalSections={Object.values(STAGE_PROGRESS).length}
          onPauseSuggested={pauseSession}
          onFatigueDetected={handleFatigueDetected}
          onDismiss={handleDismissNotification}
          dismissedId={dismissedNotifications.includes('fatigue-banner') ? 'fatigue-banner' : ''}
        />

        {/* Lista de mensajes */}
        <div
          id="chat-view"
          ref={chatViewRef}
          className="absolute inset-0 p-4 space-y-4 overflow-y-auto scroll-smooth"
        >
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.sender === 'system' ? (
                <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-full border border-blue-100">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-xs opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Indicador de carga */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <LoadingIndicator message="Analizando tu respuesta..." size="small" />
            </div>
          )}

          {/* Mensaje cuando hay errores persistentes */}
          {error && !isLoading && (
            <div className="mx-auto my-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 max-w-xs text-center">
              {error.includes('Error al analizar')
                ? 'Hay un problema con el servicio. Tus respuestas siguen siendo guardadas.'
                : error}
            </div>
          )}

          {/* Mensaje cuando la sesión está pausada */}
          {!sessionActive && (
            <div className="sticky bottom-0 left-0 right-0 mx-auto my-2 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200 max-w-xs text-center shadow-md">
              <p className="font-medium">Sesión pausada</p>
              <p className="mt-1 text-xs">Tu progreso está guardado.</p>
              <button
                onClick={resumeSession}
                className="mt-2 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
              >
                Reanudar ahora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Área de entrada de texto */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={sessionActive
              ? "Escribe tu respuesta o pregunta aquí..."
              : "Sesión pausada. Presiona 'Reanudar' para continuar..."
            }
            className="flex-grow resize-none focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && sessionActive && !isLoading) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={2}
            disabled={isLoading || !sessionActive}
          />
          {sessionActive ? (
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          ) : (
            <Button
              onClick={resumeSession}
              className="bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              Reanudar
            </Button>
          )}
        </div>

        {/* Sugerencias de temas */}
        {sessionActive && !isLoading && (
          <div className="mt-3 flex flex-wrap gap-2">
            <SuggestionButton
              text="Síntomas actuales"
              onClick={() => {
                setUserInput("Quisiera contarte sobre mis síntomas actuales.");
              }}
            />
            <SuggestionButton
              text="Antecedentes médicos"
              onClick={() => {
                setUserInput("Tengo algunos antecedentes médicos importantes.");
              }}
            />
            <SuggestionButton
              text="Medicación"
              onClick={() => {
                setUserInput("Actualmente estoy tomando estos medicamentos.");
              }}
            />
            <SuggestionButton
              text="Guardar y continuar luego"
              onClick={pauseSession}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700"
            />
          </div>
        )}

        {/* Indicador de guardado automático */}
        {lastSaved && (
          <div className="mt-2 flex justify-end">
            <span className="text-xs text-gray-500">
              {isAutosaving ? 'Guardando...' : 'Guardado automáticamente'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para botones de sugerencia
const SuggestionButton = ({ text, onClick, disabled, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-xs px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${className || 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
  >
    {text}
  </button>
);
