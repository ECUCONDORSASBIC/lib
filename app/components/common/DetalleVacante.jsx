'use client';


const DetalleVacante = ({ vacante }) => {
  if (!vacante) {
    return <p className="text-center text-gray-500">No se ha seleccionado ninguna vacante.</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-2xl font-semibold text-gray-800">{vacante.titulo}</h3>

      <div className="space-y-3">
        <div>
          <span className="font-semibold text-gray-700">Ubicación:</span>
          <p className="text-gray-600">{vacante.ubicacion?.full || vacante.ubicacion?.ciudad || 'No especificada'}</p>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Tipo de Contrato:</span>
          <p className="text-gray-600">{vacante.tipoContrato || 'No especificado'}</p>
        </div>

        {vacante.rangoSalarial && (
          <div>
            <span className="font-semibold text-gray-700">Salario:</span>
            <p className="text-gray-600">
              {vacante.rangoSalarial.min && vacante.rangoSalarial.max
                ? `${vacante.rangoSalarial.min} - ${vacante.rangoSalarial.max} ${vacante.rangoSalarial.moneda || ''}`
                : 'No especificado'}
            </p>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Modalidad:</span>
          <p className="text-gray-600">{vacante.modalidadTrabajo || 'No especificada'}</p>
        </div>

        {vacante.descripcion && (
          <div>
            <span className="font-semibold text-gray-700">Descripción:</span>
            <div
              className="mt-1 prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: vacante.descripcion }}
            />
          </div>
        )}

        {vacante.requisitos && vacante.requisitos.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Requisitos:</span>
            <ul className="mt-1 ml-5 text-gray-600 list-disc">
              {vacante.requisitos.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {vacante.empresaNombre && (
          <div>
            <span className="font-semibold text-gray-700">Empresa:</span>
            <p className="text-gray-600">{vacante.empresaNombre}</p>
          </div>
        )}

        {vacante.fechaPublicacion && (
          <div>
            <span className="font-semibold text-gray-700">Fecha de Publicación:</span>
            <p className="text-gray-600">{new Date(vacante.fechaPublicacion.seconds * 1000).toLocaleDateString()}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default DetalleVacante;
