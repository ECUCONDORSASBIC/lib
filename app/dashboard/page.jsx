'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { ArrowRightIcon, BriefcaseIcon, BuildingOffice2Icon, CheckBadgeIcon, IdentificationIcon, LightBulbIcon, UserIcon, ChevronRightIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardCustomizer from './components/DashboardCustomizer';
import { initialize } from '@/services/unifiedAIService';
import { motion } from 'framer-motion';

/**
 * Dashboard page that includes a customizable dashboard with AI observability metrics
 */
const DashboardLandingPage = () => {
  const { user, userData, loading, refreshUserDataAndToken } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAttemptedNavigation = useRef(false);
  const [initialized, setInitialized] = useState(false);

  const roleColors = {
    paciente: 'bg-blue-50 hover:bg-blue-100 focus:ring-blue-300',
    medico: 'bg-white hover:bg-gray-50 focus:ring-gray-300',
    empresa: 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-700 text-gray-200'
  };

  useEffect(() => {
    // Prevent excessive navigation attempts
    if (hasAttemptedNavigation.current) return;

    if (user && userData && userData.role) {
      console.log(`[Dashboard] Navigating based on role: ${userData.role}`);
      hasAttemptedNavigation.current = true;

      // Add a small timeout to prevent rapid consecutive navigation attempts
      const timer = setTimeout(() => {
        if (userData.role === 'paciente') {
          router.push(`/dashboard/paciente/${user.uid}`);
        }
        else if (userData.role === 'medico') {
          router.push(`/dashboard/medico`);
        }
        else if (userData.role === 'empresa') {
          router.push(`/dashboard/empresa/${user.uid}`);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, userData, router]);

  useEffect(() => {
    if (!initialized && !loading && user) {
      initialize({
        observability: {
          // Aquí podrías incluir configuraciones para Firebase, LogRocket, Sentry, etc.
        },
        session: {
          userId: user.uid,
          userEmail: user.email,
        }
      });
      setInitialized(true);
    }
  }, [user, loading, initialized]);

  const handleRoleSelection = async (role) => {
    await handleSubmitRole(role);
  };

  const handleSubmitRole = async (roleToSubmit) => {
    if (!roleToSubmit) {
      toast.error('Por favor, selecciona un rol.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error('No estás autenticado. Por favor, inicia sesión.');
        setIsSubmitting(false);
        router.push('/login');
        return;
      }
      const idToken = await user.getIdToken();

      // Mostrar un mensaje de carga con más detalles sobre el proceso
      toast.loading('Configurando tu experiencia personalizada...', {
        duration: 3000,
        position: 'top-center',
      });

      const response = await fetch('/api/user/set-initial-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ role: roleToSubmit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el rol.');
      }

      toast.success('¡Rol configurado correctamente!', {
        duration: 2000,
        icon: '🎉',
      });
      
      // Mostrar otro mensaje para indicar que se está redirigiendo
      toast.loading('Preparando tu dashboard personalizado...', {
        duration: 2000,
        position: 'top-center',
      });
      
      if (refreshUserDataAndToken) {
        await refreshUserDataAndToken();
      }
      
      // Pequeña pausa para mostrar el mensaje de éxito antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirección automática al dashboard correspondiente
      if (roleToSubmit === 'paciente') {
        router.push(`/dashboard/paciente/${user.uid}`);
      } else if (roleToSubmit === 'medico') {
        router.push(`/dashboard/medico`);
      } else if (roleToSubmit === 'empresa') {
        router.push(`/dashboard/empresa/${user.uid}`);
      }
    } catch (error) {
      console.error('Error setting role:', error);
      toast.error(error.message || 'No se pudo guardar el rol.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100">
        <p className="text-xl text-gray-700">Cargando tu información...</p>
      </div>
    );
  }

  if (user && userData && !userData.role) {
    const availableRoles = [
      { id: 'paciente', name: 'Soy un Paciente', icon: <UserIcon className="w-10 h-10 mx-auto mb-2 text-blue-600" /> },
      { id: 'medico', name: 'Soy un Profesional Médico', icon: <BriefcaseIcon className="w-10 h-10 mx-auto mb-2 text-green-600" /> },
      { id: 'empresa', name: 'Represento una Empresa/Clínica', icon: <BuildingOffice2Icon className="w-10 h-10 mx-auto mb-2 text-indigo-600" /> },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center bg-gradient-to-br from-blue-50 via-blue-50 to-sky-100 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl">
            <IdentificationIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">¡Bienvenido, {userData.name || user.email}!</h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed">
              Para continuar y personalizar tu experiencia, por favor selecciona el rol que mejor te describe.
            </p>
            <div className="flex items-center justify-center mt-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full">
                <SparklesIcon className="w-4 h-4 mr-1" />
                Selección única
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-5xl"
        >
          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
            {availableRoles.map((roleInfo, index) => (
              <motion.button
                key={roleInfo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                onClick={() => handleRoleSelection(roleInfo.id)}
                disabled={isSubmitting}
                className={`relative p-10 rounded-xl shadow-lg text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden
                  ${roleColors[roleInfo.id] || ''}
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <UserGroupIcon className="w-32 h-32 -mt-10 -mr-10 text-gray-700" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white shadow-md">
                    {roleInfo.icon}
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-gray-800">{roleInfo.name}</h2>
                  <div className="flex items-center justify-center mt-6">
                    <span className="flex items-center text-sm font-medium text-blue-700">
                      Seleccionar
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="p-8 bg-white rounded-xl shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
                  <span className="sr-only">Cargando...</span>
                </div>
                <p className="text-lg font-medium text-gray-700">Guardando tu selección y preparando tu dashboard personalizado...</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  const sections = [
    {
      id: 'paciente',
      role: 'Pacientes',
      icon: <UserIcon className="w-12 h-12 text-blue-600" />,
      title: 'Atención Médica Centrada en Ti',
      benefits: [
        'Atención médica sin barreras: Acceso a especialistas desde casa y reducción de tiempos de espera.',
        'Control proactivo de tu salud: Herramientas para el seguimiento de enfermedades crónicas y recordatorios personalizados.',
        'Experiencia personalizada y amigable: Una plataforma intuitiva con acceso a tu historial, resultados y módulos educativos.',
        'Mayor satisfacción: Únete a los pacientes que experimentan una mejora significativa en su atención.',
      ],
      cta: user ? 'Ir a mi Dashboard de Paciente' : 'Acceder como Paciente',
      link: user && userData?.role === 'paciente' ? `/dashboard/paciente/${user.uid}` : (user ? '#' : '/login?role=paciente'),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-400',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      disabled: user && userData?.role && userData.role !== 'paciente',
    },
    {
      id: 'medico',
      role: 'Médicos',
      icon: <BriefcaseIcon className="w-12 h-12 text-gray-600" />,
      title: 'Potenciando Tu Práctica Médica',
      benefits: [
        'Optimiza tu tiempo clínico: Reduce tareas administrativas y dedica más tiempo a tus pacientes.',
        'Herramientas diagnósticas avanzadas: Apoyo de IA para diagnósticos más precisos y planes de tratamiento efectivos.',
        'Seguimiento eficiente de pacientes: Monitoreo remoto y protocolos estructurados para una mejor continuidad asistencial.',
        'Colaboración multidisciplinaria: Facilita la interconsulta y el trabajo en equipo.',
      ],
      cta: user ? 'Ir a mi Dashboard de Médico' : 'Acceder como Médico',
      link: user && userData?.role === 'medico' ? `/dashboard/medico` : (user ? '#' : '/login?role=medico'),
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      buttonColor: 'bg-gray-700 hover:bg-gray-800',
      disabled: user && userData?.role && userData.role !== 'medico',
    },
    {
      id: 'empresa',
      role: 'Empresas',
      icon: <BuildingOffice2Icon className="w-12 h-12 text-gray-200" />,
      title: 'Transformando la Gestión de Salud',
      benefits: [
        'Mejora la eficiencia operativa: Optimiza recursos y reduce costos operativos y hospitalizaciones evitables.',
        'Incrementa la capacidad de atención: Atiende a más pacientes con los mismos recursos gracias a la optimización del tiempo.',
        'Retorno de Inversión Comprobado: Implementa soluciones con un ROI proyectado significativo en menos de 12 meses.',
        'Liderazgo e Innovación: Posiciona tu institución a la vanguardia de la transformación digital en salud.',
      ],
      cta: user ? 'Ir a mi Dashboard de Empresa' : 'Acceder como Empresa',
      link: user && userData?.role === 'empresa' ? `/dashboard/empresa/${user.uid}` : (user ? '#' : '/login?role=empresa'),
      bgColor: 'bg-gray-900',
      textColor: 'text-gray-200',
      borderColor: 'border-gray-700',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
      disabled: user && userData?.role && userData.role !== 'empresa',
      benefitTextColor: 'text-gray-300',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 via-blue-50 to-sky-100 sm:px-6 lg:px-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-30"></div>
            <h1 className="relative text-5xl font-extrabold text-gray-800 sm:text-6xl">
              Bienvenido a <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Altamedic</span>
            </h1>
          </div>
        </div>
        <p className="max-w-3xl mx-auto mt-6 text-xl text-gray-600 leading-relaxed">
          Tu portal integral para una salud conectada, eficiente y personalizada. Descubre cómo transformamos la atención médica.
        </p>
        {user && userData?.role && (
          <div className="inline-flex items-center px-4 py-2 mt-6 space-x-2 bg-white rounded-full shadow-md">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <p className="text-lg font-medium text-gray-700">
              Rol actual: <span className="font-semibold text-green-700">{userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</span>
            </p>
          </div>
        )}
      </motion.header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 gap-10 mx-auto max-w-7xl md:grid-cols-3"
      >
        {sections.map((section, index) => (
          <motion.div
            key={section.role}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
            whileHover={!section.disabled ? { y: -10 } : {}}
            className={`rounded-xl shadow-2xl p-8 flex flex-col ${section.bgColor} border-t-4 ${section.borderColor} transition-all duration-300 ${section.disabled ? 'opacity-60' : ''}`}
          >
            <div className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 opacity-10">
                <UserGroupIcon className="w-full h-full text-black" />
              </div>
            </div>

            <div className="flex-shrink-0 mb-6 text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white shadow-md">
                {section.icon}
              </div>
              <h2 className={`mt-4 text-3xl font-bold ${section.textColor}`}>
                {section.role}
              </h2>
              <div className="w-16 h-1 mx-auto my-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <p className={`mt-1 text-md font-medium ${section.textColor} opacity-80`}>{section.title}</p>
            </div>

            <ul className="flex-grow mb-8 space-y-4">
              {section.benefits.map((benefit, index) => (
                <motion.li 
                  key={index} 
                  className={`flex items-start p-3 rounded-lg transition-all duration-200 ${section.id === 'empresa' ? 'hover:bg-gray-800' : 'hover:bg-white hover:bg-opacity-50'}`}
                  whileHover={{ x: 5 }}
                >
                  <CheckBadgeIcon className={`flex-shrink-0 w-6 h-6 ${section.id === 'empresa' ? 'text-indigo-400' : section.textColor} mr-3`} />
                  <span className={`text-sm ${section.id === 'empresa' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto text-center">
              <Link href={section.disabled ? '#' : section.link} legacyBehavior passHref>
                <a className={`relative w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white ${section.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 shadow-lg
                    ${section.disabled ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400' : 'transition-all duration-300 overflow-hidden'}`}>
                  <span className="relative z-10 flex items-center">
                    {section.cta}
                    {!section.disabled && <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />}
                  </span>
                  {!section.disabled && (
                    <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-white opacity-20 group-hover:h-full"></span>
                  )}
                </a>
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="py-10 mt-24 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-4 py-3 bg-white rounded-full shadow-md">
              <LightBulbIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <p className="max-w-xl mx-auto mt-6 text-lg font-semibold text-gray-600">
          Innovación y Cuidado a Tu Alcance
        </p>
        <p className="mt-2 text-sm text-gray-500">
          © {new Date().getFullYear()} Altamedic. Todos los derechos reservados.
        </p>
        
        <div className="flex items-center justify-center mt-6 space-x-4">
          <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
            <span className="sr-only">Política de Privacidad</span>
            Política de Privacidad
          </a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
            <span className="sr-only">Términos de Uso</span>
            Términos de Uso
          </a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
            <span className="sr-only">Contacto</span>
            Contacto
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default DashboardLandingPage;
