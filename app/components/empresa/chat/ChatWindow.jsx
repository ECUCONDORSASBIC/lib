import { ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import chatService from '../../../services/chatService';

const ChatWindow = ({ conversationId, recipientId, recipientName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen for messages in real time using chatService
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = chatService.subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Send a message using chatService
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || !conversationId) return;

    setLoading(true);

    try {
      await chatService.sendMessage(
        conversationId,
        input.trim(),
        user.uid,
        user.displayName || 'Usuario'
      );

      setInput('');
    } catch (error) {
      console.error("Error sending message: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            {recipientName ? recipientName.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="ml-3 font-medium">{recipientName || 'Chat'}</h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No hay mensajes aún. Empieza la conversación!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${message.senderId === user?.uid
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.createdAt?.toDate().toLocaleTimeString() || 'Enviando...'}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-lg px-4 py-3 bg-blue-500 text-white opacity-70">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-3 border-t">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading || !conversationId}
          />
          <button
            type="submit"
            className="absolute right-1 top-1 rounded-full p-1.5 bg-blue-500 text-white disabled:bg-gray-300"
            disabled={loading || !input.trim() || !conversationId}
          >
            {loading ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
