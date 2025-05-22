import Link from 'next/link';

const MedicalRecordsWidget = () => {
  // Simulación de expedientes médicos
  const records = [
    { id: 'r1', patient: 'Juan Pérez', href: '/dashboard/expedientes/r1' },
    { id: 'r2', patient: 'María López', href: undefined },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-2 text-lg font-semibold">Historial Médico</h2>
      {records.length === 0 ? (
        <div className="text-gray-500">No hay registros médicos.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {records.map((record) => (
            <li key={record.id} className="flex items-center justify-between py-2">
              <span>{record.patient}</span>
              {typeof record.href === 'string' && record.href ? (
                <Link href={record.href} className="text-sm text-blue-600 hover:underline">
                  Ver
                </Link>
              ) : (
                <span className="text-sm text-gray-400 cursor-not-allowed">Ver</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicalRecordsWidget;
