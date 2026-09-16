/* Encomendas — service worker
   Guarda a app no telemóvel para abrir sem rede e atualiza-se sozinho. */
const VERSAO = 'v2026.09.16';
const CACHE  = 'encomendas-' + VERSAO;
const FICHEIROS = [
  './', './index.html', './manifest.webmanifest', './icon.svg', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // um ficheiro em falta (ex.: um icone) nunca deve impedir a instalacao
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FICHEIROS.map(f => c.add(f).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // envios vão sempre à rede
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // EmailJS nunca é servido da cache

  // a página: rede primeiro (para apanhar versões novas), cache se estiver offline
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(req).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return r;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // restantes ficheiros: cache primeiro, atualizando em segundo plano
  e.respondWith(
    caches.match(req).then(cached => {
      const rede = fetch(req).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return r;
      }).catch(() => cached);
      return cached || rede;
    })
  );
});
