import { useAnamnesisForm } from '@/hooks/useAnamnesisForm';
import { useAuth } from '@/hooks/useAuth'; // Asumiendo que tienes un hook de autenticación
import { useState } from 'react';

const AnamnesisForm = ({ patientId }) => {
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);

  // Configuración de pasos del formulario
  const formStepsConfig = [
    {
      id: 'datos-personales',
      title: 'Datos Personales',
      description: 'Información básica del paciente'
    },
    {
      id: 'motivo-consulta',
      title: 'Motivo de Consulta',
      description: 'Razón principal de la visita'
    },
    {
      id: 'antecedentes',
      title: 'Antecedentes',
      description: 'Historia clínica previa'
    }
  ];

  const {
    loading,
    error,
    formData,
    currentStep,
    completedSteps,
    formSteps,
    showSummary,
    confirmVeracity,
    isAnamnesisCompleted,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateStepData,
    handleSave,
    handleSubmit,
    setConfirmVeracity
  } = useAnamnesisForm(patientId, user, formStepsConfig);

  // Manejador para guardar y avanzar
  const handleSaveAndContinue = async () => {
    const result = await handleSave();
    if (result.success) {
      setNotification({ type: 'success', message: 'Datos guardados correctamente' });
      goToNextStep();
    } else {
      setNotification({ type: 'error', message: result.message || 'Error al guardar' });
    }

    // Auto-ocultar notificación después de 3 segundos
    setTimeout(() => setNotification(null), 3000);
  };

  // Manejador para envío final
  const handleFormSubmit = async () => {
    const result = await handleSubmit();
    if (result.success) {
      setNotification({ type: 'success', message: 'Anamnesis completada correctamente' });
    } else {
      setNotification({ type: 'error', message: result.message || 'Error al enviar' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar el paso actual del formulario
  const renderCurrentStep = () => {
    if (showSummary) {
      return renderSummary();
    }

    const currentStepConfig = formSteps[currentStep];
    const stepData = formData[currentStepConfig.id] || {};

    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          {currentStepConfig.title}
        </h2>
        <p className="text-gray-500 mb-6">{currentStepConfig.description}</p>

        {currentStepConfig.id === 'datos-personales' && (
          <DatosPersonalesForm
            data={stepData}
            onUpdate={(data) => updateStepData(currentStepConfig.id, data)}
          />
        )}        {currentStepConfig.id === 'motivo-consulta' && (
          <MotivoConsultaSimpleForm
            data={stepData}
            onUpdate={(data) => updateStepData(currentStepConfig.id, data)}
          />
        )}

        {currentStepConfig.id === 'antecedentes' && (
          <AntecedentesForm
            data={stepData}
            onUpdate={(data) => updateStepData(currentStepConfig.id, data)}
          />
        )}
      </div>
    );
  };

  // Renderizar resumen final
  const renderSummary = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Resumen de la Anamnesis
        </h2>

        {formSteps.map((step) => (
          <div key={step.id} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-700">{step.title}</h3>
              <button
                onClick={() => goToStep(formSteps.findIndex(s => s.id === step.id))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Editar
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              {renderStepSummary(step.id)}
            </div>
          </div>
        ))}

        <div className="mt-8 border-t pt-4">
          <label className="flex items-start mb-4">
            <input
              type="checkbox"
              checked={confirmVeracity}
              onChange={(e) => setConfirmVeracity(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Confirmo que toda la información proporcionada es correcta y verídica al momento de esta consulta.
            </span>
          </label>
        </div>
      </div>
    );
  };

  // Renderizar resumen para cada paso
  const renderStepSummary = (stepId) => {
    const stepData = formData[stepId] || {};

    if (Object.keys(stepData).length === 0) {
      return <p className="text-gray-500 italic">No se proporcionó información</p>;
    }

    return (
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {Object.entries(stepData).map(([key, value]) => (
          <div key={key} className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">{formatFieldName(key)}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatFieldValue(value)}</dd>
          </div>
        ))}
      </dl>
    );
  };

  // Formatear nombres de campos para mostrarlos
  const formatFieldName = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/_/g, ' ');
  };

  // Formatear valores
  const formatFieldValue = (value) => {
    if (value === true) return 'Sí';
    if (value === false) return 'No';
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object' && value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Notificación */}
      {notification && (
        <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progreso: {completedSteps.length} de {formSteps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((completedSteps.length / formSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / formSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Steps navigation */}
      <div className="mb-6 border-b">
        <nav className="flex flex-wrap -mb-px">
          {formSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              disabled={!completedSteps.includes(step.id) && index !== currentStep}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${index === currentStep
                ? 'border-blue-500 text-blue-600'
                : completedSteps.includes(step.id)
                  ? 'border-transparent text-gray-700 hover:border-gray-300'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
                }`}
            >
              <span className="flex items-center">
                <span className={`mr-2 flex h-5 w-5 items-center justify-center rounded-full ${completedSteps.includes(step.id)
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 text-gray-500'
                  }`}>
                  {index + 1}
                </span>
                {step.title}
              </span>
            </button>
          ))}
          <button
            onClick={() => goToStep(currentStep)}
            disabled={completedSteps.length < formSteps.length && !showSummary}
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${showSummary
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
          >
            <span className="flex items-center">
              <span className={`mr-2 flex h-5 w-5 items-center justify-center rounded-full ${showSummary ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                ✓
              </span>
              Resumen
            </span>
          </button>
        </nav>
      </div>

      {/* Form content */}
      {renderCurrentStep()}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0 && !showSummary}
          className={`px-4 py-2 rounded-md text-sm font-medium ${currentStep === 0 && !showSummary
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          Anterior
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Guardar
          </button>

          {showSummary ? (
            <button
              onClick={handleFormSubmit}
              disabled={!confirmVeracity || isAnamnesisCompleted}
              className={`px-4 py-2 rounded-md text-sm font-medium ${!confirmVeracity || isAnamnesisCompleted
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {isAnamnesisCompleted ? 'Enviado' : 'Enviar anamnesis'}
            </button>
          ) : (
            <button
              onClick={handleSaveAndContinue}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Guardar y continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componentes de formulario para cada paso
// Estos serían implementados por separado
const DatosPersonalesForm = ({ data, onUpdate }) => {
  // Implementación del formulario de datos personales
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={data.nombre || ''}
          onChange={(e) => onUpdate({ ...data, nombre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">DNI</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={data.dni || ''}
          onChange={(e) => onUpdate({ ...data, dni: e.target.value })}
        />
      </div>
      {/* Más campos aquí */}
    </div>
  );
};

const MotivoConsultaSimpleForm = ({ data, onUpdate }) => {
  // Implementación del formulario de motivo de consulta
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Motivo principal</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          value={data.motivo || ''}
          onChange={(e) => onUpdate({ ...data, motivo: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">¿Desde cuándo presenta estos síntomas?</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={data.tiempoSintomas || ''}
          onChange={(e) => onUpdate({ ...data, tiempoSintomas: e.target.value })}
        />
      </div>
      {/* Más campos aquí */}
    </div>
  );
};

const AntecedentesForm = ({ data, onUpdate }) => {
  // Implementación del formulario de antecedentes
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Antecedentes médicos personales</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          value={data.antecedentesMedicos || ''}
          onChange={(e) => onUpdate({ ...data, antecedentesMedicos: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Antecedentes familiares</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          value={data.antecedentesFamiliares || ''}
          onChange={(e) => onUpdate({ ...data, antecedentesFamiliares: e.target.value })}
        />
      </div>
      {/* Más campos aquí */}
    </div>
  );
};

export default AnamnesisForm;
