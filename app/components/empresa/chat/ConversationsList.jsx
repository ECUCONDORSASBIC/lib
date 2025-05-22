import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import chatService from '../../../services/chatService';

const ConversationsList = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = chatService.subscribeToConversations(user.uid, (newConversations) => {
      setConversations(newConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Format the timestamp to a readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    const now = new Date();

    // If it's today, just show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If it's this year, show day and month
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }

    // Otherwise show the full date
    return date.toLocaleDateString();
  };

  // Get the name of the other participant
  const getRecipientInfo = (conversation) => {
    if (!conversation.participants) return { name: 'Usuario', id: null };

    const otherParticipantId = conversation.participants.find(id => id !== user?.uid);

    // For MVP, we'll just return a placeholder
    // In a real app, you'd fetch user details from a users collection
    return {
      name: conversation.recipientName || 'Usuario',
      id: otherParticipantId
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-4 py-3 border-b">
        <h2 className="font-medium">Conversaciones</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="p-4 flex flex-col items-center justify-center h-32 text-center">
          <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No hay conversaciones disponibles</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {conversations.map((conversation) => {
            const recipient = getRecipientInfo(conversation);
            const unreadCount = conversation.unreadCount?.[user?.uid] || 0;

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id, recipient.id, recipient.name)}
                className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {recipient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900">{recipient.name}</h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate max-w-[180px]">
                        {conversation.lastMessage}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
