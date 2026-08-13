const CACHE_NAME = 'birthday-pwa-v4'; // Tăng version để ép client xóa cache cũ

const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Cài đặt và cache các asset tĩnh ban đầu
self.addEventListener('install', event => {
    self.skipWaiting(); // Ép Service Worker mới active ngay, không chờ đợi
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate: Dọn dẹp cache cũ của version trước
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Xóa cache cũ:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Chiếm quyền kiểm soát client ngay lập tức
    );
});

// Chiến lược Fetch riêng biệt cho từng loại resource
self.addEventListener('fetch', event => {
    const request = event.request;

    // 1. Dành cho HTML (Navigation): Network-first
    if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Update cache bản mới nhất
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request)) // Mất mạng mới dùng cache
        );
        return;
    }

    // 2. Dành cho CSS / JS: Network-first
    if (request.destination === 'style' || request.destination === 'script') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Đảm bảo không lưu nhầm response lỗi (chỉ lưu status 200)
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // 3. Dành cho Ảnh, SVG, Audio (Asset tĩnh): Cache-first
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            return cachedResponse || fetch(request).then(response => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
