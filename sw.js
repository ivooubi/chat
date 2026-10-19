/* Service worker de chat. — recibe notificaciones push */
const ICON = new URL('icon-192.png', self.registration.scope).href;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; }
  catch (_) { d = { title: 'chat.', body: event.data ? event.data.text() : '' }; }

  event.waitUntil((async () => {
    // Si estás usando la app ahora mismo ya lo ves en pantalla (iOS obliga a mostrar siempre el aviso)
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const ios = /iphone|ipad|ipod/i.test(self.navigator.userAgent);
    if (!ios && wins.some((c) => c.visibilityState === 'visible' && c.focused)) return;

    await self.registration.showNotification(d.title || 'chat.', {
      body: d.body || '',
      icon: ICON,
      badge: ICON,
      tag: d.tag || undefined,
      renotify: !!d.tag,
      data: { chat: d.chat || null },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const chat = (event.notification.data || {}).chat;
  const target = new URL(chat ? '?chat=' + chat : './', self.registration.scope).href;

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) {
        await w.focus();
        if (chat) w.postMessage({ openChat: chat });
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});
