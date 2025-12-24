import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

/**
 * Hook to manage service worker registration and updates
 */
export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    registration: null,
    updateAvailable: false,
  });

  useEffect(() => {
    if (!state.isSupported) {
      console.log('[SW] Service Workers are not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[SW] Service Worker registered:', registration);

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New service worker available');
                setState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [state.isSupported]);

  /**
   * Request background sync for sensor data
   */
  const requestSensorSync = async () => {
    if (state.registration && 'sync' in state.registration) {
      try {
        const syncManager = (state.registration as any).sync;
        await syncManager.register('sync-sensor-data');
        console.log('[SW] Background sync registered for sensor data');
        return true;
      } catch (error) {
        console.error('[SW] Background sync registration failed:', error);
        return false;
      }
    }
    return false;
  };

  /**
   * Request background sync for pending actions
   */
  const requestActionsSync = async () => {
    if (state.registration && 'sync' in state.registration) {
      try {
        const syncManager = (state.registration as any).sync;
        await syncManager.register('sync-pending-actions');
        console.log('[SW] Background sync registered for pending actions');
        return true;
      } catch (error) {
        console.error('[SW] Background sync registration failed:', error);
        return false;
      }
    }
    return false;
  };

  /**
   * Update to the new service worker
   */
  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    ...state,
    requestSensorSync,
    requestActionsSync,
    updateServiceWorker,
  };
};
