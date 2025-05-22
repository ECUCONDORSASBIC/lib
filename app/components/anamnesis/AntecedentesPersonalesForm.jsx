'use client';

import FormField from '@/app/components/ui/FormField';

// Componente para la entrada expandible (detalle cuando se marca sí)
const ExpandableEntry = ({ title, id, formData, updateData, placeholder = "" }) => {
  const hasCondition = formData[`tiene_${id}`] || false;

  const handleToggle = () => {
    const newValue = !hasCondition;
    updateData({
      [`tiene_${id}`]: newValue,
      // Si desmarcamos, limpiamos los detalles
      ...(newValue ? {} : { [`detalles_${id}`]: "" })
    });
  };

  const handleDetailsChange = (e) => {
    updateData({ [`detalles_${id}`]: e.target.value });
  };

  return (
    <div className="border-b border-gray-200 py-3 last:border-b-0">
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={hasCondition}
            onChange={handleToggle}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">{title}</span>
        </label>
      </div>

      {hasCondition && (
        <div className="mt-2 pl-7">
          <textarea
            value={formData[`detalles_${id}`] || ""}
            onChange={handleDetailsChange}
            rows={2}
            placeholder={placeholder}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      )}
    </div>
  );
};

// Componente para medicamentos actuales
const MedicacionComponent = ({ formData, updateData }) => {
  const medications = formData.medicamentos_actuales || [{ nombre: "", dosis: "", indicacion: "" }];

  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    updateData({ medicamentos_actuales: updatedMeds });
  };

  const handleAddMedication = () => {
    updateData({
      medicamentos_actuales: [...medications, { nombre: "", dosis: "", indicacion: "" }]
    });
  };

  const handleRemoveMedication = (index) => {
    const updatedMeds = [...medications];
    updatedMeds.splice(index, 1);
    updateData({ medicamentos_actuales: updatedMeds.length ? updatedMeds : [{ nombre: "", dosis: "", indicacion: "" }] });
  };

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">Medicamentos actuales</h3>

      {medications.map((med, index) => (
        <div key={index} className="p-3 border rounded-md mb-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Medicamento #{index + 1}</h4>
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMedication(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={med.nombre}
              onChange={(e) => handleMedicationChange(index, "nombre", e.target.value)}
              placeholder="Nombre del medicamento"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              value={med.dosis}
              onChange={(e) => handleMedicationChange(index, "dosis", e.target.value)}
              placeholder="Dosis (Ej: 500mg, 2 veces al día)"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
          <input
            type="text"
            value={med.indicacion}
            onChange={(e) => handleMedicationChange(index, "indicacion", e.target.value)}
            placeholder="¿Para qué lo toma? (Ej: presión alta, dolor de cabeza)"
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddMedication}
        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Añadir medicamento
      </button>
    </div>
  );
};

// Componente para alergias
const AlergiasComponent = ({ formData, updateData }) => {
  const alergias = formData.alergias || [{ tipo: "", reaccion: "" }];

  const handleAlergiaChange = (index, field, value) => {
    const updatedAlergias = [...alergias];
    updatedAlergias[index] = { ...updatedAlergias[index], [field]: value };
    updateData({ alergias: updatedAlergias });
  };

  const handleAddAlergia = () => {
    updateData({
      alergias: [...alergias, { tipo: "", reaccion: "" }]
    });
  };

  const handleRemoveAlergia = (index) => {
    const updatedAlergias = [...alergias];
    updatedAlergias.splice(index, 1);
    updateData({ alergias: updatedAlergias.length ? updatedAlergias : [{ tipo: "", reaccion: "" }] });
  };

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">Alergias</h3>

      {alergias.map((alergia, index) => (
        <div key={index} className="p-3 border rounded-md mb-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Alergia #{index + 1}</h4>
            {alergias.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveAlergia(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={alergia.tipo}
              onChange={(e) => handleAlergiaChange(index, "tipo", e.target.value)}
              placeholder="A qué es alérgico (Ej: Penicilina, polen, maní)"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              value={alergia.reaccion}
              onChange={(e) => handleAlergiaChange(index, "reaccion", e.target.value)}
              placeholder="Tipo de reacción (Ej: rash, dificultad para respirar)"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddAlergia}
        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Añadir alergia
      </button>
    </div>
  );
};

// Componente para cirugías previas
const CirugiasComponent = ({ formData, updateData }) => {
  const cirugias = formData.cirugias || [{ anio: "", procedimiento: "", complicaciones: "" }];

  const handleCirugiaChange = (index, field, value) => {
    const updatedCirugias = [...cirugias];
    updatedCirugias[index] = { ...updatedCirugias[index], [field]: value };
    updateData({ cirugias: updatedCirugias });
  };

  const handleAddCirugia = () => {
    updateData({
      cirugias: [...cirugias, { anio: "", procedimiento: "", complicaciones: "" }]
    });
  };

  const handleRemoveCirugia = (index) => {
    const updatedCirugias = [...cirugias];
    updatedCirugias.splice(index, 1);
    updateData({ cirugias: updatedCirugias.length ? updatedCirugias : [{ anio: "", procedimiento: "", complicaciones: "" }] });
  };

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 mb-2">Cirugías previas</h3>

      {cirugias.map((cirugia, index) => (
        <div key={index} className="p-3 border rounded-md mb-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Cirugía #{index + 1}</h4>
            {cirugias.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveCirugia(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="number"
              value={cirugia.anio}
              onChange={(e) => handleCirugiaChange(index, "anio", e.target.value)}
              placeholder="Año"
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              min="1900"
              max={new Date().getFullYear()}
            />
            <div className="md:col-span-2">
              <input
                type="text"
                value={cirugia.procedimiento}
                onChange={(e) => handleCirugiaChange(index, "procedimiento", e.target.value)}
                placeholder="Procedimiento (Ej: Apendicectomía, Cirugía de rodilla)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <input
            type="text"
            value={cirugia.complicaciones}
            onChange={(e) => handleCirugiaChange(index, "complicaciones", e.target.value)}
            placeholder="Complicaciones (si las hubo)"
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddCirugia}
        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Añadir cirugía
      </button>
    </div>
  );
};

const AntecedentesPersonalesForm = ({ formData = {}, updateData, errors = {} }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData({ [name]: type === 'checkbox' ? checked : value });
  };

  // Lista de condiciones médicas comunes
  const medicalConditions = [
    {
      id: "hipertension",
      title: "Hipertensión Arterial",
      placeholder: "Año de diagnóstico, medicamentos, control..."
    },
    {
      id: "diabetes",
      title: "Diabetes",
      placeholder: "Tipo 1 o 2, año de diagnóstico, tratamiento actual..."
    },
    {
      id: "cancer",
      title: "Cáncer",
      placeholder: "Tipo, año de diagnóstico, tratamiento recibido..."
    },
    {
      id: "cardiopatia",
      title: "Enfermedad Cardíaca",
      placeholder: "Tipo (infarto, arritmia, etc), año de diagnóstico..."
    },
    {
      id: "asma",
      title: "Asma o Enfermedad Pulmonar",
      placeholder: "Año de diagnóstico, desencadenantes, tratamiento..."
    },
    {
      id: "tiroides",
      title: "Problemas de Tiroides",
      placeholder: "Hipo/hipertiroidismo, año de diagnóstico, tratamiento..."
    },
    {
      id: "renal",
      title: "Enfermedad Renal",
      placeholder: "Tipo, año de diagnóstico, tratamiento..."
    },
    {
      id: "hepatica",
      title: "Enfermedad Hepática",
      placeholder: "Tipo, año de diagnóstico, tratamiento..."
    },
    {
      id: "autoinmune",
      title: "Enfermedad Autoinmune",
      placeholder: "Cuál (lupus, artritis reumatoide, etc), año de diagnóstico..."
    },
    {
      id: "mental",
      title: "Enfermedad Mental",
      placeholder: "Diagnóstico, año, tratamiento actual..."
    },
    {
      id: "neurologica",
      title: "Enfermedad Neurológica",
      placeholder: "Diagnóstico (epilepsia, migraña, etc), año..."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-1">Antecedentes Personales</h3>
        <p className="text-sm text-blue-600">
          Por favor, proporcione información sobre sus condiciones médicas previas, cirugías, alergias y medicamentos actuales. Esta información es crucial para que su médico comprenda su historial de salud completo.
        </p>
      </div>

      {/* Sección de enfermedades crónicas o condiciones médicas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Enfermedades y Condiciones Médicas</h3>
          <p className="text-sm text-gray-500">Marque las condiciones que le han diagnosticado y proporcione detalles</p>
        </div>
        <div className="p-4">
          {medicalConditions.map(condition => (
            <ExpandableEntry
              key={condition.id}
              id={condition.id}
              title={condition.title}
              formData={formData}
              updateData={updateData}
              placeholder={condition.placeholder}
            />
          ))}
          <ExpandableEntry
            id="otra_enfermedad"
            title="Otra enfermedad o condición médica"
            formData={formData}
            updateData={updateData}
            placeholder="Describe cualquier otra condición médica diagnosticada..."
          />
        </div>
      </div>

      {/* Componente de Cirugías */}
      <CirugiasComponent formData={formData} updateData={updateData} />

      {/* Componente de Alergias */}
      <AlergiasComponent formData={formData} updateData={updateData} />

      {/* Componente de Medicamentos */}
      <MedicacionComponent formData={formData} updateData={updateData} />

      <FormField
        label="¿Está actualmente en algún tratamiento médico no mencionado?"
        name="otros_tratamientos"
        type="textarea"
        value={formData.otros_tratamientos || ''}
        onChange={handleChange}
        error={errors.otros_tratamientos}
        placeholder="Describa otros tratamientos o terapias que esté recibiendo actualmente..."
        rows={3}
      />

      <FormField
        label="Información adicional sobre su historia médica"
        name="informacion_adicional"
        type="textarea"
        value={formData.informacion_adicional || ''}
        onChange={handleChange}
        error={errors.informacion_adicional}
        placeholder="Cualquier otra información relevante sobre su historial médico que considere importante..."
        rows={3}
      />
    </div>
  );
};

export default AntecedentesPersonalesForm;
