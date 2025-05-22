import Image from 'next/image';

export default function RoleSelector({ onRoleSelect }) {
  const roles = [
    {
      id: 'patient',
      name: 'Paciente',
      icon: '/icons/patient.svg',
      description: 'Accede a tu historia clínica, gestiona tus citas médicas y consulta resultados de exámenes.',
      color: 'bg-blue-100 hover:bg-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'doctor',
      name: 'Médico',
      icon: '/icons/doctor.svg',
      description: 'Consulta historias clínicas, registra anamnesis y gestiona tus pacientes de manera eficiente.',
      color: 'bg-green-100 hover:bg-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'employer',
      name: 'Empresa',
      icon: '/icons/company.svg',
      description: 'Gestiona perfiles médicos, oferta y coordina servicios de salud para tus colaboradores.',
      color: 'bg-purple-100 hover:bg-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">¿Cómo deseas ingresar?</h2>
      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role)}
            className={`w-full p-4 rounded-lg ${role.color} transition-colors flex items-center cursor-pointer`}
          >
            <div className={`mr-4 rounded-full p-3 ${role.iconColor} bg-white`}>
              <Image
                src={role.icon}
                alt={role.name}
                width={32}
                height={32}
              />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">{role.name}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 text-sm text-center text-gray-500">
        <p>¿No tienes una cuenta? <a href="/registro" className="text-blue-600 hover:underline">Regístrate aquí</a></p>
      </div>
    </div>
  );
}
