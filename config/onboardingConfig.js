const rolesConfig = {
  paciente: {
    name: "Paciente",
    defaultPath: "/dashboard/paciente",
    requiresId: true,
  },
  empresa: {
    name: "Empleador",
    defaultPath: "/dashboard/empresa",
  },
  medico: {
    name: "Médico",
    defaultPath: "/dashboard/medico",
    requiresId: true,
  },
  administrador: {
    name: "Administrador",
    defaultPath: "/dashboard/admin",
  },
  superusuario: {
    name: "Superusuario",
    defaultPath: "/dashboard/superuser",
  },
};

// Helper function to get the default path for a given role
export const getRoleDefaultPath = (role, uid = null) => {
  const config = rolesConfig[role];
  if (!config) {
    console.warn(`Rol desconocido: ${role}. Redirigiendo a /dashboard.`);
    return '/dashboard';
  }

  // Si el rol requiere ID y se proporciona un UID, añadirlo a la ruta
  if (config.requiresId && uid) {
    return `${config.defaultPath}/${uid}`;
  }

  return config.defaultPath;
};

export default rolesConfig;
