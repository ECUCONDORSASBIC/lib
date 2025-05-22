import { ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const JobPostingCard = ({ job }) => {
  return (
    <div className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg hover:shadow-md">
      <div className="p-5">
        <h3 className="mb-2 text-lg font-medium text-gray-800">{job.title}</h3>

        <div className="flex items-center mb-2 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span>{job.location}</span>
        </div>

        <div className="flex mb-4 space-x-3 text-sm text-gray-500">
          <div className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-1" />
            <span>{job.applications} postulaciones</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>Publicado: {job.postedAt}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            Activa
          </span>

          <Link href={`/dashboard/empresa/ofertas/${job.id}`}>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Ver Detalles
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobPostingCard;
