import React from 'react';

const JobOffersAccess = ({ offers = [] }) => (
  <div>
    {offers.length === 0 ? (
      <p className="py-2 text-sm text-gray-500">No hay nuevas ofertas laborales disponibles.</p>
    ) : (
      <ul className="overflow-y-auto divide-y divide-gray-200 max-h-48">
        {offers.map((offer, idx) => (
          <li key={idx} className="py-2.5 flex justify-between items-center">
            <span className="text-sm text-gray-800">{offer.title}</span>
            <a
              href={offer.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Ver Oferta
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default JobOffersAccess;
