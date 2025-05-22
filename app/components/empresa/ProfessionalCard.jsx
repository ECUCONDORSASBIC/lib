import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const ProfessionalCard = ({ professional }) => {
  return (
    <div className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className="flex items-center justify-center w-12 h-12 mr-3 bg-blue-100 rounded-full">
            {professional.photo ? (
              <img
                src={professional.photo}
                alt={professional.name}
                className="object-cover w-12 h-12 rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-blue-600">{professional.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{professional.name}</h3>
            <p className="text-sm text-gray-500">{professional.specialty}</p>
          </div>
        </div>

        <div className="flex items-center mb-3">
          <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
          <span className="text-sm text-gray-600">{professional.location}</span>
        </div>

        <div className="flex items-center mb-4">
          <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
          <span className="text-sm font-medium">{professional.rating}</span>
          <span className="ml-1 text-sm text-gray-500">(32 reseñas)</span>
        </div>

        <div className="flex justify-between">
          <Link href={`/dashboard/profesionales/${professional.id}`}>
            <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded">
              Ver Perfil
            </button>
          </Link>

          <button className="text-sm border border-blue-600 text-blue-600 hover:bg-blue-50 py-1.5 px-3 rounded">
            Contactar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCard;
