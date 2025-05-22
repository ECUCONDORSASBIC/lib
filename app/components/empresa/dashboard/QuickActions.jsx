import { BriefcaseIcon, CogIcon, PlusIcon, UsersIcon, UserGroupIcon, BuildingOfficeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

const QuickActions = () => {
  const { user, userData } = useAuth();
  const [userRole, setUserRole] = useState('owner'); // Default to highest role for now
  const [companyVerified, setCompanyVerified] = useState(false);

  // Check company verification status and user's role
  useEffect(() => {
    const checkCompanyStatus = async () => {
      if (user?.uid) {
        // In a real implementation, we would fetch the verification status and user role from the services
        // For now, we'll simulate that the company is verified and user has owner role
        setCompanyVerified(true);

        // Simulating role check - in real implementation this would come from a service
        // getCompanyMemberRole(user.uid, user.uid) or similar
        setUserRole('owner');
      }
    };

    checkCompanyStatus();
  }, [user]);

  // Define actions based on user role
  const getAvailableActions = () => {
    // Base actions available to all company members
    const baseActions = [
      {
        name: 'Nueva Oferta',
        href: '/dashboard/empresa/ofertas/nueva',
        icon: PlusIcon,
        bgColor: 'bg-blue-500 hover:bg-blue-600',
        permissions: ['manage_job_postings']
      },
      {
        name: 'Ver Postulantes',
        href: '/dashboard/empresa/postulantes',
        icon: UsersIcon,
        bgColor: 'bg-green-500 hover:bg-green-600',
        permissions: ['view_all_applications', 'manage_job_postings']
      },
      {
        name: 'Gestionar Ofertas',
        href: '/dashboard/empresa/ofertas',
        icon: BriefcaseIcon,
        bgColor: 'bg-indigo-500 hover:bg-indigo-600',
        permissions: ['manage_job_postings']
      },
      {
        name: 'Perfil Empresa',
        href: '/dashboard/configuracion?tab=empresa',
        icon: CogIcon,
        bgColor: 'bg-gray-500 hover:bg-gray-600',
        permissions: ['view_own_data']
      },
    ];

    // Additional actions for admin roles
    const adminActions = [{
      name: 'Equipo',
      href: '/dashboard/empresa/miembros',
      icon: UserGroupIcon,
      bgColor: 'bg-purple-500 hover:bg-purple-600',
      permissions: ['manage_members']
    },
    {
      name: 'Departamentos',
      href: '/dashboard/empresa/departamentos',
      icon: BuildingOfficeIcon,
      bgColor: 'bg-yellow-500 hover:bg-yellow-600',
      permissions: ['create_department']
    },
    {
      name: 'Verificación',
      href: '/dashboard/empresa/verificacion',
      icon: IdentificationIcon,
      bgColor: !companyVerified ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600',
      permissions: ['manage_verification']
    }
    ];

    // Filter actions based on user role permissions
    // In a real implementation, we would check against actual permissions from the role
    const rolePermissions = getRolePermissions(userRole);

    const filteredBaseActions = baseActions.filter(action =>
      action.permissions.some(perm => rolePermissions.includes(perm))
    );

    const filteredAdminActions = adminActions.filter(action =>
      action.permissions.some(perm => rolePermissions.includes(perm))
    );

    return [...filteredBaseActions, ...filteredAdminActions];
  };

  // Helper function to get permissions for a role
  const getRolePermissions = (role) => {
    // In a real implementation, this would come from companyRoleUtils or a similar service
    const permissions = {
      owner: [
        'manage_billing', 'delete_company', 'manage_verification', 'manage_members',
        'assign_roles', 'create_department', 'view_all_stats', 'manage_job_postings',
        'view_all_applications', 'manage_medical_programs', 'view_aggregated_health_data',
        'view_own_data', 'access_medical_services'
      ],
      admin: [
        'manage_members', 'assign_roles', 'create_department', 'view_all_stats',
        'manage_job_postings', 'view_all_applications', 'manage_medical_programs',
        'view_aggregated_health_data', 'view_own_data', 'access_medical_services'
      ],
      hr_manager: [
        'manage_job_postings', 'view_all_applications', 'manage_medical_programs',
        'view_aggregated_health_data', 'view_own_data', 'access_medical_services'
      ],
      department_head: [
        'view_department_stats', 'manage_department_members',
        'view_own_data', 'access_medical_services'
      ],
      employee: [
        'view_own_data', 'access_medical_services'
      ]
    };

    return permissions[role] || permissions.employee;
  };

  const actions = getAvailableActions();

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`group flex flex-col items-center justify-center p-4 rounded-lg text-white text-center transition-colors duration-150 ease-in-out ${action.bgColor}`}
          >
            <action.icon className="w-8 h-8 mb-2" aria-hidden="true" />
            <span className="text-sm font-medium">{action.name}</span>
          </Link>
        ))}
      </div>

      {/* Show verification warning if company is not verified */}
      {!companyVerified && userRole === 'owner' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-700">
            Su empresa aún no está verificada. Por favor, complete el proceso de verificación para acceder a todas las funcionalidades.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
