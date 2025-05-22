// app/hooks/useRobustAnamnesis.js
import { useCallback, useEffect, useState } from 'react';
import {
  saveOrUpdateAnamnesis,
  getCurrentAnamnesis,
  getAnamnesisHistory,
  syncAnamnesis,
  validateAnamnesis
} from '@/app/services/robustAnamnesisService';
import { getAuth } from 'firebase/auth';

/**
 * Hook para gestionar la anamnesis robusta en el frontend
 * @param {string} patientId
 * @param {Array} steps - Estructura de pasos/secciones del formulario
 * @param {Object} patientData - Datos básicos del paciente
 * @param {string} userId - ID del usuario actual
 */
export function useRobustAnamnesis(patientId, steps, patientData, userId) {
  const [anamnesis, setAnamnesis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Obtener usuario autenticado
  const auth = typeof window !== 'undefined' ? getAuth() : null;
  const currentUser = auth?.currentUser;

  // Cargar la anamnesis actual
  const loadAnamnesis = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!currentUser || !currentUser.uid) {
      setError('Debe iniciar sesión para acceder a la anamnesis');
      setLoading(false);
      return;
    }
    if (!currentUser.emailVerified) {
      setError('Debe verificar su email para acceder a datos sensibles');
      setLoading(false);
      return;
    }
    try {
      const data = await getCurrentAnamnesis(patientId, currentUser);
      setAnamnesis(data);
    } catch (err) {
      setError(err.message || 'Error al cargar anamnesis');
    } finally {
      setLoading(false);
    }
  }, [patientId, currentUser]);

  // Cargar historial de versiones
  const loadHistory = useCallback(async () => {
    if (!currentUser || !currentUser.uid || !currentUser.emailVerified) {
      setHistory([]);
      return;
    }
    try {
      const h = await getAnamnesisHistory(patientId, currentUser);
      setHistory(h);
    } catch (err) {
      // No es crítico
    }
  }, [patientId, currentUser]);

  // Guardar o actualizar anamnesis
  const saveAnamnesis = useCallback(async (formData) => {
    setSaving(true);
    setError(null);
    if (!currentUser || !currentUser.uid) {
      setError('Debe iniciar sesión para guardar la anamnesis');
      setSaving(false);
      throw new Error('Debe iniciar sesión para guardar la anamnesis');
    }
    if (!currentUser.emailVerified) {
      setError('Debe verificar su email para guardar datos sensibles');
      setSaving(false);
      throw new Error('Debe verificar su email para guardar datos sensibles');
    }
    try {
      const result = await saveOrUpdateAnamnesis(patientId, formData, steps, patientData, userId, currentUser);
      setAnamnesis(result);
      loadHistory();
      return result;
    } catch (err) {
      setError(err.message || 'Error al guardar anamnesis');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [patientId, steps, patientData, userId, loadHistory, currentUser]);

  // Sincronizar cambios concurrentes
  const syncAnamnesisData = useCallback(async (newData, expectedVersionId) => {
    setSyncError(null);
    if (!currentUser || !currentUser.uid || !currentUser.emailVerified) {
      setSyncError('Debe iniciar sesión y verificar su email para sincronizar');
      throw new Error('Debe iniciar sesión y verificar su email para sincronizar');
    }
    try {
      const result = await syncAnamnesis(patientId, newData, expectedVersionId, userId, currentUser);
      setAnamnesis(result);
      loadHistory();
      return result;
    } catch (err) {
      setSyncError(err.message || 'Conflicto de sincronización');
      throw err;
    }
  }, [patientId, userId, loadHistory, currentUser]);

  // Validar datos antes de guardar
  const validate = useCallback((anamnesisData) => {
    return validateAnamnesis(anamnesisData);
  }, []);

  useEffect(() => {
    if (patientId) {
      loadAnamnesis();
      loadHistory();
    }
  }, [patientId, loadAnamnesis, loadHistory]);

  return {
    anamnesis,
    history,
    loading,
    error,
    saving,
    syncError,
    saveAnamnesis,
    syncAnamnesisData,
    validate,
    reload: loadAnamnesis,
    reloadHistory: loadHistory
  };
}

export default useRobustAnamnesis;
