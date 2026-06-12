const CACHE = 'migo-v2';
const ASSETS = [
  '/Asistencia/',
  '/Asistencia/index.html',
  '/Asistencia/manifest.json',
  '/Asistencia/assets/css/style.css',
  '/Asistencia/assets/js/app.js',
  '/Asistencia/assets/icons/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('/Asistencia/').then(cached => cached || fetch(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
