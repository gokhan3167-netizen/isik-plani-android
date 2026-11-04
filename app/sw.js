// Çevrimdışı çalışma: uygulama dosyalarını ve yazı tipi / kütüphaneleri önbelleğe alır.
// Yeni sürüm yüklediğinde SURUM değerini değiştir.
const SURUM = 'lampoff-v764';
const CEKIRDEK = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(CEKIRDEK)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Sayfanın kendisi: önce internet (güncel sürüm), yoksa önbellek
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(SURUM).then(x => x.put('./index.html', c)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Online cihaz kütüphanesi: önce internet (güncel), yoksa önbellek
  if (req.url.includes('raw.githubusercontent.com')) {
    e.respondWith(fetch(req).then(res => { if (res && res.ok) { const c = res.clone(); caches.open(SURUM).then(x => x.put(req.url, c)); } return res; })
      .catch(() => caches.match(req.url)));
    return;
  }
  // Diğerleri: önce önbellek, yoksa internetten alıp sakla
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(SURUM).then(x => x.put(req, c)); }
    return res;
  })));
});
