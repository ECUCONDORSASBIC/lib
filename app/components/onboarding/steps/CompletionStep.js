import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Using Heroicons

const CompletionStep = ({ stepConfig, role }) => {
  // stepConfig and role can be used to customize the message if needed

  return (
    <div className="text-center">
      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        ¡Proceso de Onboarding Completado!
      </h2>
      <p className="text-gray-600 mb-2">
        Gracias por completar tu perfil.
        {role === 'paciente' && " Ya puedes comenzar a buscar médicos y agendar citas."}
        {role === 'medico' && " Tu perfil está listo para ser visible por pacientes. Asegúrate de mantener tu disponibilidad actualizada."}
        {role === 'empresario' && " Tu cuenta de empresa ha sido configurada. Ya puedes gestionar tus servicios y facturación."}
      </p>
      <p className="text-gray-600">
        Serás redirigido a tu panel principal en breve, o puedes hacer clic en &quot;Finalizar&quot;.
      </p>
      {/* The "Finalizar" button is handled by OnboardingStepLayout */}
      {/* It will typically redirect to a dashboard or home page */}
    </div>
  );
};

export default CompletionStep;
