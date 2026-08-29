/* LOOP SERVICE WORKER v9.0 */

const CACHE = 'loop-v9';
const ASSETS = [
  './',
  './index.html',
  './stats.html',
  './css/theme.css',
  './css/app.css',
  './js/app.js',
  './js/reminders.js',
  './js/reminder-ui.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener('push', (e) => {
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || 'Loop*', {
      body: data.body,
      icon: '/icons/icon.svg',
      tag: 'loop-notification'
    })
  );
});
