// ── Migo Asistencia · Service Worker ──────────────────────
const CACHE = 'migo-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  clients.claim();
});

// ── NOTIFICACIONES PROGRAMADAS ─────────────────────────────
// Usamos un alarm via periodicsync o fallback con push manual
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_CHECK') {
    checkAndNotify();
  }
});

function checkAndNotify() {
  const now   = new Date();
  const h     = now.getHours();
  const m     = now.getMinutes();
  const s     = now.getSeconds();
  const day   = now.getDay(); // 0=domingo, 6=sábado

  // Solo lunes a viernes
  if (day === 0 || day === 6) return;
  // Solo en los primeros 30 segundos del minuto
  if (s > 30) return;

  if (h === 8 && m === 0) {
    self.registration.showNotification('🟢 Migo · Buenos días!', {
      body: 'Ya puedes marcar tu entrada.',
      icon: '/Asistencia/icon.png',
      badge: '/Asistencia/icon.png',
      tag: 'entrada',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'marcar', title: '✅ Marcar entrada' },
        { action: 'dismiss', title: 'Después' }
      ]
    });
  }

  if (h === 17 && m === 0) {
    self.registration.showNotification('🔵 Migo · Fin de jornada!', {
      body: 'Ya puedes marcar tu salida.',
      icon: '/Asistencia/icon.png',
      badge: '/Asistencia/icon.png',
      tag: 'salida',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'marcar', title: '✅ Marcar salida' },
        { action: 'dismiss', title: 'Después' }
      ]
    });
  }
}

// Al tocar la notificación → abre la app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      if (cs.length > 0) {
        cs[0].focus();
      } else {
        clients.openWindow('/Asistencia/');
      }
    })
  );
});
