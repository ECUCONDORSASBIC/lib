import { BellAlertIcon, BriefcaseIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';

const StatsOverview = ({ stats, loading }) => {
  const { activeJobs, totalApplications, newApplicationsToday, avgApplicationReviewTime } = stats;

  const statItems = [
    { title: 'Ofertas Activas', value: activeJobs, icon: <BriefcaseIcon />, bgColorClass: 'bg-sky-500', unit: '' },
    { title: 'Postulaciones Totales', value: totalApplications, icon: <UsersIcon />, bgColorClass: 'bg-green-500', unit: '' },
    { title: 'Nuevas Hoy', value: newApplicationsToday, icon: <BellAlertIcon />, bgColorClass: 'bg-amber-500', unit: '' },
    { title: 'Rev. Promedio Post.', value: avgApplicationReviewTime, icon: <ClockIcon />, bgColorClass: 'bg-indigo-500', unit: 'hs' },
  ];

  return (
    <section className="my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statItems.map((item, index) => (
          <StatsCard
            key={index}
            title={item.title}
            icon={item.icon}
            bgColorClass={item.bgColorClass}
            value={loading ? '...' : `${item.value}${item.unit}`}
          />
        ))}
      </div>
    </section>
  );
};

export default StatsOverview;
