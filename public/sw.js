const CACHE_NAME = 'frontera-hacks-v1';
const ASSETS_TO_CACHE = ['/', '/index.php', '/offline.html'];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE).catch(() => {
                    // Ignore errors if some assets aren't available yet
                    console.log(
                        '[Service Worker] Some assets failed to cache, continuing...',
                    );
                });
            })
            .then(() => self.skipWaiting()),
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log(
                                '[Service Worker] Deleting old cache:',
                                cacheName,
                            );
                            return caches.delete(cacheName);
                        }
                    }),
                );
            })
            .then(() => self.clients.claim()),
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip hot reload and manifest requests during dev
    if (url.pathname === '/hot' || url.pathname.includes('manifest')) {
        return;
    }

    // Network first for API calls
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response
                    const clonedResponse = response.clone();
                    // Store in cache for offline fallback
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    // Return cached version or offline response
                    return caches.match(request).then((cachedResponse) => {
                        return (
                            cachedResponse ||
                            new Response('Offline', { status: 503 })
                        );
                    });
                }),
        );
        return;
    }

    // Cache first for static assets
    if (
        url.pathname.match(
            /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i,
        )
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return (
                    cachedResponse ||
                    fetch(request)
                        .then((response) => {
                            // Clone and cache the response
                            const clonedResponse = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, clonedResponse);
                            });
                            return response;
                        })
                        .catch(() => {
                            // Return a fallback image for failed asset requests
                            if (request.destination === 'image') {
                                return new Response(
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/></svg>',
                                    {
                                        headers: {
                                            'Content-Type': 'image/svg+xml',
                                        },
                                    },
                                );
                            }
                            return null;
                        })
                );
            }),
        );
        return;
    }

    // Stale-while-revalidate for HTML pages
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((response) => {
                    // Only cache successful responses
                    if (response.status === 200) {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached version or offline page
                    return (
                        cachedResponse ||
                        caches.match('/') ||
                        new Response('Offline', { status: 503 })
                    );
                });

            return cachedResponse || fetchPromise;
        }),
    );
});

// Push notification support
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/android-icon-192x192.png',
        badge: '/favicon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            timestamp: Date.now(),
            url: '/',
        },
    };

    event.waitUntil(
        self.registration.showNotification('FronteraHacks', options),
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-food-entries') {
        event.waitUntil(
            // Retry syncing food entries
            fetch('/api/sync-food-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).catch((err) => {
                console.log('[Service Worker] Background sync failed:', err);
            }),
        );
    }
});
