'use client';

import { useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { getErrorReportingService } from '@/lib/errorReporting';

/**
 * Componente que inicializa el servicio de reportes de errores
 * Se debe usar una sola vez en el componente raíz de la aplicación
 */
export default function ErrorReportingInitializer() {
  const { user } = useUser();

  useEffect(() => {
    // Inicializar servicio de reportes de errores
    const errorService = getErrorReportingService();
    errorService.setupGlobalErrorHandlers();
    
    // Log informativo para confirmar inicialización
    console.log('Sistema de reportes de errores inicializado');
    
    return () => {
      // Nada que limpiar por ahora
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}
