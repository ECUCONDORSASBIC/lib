'use client';

import { syncUserProfileData, verifyAndRepairUserProfile } from '@/app/services/syncService';
import { useEffect, useState } from 'react';

/**
 * Hook para gestionar la sincronización de datos entre colecciones de Firestore
 * Este hook proporciona funciones para:
 * 1. Sincronizar datos entre users y patients
 * 2. Verificar y reparar inconsistencias
 * 3. Estado de la última sincronización
 *
 * @param {string} userId - ID del usuario a sincronizar
 * @returns {Object} - Funciones y estado de sincronización
 */
export function useDataSync(userId) {
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncStats, setSyncStats] = useState({
    syncCount: 0,
    repairCount: 0,
    lastRepairResult: null
  });

  // Función para sincronizar datos de perfil
  const syncProfileData = async (profileData) => {
    if (!userId) {
      setSyncError('ID de usuario es requerido para sincronización');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncUserProfileData(userId, profileData);
      setLastSync(new Date());
      setSyncStats(prev => ({
        ...prev,
        syncCount: prev.syncCount + 1
      }));
      return true;
    } catch (error) {
      setSyncError(error.message || 'Error de sincronización');
      console.error('Error en sincronización:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Función para verificar y reparar inconsistencias
  const verifyAndRepair = async () => {
    if (!userId) {
      setSyncError('ID de usuario es requerido para reparación');
      return null;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await verifyAndRepairUserProfile(userId);
      setLastSync(new Date());
      setSyncStats(prev => ({
        ...prev,
        repairCount: prev.repairCount + 1,
        lastRepairResult: result
      }));
      return result;
    } catch (error) {
      setSyncError(error.message || 'Error de reparación');
      console.error('Error en reparación:', error);
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // Efecto para verificar automáticamente inconsistencias al montar
  useEffect(() => {
    if (userId) {
      verifyAndRepair().catch(console.error);
    }

    // No incluimos verifyAndRepair en las dependencias para evitar loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    syncProfileData,
    verifyAndRepair,
    lastSync,
    isSyncing,
    syncError,
    syncStats
  };
}
