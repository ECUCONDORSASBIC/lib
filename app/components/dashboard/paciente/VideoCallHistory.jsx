import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserVideoCallHistory } from '@/app/services/videoCallService';

const VideoCallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCallHistory = async () => {
      if (!user?.uid) return;

      try {
        const callHistory = await getUserVideoCallHistory(user.uid, 'patient');
        setCalls(callHistory);
      } catch (error) {
        console.error("Error fetching call history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, [user]);

  // Format the timestamp to a readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    return new Date(timestamp.toDate()).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-base font-semibold text-primary mb-2">Historial de Videollamadas</h3>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-base font-semibold text-primary mb-2">Historial de Videollamadas</h3>
      {calls.length === 0 ? (
        <p className="text-slate-500 text-sm">No hay videollamadas registradas.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {calls.map(call => {
            const isOutgoing = call.role === 'caller';
            const otherPartyId = isOutgoing ? call.calleeUserId : call.callerUserId;
            const otherPartyName = call.recipientName || otherPartyId || 'Usuario';

            return (
              <li key={call.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className={`mr-2 ${isOutgoing ? 'text-green-600' : 'text-blue-600'}`}>
                    {isOutgoing ? '→' : '←'}
                  </span>
                  <span className="font-medium text-slate-700">{otherPartyName}</span>
                  <span className="ml-2 text-xs text-slate-400">{formatTime(call.startTime || call.createdAt)}</span>
                </div>
                {call.status && (
                  <span className={`text-xs mt-1 md:mt-0 ${call.status === 'completed' ? 'text-green-500' : 'text-slate-500'}`}>
                    {call.status === 'completed' ? 'Completada' : call.status === 'missed' ? 'Perdida' : 'En progreso'}
                  </span>
                )}
                {call.duration && (
                  <span className="text-xs text-slate-600 mt-1 md:mt-0 md:ml-2">
                    {Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, '0')}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default VideoCallHistory;
