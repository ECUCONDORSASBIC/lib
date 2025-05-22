import React from 'react';
import InfoCard from './InfoCard'; // Assuming InfoCard is in the same directory

// Define simple SVG icons here or import them
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372M6.75 12.75a5.25 5.25 0 0110.5 0v3.75a5.25 5.25 0 01-10.5 0v-3.75zM19.5 10.5a5.25 5.25 0 00-9.232-3.608 3.75 3.75 0 01-5.236 3.608B5.25 5.25 0 006.75 10.5m12.75 4.5h-2.25m-10.5-4.5H6.75" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM10.5 16.5h-3m3-3.75h-3" /></svg>;

const iconMap = {
  'Total Patients': <UsersIcon />,
  'Patients': <UsersIcon />,
  'Citas Hoy': <CalendarIcon />,
  'Appointments Today': <CalendarIcon />,
  'Tareas Pendientes': <ClipboardListIcon />,
  'Pending Tasks': <ClipboardListIcon />,
};

const getDefaultIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m2.25 2.25H12m0 0H9.75M12 15m0 0h2.25m-2.25 0H9.75m5.25 0H12m0 0H9.75M12 15m0 0H9.75M7.5 12h9M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" /></svg>;

const StatsSummary = ({ stats, loading, className = '' }) => {
  const safeStats = Array.isArray(stats) ? stats : [];

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <InfoCard key={i} title="Cargando..." value="..." className="animate-pulse">
            <div className="w-3/4 h-4 mt-2 bg-gray-200 rounded"></div>
          </InfoCard>
        ))}
      </div>
    );
  }

  if (safeStats.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-lg text-gray-500">No hay estadísticas disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {safeStats.map((stat, idx) => (
        <InfoCard
          key={idx}
          title={stat.label}
          value={stat.value}
          icon={iconMap[stat.label] || getDefaultIcon()}
          iconBgColor={idx % 3 === 0 ? 'bg-blue-500' : idx % 3 === 1 ? 'bg-green-500' : 'bg-yellow-500'}
        />
      ))}
    </div>
  );
};

export default StatsSummary;
