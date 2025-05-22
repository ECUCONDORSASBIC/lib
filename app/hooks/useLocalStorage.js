'use client';

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para persistir datos en localStorage y mantener el estado sincronizado
 * 
 * @param {string} key - Clave para almacenar en localStorage
 * @param {any} initialValue - Valor inicial si no hay nada en localStorage
 * @returns {[any, Function, Function]} - [valor, función para establecer valor, función para eliminar valor]
 */
export const useLocalStorage = (key, initialValue) => {
  // Estado para almacenar nuestro valor
  // Pasa la función de inicialización a useState para que la lógica solo se ejecute una vez
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Obtener de localStorage usando la clave
      const item = window.localStorage.getItem(key);
      // Analizar el JSON almacenado o si es null, devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay un error, devolver initialValue
      console.log(error);
      return initialValue;
    }
  });
  
  // Función para actualizar localStorage y state
  const setValue = (value) => {
    try {
      // Permitir que value sea una función para que tengamos la misma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Guardar el state
      setStoredValue(valueToStore);
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Una implementación más avanzada manejaría el caso de superar la cuota de localStorage
      console.log(error);
    }
  };
  
  // Función para eliminar el valor de localStorage
  const removeValue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.log(error);
    }
  };
  
  // Escuchar cambios en localStorage desde otras pestañas/ventanas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.log(error);
        }
      }
    };
    
    // Agregar el listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    
    // Limpieza
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
};
