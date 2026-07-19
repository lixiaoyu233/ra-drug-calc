const CACHE = 'fengmian-v2'
const URLS = ['/Rheumatology-Calc/', '/Rheumatology-Calc/index.html', '/Rheumatology-Calc/manifest.json', '/Rheumatology-Calc/icon.svg']
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)))
  self.skipWaiting()
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))))
})
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
})
