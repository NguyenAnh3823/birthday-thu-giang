const CACHE_NAME = 'birthday-pwa-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    'assets/image/Bunting_Garland.svg',
    'assets/image/cake_birthday.svg',
    'assets/image/Matchstick.svg',
    'assets/image/lo_uoc_nguyen.svg',
    'assets/image/disc.svg',
    'assets/image/disc_happiness.svg',
    'assets/image/disc_vietlott.svg',
    'assets/image/disc_health.svg',
    'assets/image/disc_peace.svg',
    'assets/audio/happy_birthday.mp3'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
