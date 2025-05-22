'use client';

import { useState, useRef, useEffect } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar tooltips con explicaciones de términos médicos
 * 
 * @param {Object} props
 * @param {string} props.term - El término médico a explicar
 * @param {string} props.definition - La definición o explicación del término
 * @param {string} props.children - Contenido alternativo a mostrar en lugar del término
 * @param {string} props.source - Fuente de la información (opcional)
 * @param {string} props.position - Posición del tooltip (top, bottom, left, right)
 */
const MedicalTermTooltip = ({ 
  term, 
  definition, 
  children, 
  source,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  
  // Posicionar el tooltip correctamente
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Ajustar posición si está fuera de la pantalla
      if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
        tooltipRef.current.style.top = 'auto';
        tooltipRef.current.style.bottom = '-0.5rem';
        tooltipRef.current.style.transform = 'translate(-50%, 100%)';
      } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewportHeight) {
        tooltipRef.current.style.bottom = 'auto';
        tooltipRef.current.style.top = '-0.5rem';
        tooltipRef.current.style.transform = 'translate(-50%, -100%)';
      } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
        tooltipRef.current.style.left = '-0.5rem';
        tooltipRef.current.style.transform = 'translate(0, -50%)';
      } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewportWidth) {
        tooltipRef.current.style.right = '-0.5rem';
        tooltipRef.current.style.transform = 'translate(0, -50%)';
      }
    }
  }, [isVisible, position]);
  
  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible && 
        tooltipRef.current && 
        triggerRef.current && 
        !tooltipRef.current.contains(event.target) && 
        !triggerRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);
  
  // Determinar las clases de posición
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-1';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-1';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-1';
      case 'top':
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-1';
    }
  };
  
  // Determinar las clases de la flecha
  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'absolute w-2 h-2 bg-white border-t border-l border-gray-200 transform rotate-45 -top-1 left-1/2 -ml-1';
      case 'left':
        return 'absolute w-2 h-2 bg-white border-t border-r border-gray-200 transform rotate-45 top-1/2 -mt-1 -right-1';
      case 'right':
        return 'absolute w-2 h-2 bg-white border-b border-l border-gray-200 transform rotate-45 top-1/2 -mt-1 -left-1';
      case 'top':
      default:
        return 'absolute w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45 -bottom-1 left-1/2 -ml-1';
    }
  };
  
  return (
    <div className="inline-block relative">
      {/* Elemento que muestra el término médico */}
      <span 
        ref={triggerRef}
        className="group cursor-help border-b border-dotted border-blue-500 inline-flex items-center"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || term}
        <QuestionMarkCircleIcon className="ml-0.5 h-3.5 w-3.5 text-blue-500" />
      </span>
      
      {/* Tooltip con la explicación */}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg text-xs ${getPositionClasses()}`}
          role="tooltip"
        >
          <div className="font-semibold text-blue-600 text-sm mb-1">{term}</div>
          <p className="text-gray-700">{definition}</p>
          
          {source && (
            <div className="mt-1.5 text-[10px] text-gray-500">
              Fuente: {source}
            </div>
          )}
          
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
};

export default MedicalTermTooltip;
