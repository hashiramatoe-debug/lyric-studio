/* Lyric Studio — service worker */
const VERSION = 'lyric-studio-v2';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Polices Google : on sert le cache puis on rafraîchit en arrière-plan
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(
      caches.open(VERSION).then(async cache => {
        const hit = await cache.match(req);
        const net = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // Le reste : réseau d'abord, cache en secours (app utilisable hors connexion)
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
