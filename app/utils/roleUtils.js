/**
 * Utilidades para la gestión y estandarización de roles
 */

// Mapeo de roles en el sistema
export const ROLES = {
    PATIENT: 'paciente',
    DOCTOR: 'medico',
    COMPANY: 'empresa',
    ADMIN: 'admin',
    SUPERUSER: 'superuser'
};

// Función para normalizar el rol del usuario
export const normalizeRole = (role) => {
    switch (role?.toLowerCase()) {
        case 'patient':
        case 'paciente':
            return ROLES.PATIENT;
        case 'doctor':
        case 'medico':
        case 'médico':
            return ROLES.DOCTOR;
        case 'company':
        case 'empresa':
        case 'employer':
            return ROLES.COMPANY;
        case 'admin':
        case 'administrator':
            return ROLES.ADMIN;
        case 'superuser':
        case 'super':
            return ROLES.SUPERUSER;
        default:
            return null;
    }
};

// Obtener la ruta base del dashboard según el rol
export const getDashboardBaseUrl = (role, uid = null) => {
    const normalizedRole = normalizeRole(role);

    switch (normalizedRole) {
        case ROLES.PATIENT:
            return uid ? `/dashboard/paciente/${uid}` : '/dashboard/paciente';
        case ROLES.DOCTOR:
            return uid ? `/dashboard/medico/${uid}` : '/dashboard/medico';
        case ROLES.COMPANY:
            return '/dashboard/empresa';
        case ROLES.ADMIN:
        case ROLES.SUPERUSER:
            return '/dashboard/admin';
        default:
            return '/dashboard';
    }
};
