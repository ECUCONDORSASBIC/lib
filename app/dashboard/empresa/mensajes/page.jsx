'use client';

import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { getCompanyMessages, sendMessage } from '@/app/services/messageService';
import { useEffect, useRef, useState } from 'react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchConversations = async () => {
      try {
        const data = await getCompanyMessages(user.uid);
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversation(data[0]);
          setMessages(data[0].messages || []);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setToast({ show: true, message: "Error al cargar los mensajes", type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        senderId: user.uid,
        receiverId: selectedConversation.professionalId,
        message: newMessage,
        conversationId: selectedConversation.id
      });

      // Optimistic update
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: user.uid,
        message: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      }]);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      setToast({ show: true, message: "Error al enviar el mensaje", type: 'error' });
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages || []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <h1 className="mb-6 text-2xl font-bold text-gray-800">Mensajes</h1>

      <div className="flex h-[70vh] bg-white rounded-lg shadow overflow-hidden">
        {/* Sidebar - Conversations list */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Conversaciones</h2>
          </div>
          <ul className="overflow-auto h-[calc(70vh-60px)]">
            {conversations.length === 0 ? (
              <li className="p-4 text-center text-gray-500">No hay conversaciones.</li>
            ) : (
              conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{conversation.professionalName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || 'No hay mensajes'}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Main content - Messages */}
        <div className="flex flex-col flex-1">
          {selectedConversation ? (
            <>
              <div className="flex items-center p-4 border-b">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedConversation.professionalName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.specialty || 'Profesional de la salud'}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Aún no hay mensajes. Envía el primero para iniciar la conversación.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === user.uid
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                            }`}
                        >
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribir un mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Selecciona una conversación para ver los mensajes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
