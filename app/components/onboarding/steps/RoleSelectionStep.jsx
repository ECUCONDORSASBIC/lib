"use client";

import { useEffect, useState } from 'react';

const roles = [
  { id: 'employer', label: 'Soy una Empresa', description: 'Quiero gestionar perfiles y servicios para mi organización.' },
  { id: 'doctor', label: 'Soy un Médico', description: 'Quiero ofrecer mis servicios y gestionar pacientes.' },
  { id: 'patient', label: 'Soy un Paciente', description: 'Quiero acceder a servicios de salud y gestionar mi información.' },
];

export default function RoleSelectionStep({ onDataChange, formData }) {
  const [selectedRole, setSelectedRole] = useState(formData?.selectedRole || '');

  useEffect(() => {
    if (formData?.selectedRole) {
      setSelectedRole(formData.selectedRole);
    }
  }, [formData]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    onDataChange({ selectedRole: roleId });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">Selecciona tu Rol</h2>
      <p className="text-gray-600">
        Para personalizar tu experiencia, por favor, indícanos qué tipo de usuario eres.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className={`p-6 border rounded-lg text-left transition-all duration-200 ease-in-out transform hover:scale-105
                        ${selectedRole === role.id
                ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-300 hover:border-gray-400 hover:shadow-md bg-white'
              }`}
          >
            <h3 className={`text-lg font-medium ${selectedRole === role.id ? 'text-blue-700' : 'text-gray-800'}`}>{role.label}</h3>
            <p className={`mt-1 text-sm ${selectedRole === role.id ? 'text-blue-600' : 'text-gray-500'}`}>{role.description}</p>
          </button>
        ))}
      </div>
      {selectedRole && (
        <p className="mt-6 text-center text-gray-600">
          Has seleccionado: <span className="font-semibold text-blue-700">{roles.find(r => r.id === selectedRole)?.label}</span>.
          <br />Haz clic en &quot;Confirmar Rol y Continuar&quot; para seguir.
        </p>
      )}
      {!selectedRole && (
        <p className="mt-6 text-center text-red-600 font-medium">
          Por favor, selecciona un rol para continuar.
        </p>
      )}
    </div>
  );
}
