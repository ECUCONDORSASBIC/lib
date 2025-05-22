'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/contexts/AuthContext';
import { sendMessage, getMessages, subscribeToMessages, markMessagesAsRead } from '@/app/services/chatService';

/**
 * Componente de chat en tiempo real utilizando Firebase Realtime Database
 * Proporciona una interfaz para la comunicación médico-paciente
 */
export default function RealtimeChat({ conversationId, otherUser, role = 'patient' }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  // Cargar mensajes iniciales y suscribirse a nuevos mensajes
  useEffect(() => {
    if (!conversationId || !user?.uid) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const existingMessages = await getMessages(conversationId);
        setMessages(existingMessages);
        
        // Marcar mensajes como leídos
        await markMessagesAsRead(conversationId, user.uid);
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
        setError('No pudimos cargar los mensajes. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Suscribirse a nuevos mensajes
    const unsubscribe = subscribeToMessages(conversationId, (newMsg) => {
      // Solo agregar el mensaje si no existe ya en la lista
      setMessages(prevMessages => {
        if (!prevMessages.find(msg => msg.id === newMsg.id)) {
          // Si el mensaje es del otro usuario, marcarlo como leído
          if (newMsg.senderId !== user.uid) {
            markMessagesAsRead(conversationId, user.uid).catch(console.error);
          }
          return [...prevMessages, newMsg];
        }
        return prevMessages;
      });
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, user?.uid]);
  
  // Hacer scroll automático a los nuevos mensajes
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Enviar un nuevo mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !attachmentPreview) return;
    
    try {
      if (attachmentPreview) {
        // En una implementación real, aquí subiríamos el archivo a Firebase Storage
        // y enviaríamos la URL como mensaje
        await sendMessage(
          conversationId,
          user.uid,
          attachmentPreview.name,
          attachmentPreview.type.startsWith('image/') ? 'image' : 'file'
        );
        setAttachmentPreview(null);
      }
      
      if (newMessage.trim()) {
        await sendMessage(conversationId, user.uid, newMessage, 'text');
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('No pudimos enviar tu mensaje. Intente nuevamente.');
    }
  };
  
  // Manejo de archivos adjuntos
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB permitido.');
        return;
      }
      
      setAttachmentPreview({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        file
      });
    }
  };
  
  // Cancelar archivo adjunto
  const handleCancelAttachment = () => {
    setAttachmentPreview(null);
    fileInputRef.current.value = '';
  };
  
  // Formatear fecha del mensaje
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  };
  
  // Formatear fecha completa
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch (err) {
      return '';
    }
  };
  
  // Renderizar fecha si cambia el día
  const shouldShowDate = (message, index) => {
    if (index === 0) return true;
    
    const currentDate = new Date(message.timestamp).toDateString();
    const prevDate = new Date(messages[index - 1].timestamp).toDateString();
    
    return currentDate !== prevDate;
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Encabezado del chat */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">
            {role === 'doctor' ? 'Chat con paciente' : 'Chat con médico'}
          </h3>
          <p className="text-sm text-blue-100">
            {otherUser?.name || 'Usuario'}
          </p>
        </div>
        <div className="text-sm text-blue-100">
          {role === 'doctor' ? 'Vista médico' : 'Vista paciente'}
        </div>
      </div>
      
      {/* Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <p>No hay mensajes. Comienza la conversación...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={message.id}>
                {shouldShowDate(message, index) && (
                  <div className="text-center my-4">
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.senderId === user?.uid 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.type === 'text' ? (
                      <p>{message.content}</p>
                    ) : message.type === 'image' ? (
                      <div>
                        <p className="mb-1">[Imagen]</p>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1">[Archivo]</p>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                      {message.senderId === user?.uid && (
                        <span className="ml-2">
                          {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : message.status === 'read' ? '✓✓' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>
      
      {/* Formulario de envío */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
        {/* Vista previa de adjunto */}
        {attachmentPreview && (
          <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
            <div className="flex items-center">
              {attachmentPreview.type.startsWith('image/') ? (
                <img src={attachmentPreview.url} alt="Vista previa" className="h-10 w-10 object-cover rounded" />
              ) : (
                <div className="h-10 w-10 bg-gray-300 rounded flex items-center justify-center text-gray-600">
                  <span className="text-xs">Archivo</span>
                </div>
              )}
              <span className="ml-2 text-sm text-gray-600 truncate max-w-[200px]">
                {attachmentPreview.name}
              </span>
            </div>
            <button 
              type="button" 
              onClick={handleCancelAttachment}
              className="text-gray-500 hover:text-red-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button 
            type="submit"
            disabled={!newMessage.trim() && !attachmentPreview}
            className={`p-2 rounded-full ${
              !newMessage.trim() && !attachmentPreview
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
