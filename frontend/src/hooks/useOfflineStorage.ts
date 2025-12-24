import { useEffect, useState, useCallback } from 'react';
import {
  saveSensorDataOffline,
  savePendingAction,
  getPendingCount,
  OfflineSensorData,
  OfflineAction,
} from '../utils/offlineStorage';
import { useOnlineStatus } from './useOnlineStatus';
import { useServiceWorker } from './useServiceWorker';

/**
 * Hook for managing offline data storage and sync
 */
export const useOfflineStorage = () => {
  const isOnline = useOnlineStatus();
  const { requestSensorSync, requestActionsSync } = useServiceWorker();
  const [pendingCount, setPendingCount] = useState({ sensorData: 0, actions: 0 });

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && (pendingCount.sensorData > 0 || pendingCount.actions > 0)) {
      console.log('[Offline Storage] Coming back online, triggering sync...');

      if (pendingCount.sensorData > 0) {
        requestSensorSync();
      }

      if (pendingCount.actions > 0) {
        requestActionsSync();
      }

      // Clear counts after sync request
      setTimeout(() => updatePendingCount(), 3000);
    }
  }, [isOnline, pendingCount, requestSensorSync, requestActionsSync, updatePendingCount]);

  // Update count periodically
  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  /**
   * Save sensor data (offline-aware)
   */
  const saveSensorData = useCallback(async (data: OfflineSensorData): Promise<void> => {
    if (!isOnline) {
      await saveSensorDataOffline(data);
      await updatePendingCount();
    }
    // If online, the regular API call will handle it
  }, [isOnline, updatePendingCount]);

  /**
   * Save pending action (offline-aware)
   */
  const saveAction = useCallback(async (action: OfflineAction): Promise<void> => {
    if (!isOnline) {
      await savePendingAction(action);
      await updatePendingCount();
    }
    // If online, the regular API call will handle it
  }, [isOnline, updatePendingCount]);

  /**
   * Manually trigger sync
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.log('[Offline Storage] Cannot sync while offline');
      return false;
    }

    try {
      await Promise.all([
        requestSensorSync(),
        requestActionsSync(),
      ]);

      setTimeout(() => updatePendingCount(), 2000);
      return true;
    } catch (error) {
      console.error('[Offline Storage] Sync failed:', error);
      return false;
    }
  }, [isOnline, requestSensorSync, requestActionsSync, updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    saveSensorData,
    saveAction,
    triggerSync,
    updatePendingCount,
  };
};
