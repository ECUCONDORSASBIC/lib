'use client';

import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

/**
 * Componente para alertar sobre contradicciones en las respuestas de anamnesis
 * 
 * @param {Object} props
 * @param {Object} props.contradiction - Objeto con información sobre la contradicción
 * @param {string} props.previousAnswer - Respuesta anterior contradictoria
 * @param {string} props.currentAnswer - Respuesta actual contradictoria
 * @param {Function} props.onResolve - Función para resolver la contradicción
 */
const ContradictionAlert = ({ 
  contradiction, 
  previousAnswer, 
  currentAnswer, 
  onResolve 
}) => {
  // Variantes para animación
  const variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  };

  return (
    <motion.div 
      className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Posible inconsistencia detectada
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              {contradiction.description || 'Se ha detectado una inconsistencia entre sus respuestas.'}
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><span className="font-medium">Anteriormente:</span> "{previousAnswer}"</li>
              <li><span className="font-medium">Ahora:</span> "{currentAnswer}"</li>
            </ul>
          </div>
          <div className="mt-3">
            <p className="text-xs text-amber-800 mb-2">
              Por favor, ayúdenos a aclarar esta información:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onResolve('previous')}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <CheckCircleIcon className="mr-1 h-4 w-4" />
                Mantener respuesta anterior
              </button>
              <button
                type="button"
                onClick={() => onResolve('current')}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <CheckCircleIcon className="mr-1 h-4 w-4" />
                Usar respuesta actual
              </button>
              <button
                type="button"
                onClick={() => onResolve('both', true)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ambas son correctas, explicar
              </button>
              <button
                type="button"
                onClick={() => onResolve('neither', true)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Ninguna es correcta, corregir
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContradictionAlert;
