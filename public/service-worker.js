/* eslint-disable no-restricted-globals */

// Default configuration
const DEFAULT_CONFIG = {
  appName: 'Charter Search',
  notificationIcon: '/notification-icon.png',
  notificationBadge: '/notification-badge.png'
};

let config = DEFAULT_CONFIG;

// Listen for config updates from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIG_UPDATE') {
    config = { ...DEFAULT_CONFIG, ...event.data.config };
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: config.notificationIcon,
      badge: config.notificationBadge,
      data: {
        ...data.data,
        timestamp: new Date().getTime()
      },
      actions: data.actions || [],
      vibrate: [200, 100, 200],
      tag: 'charter-notification', // For grouping notifications
      renotify: true, // Allow new notifications even if one exists
      requireInteraction: true, // Keep notification visible until user interacts
      // Add branding to notification
      silent: false,
      timestamp: new Date().getTime()
    };

    const title = `${config.appName}: ${data.title}`;

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
}); 