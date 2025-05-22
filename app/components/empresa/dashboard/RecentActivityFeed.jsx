import { BellIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon, EyeIcon as ProfileViewIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'new_application': return <UserPlusIcon className="w-6 h-6 text-blue-500" />;
    case 'job_status_change': return <BriefcaseIcon className="w-6 h-6 text-green-500" />;
    case 'application_viewed': return <CheckCircleIcon className="w-6 h-6 text-purple-500" />;
    case 'job_near_deadline': return <ClockIcon className="w-6 h-6 text-orange-500" />;
    case 'profile_view': return <ProfileViewIcon className="w-6 h-6 text-indigo-500" />;
    default: return <BellIcon className="w-6 h-6 text-gray-500" />;
  }
};

const RecentActivityFeed = ({ activities, loading }) => {
  if (loading) {
    return (
      <section className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="flex items-center mb-5 text-xl font-semibold text-gray-700">
          <BellIcon className="w-6 h-6 mr-2 text-gray-400" />
          Actividad Reciente
        </h2>
        <div className="space-y-5 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 p-2 bg-gray-200 rounded-full"></div>
              <div className="flex-1 pt-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <section className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="flex items-center mb-5 text-xl font-semibold text-gray-700">
          <BellIcon className="w-6 h-6 mr-2 text-gray-400" />
          Actividad Reciente
        </h2>
        <div className="py-6 text-center">
          <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No hay actividad reciente.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="flex items-center mb-5 text-xl font-semibold text-gray-700">
        <BellIcon className="w-6 h-6 mr-2 text-gray-400" />
        Actividad Reciente
      </h2>
      <div className="flow-root">
        <ul role="list" className="-mb-4">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id} className="relative pb-6">
              {activityIdx !== activities.length - 1 ? (
                <div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex items-start space-x-4">
                <div className="p-2 bg-white rounded-full ring-8 ring-white">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {activity.description}
                    {activity.link && activity.link !== '#' && (
                      <Link href={activity.link} legacyBehavior>
                        <a className="ml-1 font-medium text-blue-600 hover:underline">Ver</a>
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {activities.length > 0 && (
        <div className="mt-6 text-center">
          <Link href="/dashboard/empresa/actividad" legacyBehavior>
            <a className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Ver toda la actividad
            </a>
          </Link>
        </div>
      )}
    </section>
  );
};

export default RecentActivityFeed;
