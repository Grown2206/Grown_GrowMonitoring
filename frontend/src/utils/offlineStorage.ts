/**
 * IndexedDB utilities for offline data storage
 */

const DB_NAME = 'GrowMonitoringDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  SENSOR_DATA: 'sensorData',
  ACTIONS: 'actions',
} as const;

/**
 * Open IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.SENSOR_DATA)) {
        db.createObjectStore(STORES.SENSOR_DATA, { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains(STORES.ACTIONS)) {
        db.createObjectStore(STORES.ACTIONS, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/**
 * Add data to a store
 */
export const addToStore = async <T>(storeName: string, data: T): Promise<number> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
};

/**
 * Get all data from a store
 */
export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
};

/**
 * Clear all data from a store
 */
export const clearStore = async (storeName: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
};

/**
 * Delete a specific item from a store
 */
export const deleteFromStore = async (storeName: string, key: number): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
};

/**
 * Save sensor data for offline sync
 */
export interface OfflineSensorData {
  sensorId: number;
  value: number;
  timestamp: string;
}

export const saveSensorDataOffline = async (data: OfflineSensorData): Promise<void> => {
  try {
    await addToStore(STORES.SENSOR_DATA, data);
    console.log('[Offline Storage] Sensor data saved for sync');
  } catch (error) {
    console.error('[Offline Storage] Failed to save sensor data:', error);
    throw error;
  }
};

/**
 * Save pending action for offline sync
 */
export interface OfflineAction {
  url: string;
  method: string;
  body?: string;
  timestamp: string;
}

export const savePendingAction = async (action: OfflineAction): Promise<void> => {
  try {
    await addToStore(STORES.ACTIONS, action);
    console.log('[Offline Storage] Action saved for sync:', action.url);
  } catch (error) {
    console.error('[Offline Storage] Failed to save action:', error);
    throw error;
  }
};

/**
 * Get count of pending items
 */
export const getPendingCount = async (): Promise<{ sensorData: number; actions: number }> => {
  try {
    const sensorData = await getAllFromStore(STORES.SENSOR_DATA);
    const actions = await getAllFromStore(STORES.ACTIONS);

    return {
      sensorData: sensorData.length,
      actions: actions.length,
    };
  } catch (error) {
    console.error('[Offline Storage] Failed to get pending count:', error);
    return { sensorData: 0, actions: 0 };
  }
};
