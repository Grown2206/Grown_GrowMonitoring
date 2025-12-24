/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'grow-monitor-v2.0.0';
const API_CACHE_NAME = 'grow-monitor-api-v2.0.0';
const RUNTIME_CACHE_NAME = 'grow-monitor-runtime-v2.0.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
        .catch(err => {
          console.log('Cache addAll error:', err);
        });
    })
  );
  self.skipWaiting();
});

// Fetch event - implement different strategies based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip WebSocket and Chrome extension requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:' || url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache First strategy
  event.respondWith(cacheFirst(request));
});

// Cache First strategy - for static assets
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      // Return cached version and update in background
      fetchAndCache(request, CACHE_NAME);
      return cached;
    }

    // Not in cache, fetch from network
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache first error:', error);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/index.html');
      return offlineResponse || new Response('Offline', { status: 503 });
    }

    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Network First strategy - for API requests
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful GET responses
    if (response && response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Network error, trying cache:', error);

    // Try cache as fallback
    const cache = await caches.open(API_CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      // Add custom header to indicate offline mode
      const offlineResponse = cached.clone();
      return new Response(offlineResponse.body, {
        status: cached.status,
        statusText: 'From Cache (Offline)',
        headers: new Headers(cached.headers),
      });
    }

    // Return offline JSON response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. This data is unavailable.',
      offline: true,
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Fetch and cache in background (stale-while-revalidate)
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silently fail - we already returned the cached version
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME, RUNTIME_CACHE_NAME];
  console.log('[SW] Activating new service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting and activating new service worker');
    self.skipWaiting();
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-sensor-data') {
    event.waitUntil(syncSensorData());
  } else if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// Sync sensor data when back online
async function syncSensorData() {
  console.log('[SW] Syncing sensor data...');

  try {
    // Get pending sensor data from IndexedDB
    const pendingData = await getPendingDataFromDB('sensorData');

    if (pendingData && pendingData.length > 0) {
      console.log('[SW] Found', pendingData.length, 'pending sensor readings');

      // Send each reading to the server
      const promises = pendingData.map(data =>
        fetch('/api/sensors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      );

      await Promise.all(promises);
      await clearPendingDataFromDB('sensorData');
      console.log('[SW] Sensor data sync successful');
    }
  } catch (error) {
    console.error('[SW] Sensor data sync failed:', error);
    throw error; // Retry sync
  }
}

// Sync pending actions (plant updates, settings, etc.)
async function syncPendingActions() {
  console.log('[SW] Syncing pending actions...');

  try {
    const pendingActions = await getPendingDataFromDB('actions');

    if (pendingActions && pendingActions.length > 0) {
      console.log('[SW] Found', pendingActions.length, 'pending actions');

      for (const action of pendingActions) {
        await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: action.body,
        });
      }

      await clearPendingDataFromDB('actions');
      console.log('[SW] Actions sync successful');
    }
  } catch (error) {
    console.error('[SW] Actions sync failed:', error);
    throw error;
  }
}

// Get pending data from IndexedDB
async function getPendingDataFromDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GrowMonitoringDB', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }

      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Clear pending data from IndexedDB
async function clearPendingDataFromDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GrowMonitoringDB', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
