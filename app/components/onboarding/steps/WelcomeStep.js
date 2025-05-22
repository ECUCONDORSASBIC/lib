
const WelcomeStep = ({ stepConfig }) => {
  // stepConfig might contain specific welcome messages per role if needed in the future
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">¡Bienvenido/a al proceso de Onboarding!</h2>
      <p className="text-gray-600 mb-2">
        Estamos emocionados de tenerte con nosotros. Este proceso te guiará para completar tu perfil y acceder a todas las funcionalidades de nuestra plataforma.
      </p>
      <p className="text-gray-600">
        Haz clic en &quot;Siguiente&quot; para comenzar.
      </p>
      {/*
        If you need to display role-specific welcome messages, you can access `role` from props
        and use `stepConfig` or `onboardingConfig` for custom content.
        Example: <p>{onboardingConfig[props.role]?.welcomeMessage}</p>
      */}
    </div>
  );
};

export default WelcomeStep;
