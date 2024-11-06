import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

console.log('Service Worker Initializing');

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

self.addEventListener('push', function (event) {
  console.log(
    'Push event received:',
    event.data ? event.data.text() : 'no data'
  );
  if (event.data) {
    const data = event.data.json();
    console.log('Push notification data:', data);

    // Check if this is a scheduled notification
    if (data.scheduledTime) {
      const scheduledTime = new Date(data.scheduledTime).getTime();
      const now = Date.now();

      // Only show notification if we're within 1 minute of scheduled time
      if (Math.abs(now - scheduledTime) > 60000) {
        return;
      }
    }

    const options = {
      body: data.body,
      icon: data.icon || '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: 'https://dailyquestions.app',
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(
      event.notification.data.url || 'https://dailyquestions.app'
    )
  );
});

serwist.addEventListeners();
