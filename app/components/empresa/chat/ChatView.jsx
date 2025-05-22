import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import chatService from '../../../services/chatService';
import ChatWindow from './ChatWindow';
import ConversationsList from './ConversationsList';

const ChatView = ({ defaultRecipient = null }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [recipientId, setRecipientId] = useState(defaultRecipient?.id || null);
  const [recipientName, setRecipientName] = useState(defaultRecipient?.name || null);
  const { user } = useAuth();

  // Handle selecting a conversation from the list
  const handleSelectConversation = (conversationId, newRecipientId, newRecipientName) => {
    setSelectedConversation(conversationId);
    setRecipientId(newRecipientId);
    setRecipientName(newRecipientName);

    // Mark messages as read when conversation is selected
    if (conversationId && user?.uid) {
      chatService.markMessagesAsRead(conversationId, user.uid)
        .catch(error => console.error("Error marking messages as read:", error));
    }
  };

  // Create a new conversation with a recipient
  const createNewConversation = async (newRecipientId, newRecipientName) => {
    if (!user?.uid || !newRecipientId) return;

    try {
      const conversation = await chatService.getOrCreateConversation(user.uid, newRecipientId);

      setSelectedConversation(conversation.id);
      setRecipientId(newRecipientId);
      setRecipientName(newRecipientName);
    } catch (error) {
      console.error("Error creating new conversation: ", error);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 md:flex-row">
      <div className="w-full md:w-1/3">
        <ConversationsList onSelectConversation={handleSelectConversation} />

        {/* Simple form to start a new conversation (would be replaced by a proper UI) */}
        <div className="p-4 mt-4 bg-white rounded-lg shadow-md">
          <h3 className="mb-2 font-medium">Nueva conversación</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            createNewConversation(formData.get('recipientId'), formData.get('recipientName'));
            e.target.reset();
          }}>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">ID del destinatario</label>
              <input
                type="text"
                name="recipientId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium text-gray-700">Nombre del destinatario</label>
              <input
                type="text"
                name="recipientName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Iniciar conversación
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            recipientId={recipientId}
            recipientName={recipientName}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-lg shadow-md">
            <div className="mb-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">Selecciona una conversación</h3>
            <p className="max-w-sm text-gray-500">
              Elige una conversación de la lista o inicia una nueva para comenzar a chatear.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
