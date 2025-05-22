'use client';

import { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

/**
 * Componente para reconocimiento de voz con interfaz visual
 * 
 * @param {Object} props
 * @param {Function} props.onTranscriptChange - Función para recibir la transcripción
 * @param {string} props.language - Idioma para el reconocimiento (por defecto español)
 * @param {boolean} props.continuous - Si el reconocimiento debe ser continuo
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 */
const VoiceRecognitionInput = ({ 
  onTranscriptChange, 
  language = 'es-ES', 
  continuous = true,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  
  // Configurar el reconocimiento de voz
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMessage('Lo sentimos, el reconocimiento de voz no está disponible en este navegador.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Combinar transcripciones finales e interinas
      const fullTranscript = (finalTranscript + interimTranscript).trim();
      setTranscript(fullTranscript);
      onTranscriptChange(fullTranscript);
    };
    
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setErrorMessage('No se detectó ninguna voz. Intente hablar más cerca del micrófono.');
      } else if (event.error === 'audio-capture') {
        setErrorMessage('No se pudo acceder al micrófono. Verifique los permisos.');
      } else if (event.error === 'not-allowed') {
        setErrorMessage('El acceso al micrófono fue denegado. Permita el acceso en la configuración del navegador.');
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      stopListening();
    };
    
    recognition.onend = () => {
      // Solo detener completamente si no estamos en modo continuo o si explícitamente se detuvo
      if (!continuous || !isListening) {
        setIsListening(false);
      } else {
        // Reiniciar reconocimiento si estamos en modo continuo
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioVisualization();
    };
  }, [language, continuous, onTranscriptChange]);
  
  // Iniciar visualización de audio cuando comienza la escucha
  useEffect(() => {
    if (isListening) {
      startAudioVisualization();
    } else {
      stopAudioVisualization();
    }
    
    return () => {
      stopAudioVisualization();
    };
  }, [isListening]);
  
  const startListening = () => {
    setErrorMessage('');
    setIsListening(true);
    setTranscript('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // Manejar el error si ya está escuchando
        if (error.name === 'InvalidStateError') {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
          }, 200);
        } else {
          console.error('Error al iniciar el reconocimiento de voz:', error);
          setErrorMessage('Error al iniciar el reconocimiento de voz.');
        }
      }
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  // Funciones para visualización de audio
  const startAudioVisualization = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      if (!microphoneStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStreamRef.current = stream;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }
      
      const analyseAudio = () => {
        if (!analyserRef.current || !isListening) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calcular el volumen promedio
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedVolume = Math.min(1, avg / 128); // Normalizar a 0-1
        
        setVolume(normalizedVolume);
        animationFrameRef.current = requestAnimationFrame(analyseAudio);
      };
      
      animationFrameRef.current = requestAnimationFrame(analyseAudio);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setErrorMessage('No se pudo acceder al micrófono. Verifique los permisos.');
    }
  };
  
  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    
    setVolume(0);
  };
  
  // Generar clases para el indicador de volumen
  const getVolumeIndicatorClasses = () => {
    const baseClasses = "transition-all duration-100 absolute inset-0 rounded-full bg-blue-400 opacity-60";
    
    if (volume < 0.2) return `${baseClasses} scale-100`;
    if (volume < 0.4) return `${baseClasses} scale-110`;
    if (volume < 0.6) return `${baseClasses} scale-125`;
    if (volume < 0.8) return `${baseClasses} scale-150`;
    return `${baseClasses} scale-175`;
  };
  
  return (
    <div className="voice-recognition-container">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || !!errorMessage}
          className={`relative p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isListening 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200 focus:ring-blue-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isListening ? 'Detener reconocimiento de voz' : 'Iniciar reconocimiento de voz'}
        >
          {isListening && (
            <span className={getVolumeIndicatorClasses()}></span>
          )}
          {isListening ? (
            <StopIcon className="h-6 w-6 relative z-10" />
          ) : (
            <MicrophoneIcon className="h-6 w-6 relative z-10" />
          )}
        </button>
        
        <div className="flex-1">
          {isListening && (
            <div className="text-sm font-medium text-blue-700 mb-1 flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Escuchando... Hable claramente
            </div>
          )}
          
          {transcript && (
            <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200 max-w-md">
              {transcript}
            </div>
          )}
          
          {errorMessage && (
            <div className="text-sm text-red-600 mt-1">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecognitionInput;
