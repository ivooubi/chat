self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data.json(); } catch (_) {}
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.some((w) => w.visibilityState === 'visible' && w.focused)) return;
    await self.registration.showNotification(d.title || 'chat.', {
      body: d.body || '',
      tag: d.tag || 'chat',
      renotify: true,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: { uid: d.uid },
    });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const uid = e.notification.data && e.notification.data.uid;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.length) {
      await wins[0].focus();
      if (uid) wins[0].postMessage({ openChat: uid });
      return;
    }
    await self.clients.openWindow(uid ? './?chat=' + uid : './');
  })());
});
