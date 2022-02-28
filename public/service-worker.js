const APP = 'Budget_Tracker-';
const VERSION = 'v.1';
const CACHE_NAME = APP + VERSION;

const FILES_TO_CACHE = [
    '/', 
    '/index.html', 
    '/manifest.json', 
    '/css/styles.css', 
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/js/idb.js',
    '/js/index.js'
]

// install service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

// activate service workder
self.addEventListener('activate', function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key != CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    )

    self.clients.claim();
});

// intercept fetch requests
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => {
                return;
                fetch(evt.request)
                    .then(response => {
                        // if the response was good, store it in the cache
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        // if it fails, try to get from cache
                        return cache.match(evt.request);
                    });
            })
            .catch(err => console.log(err))
        );
        return;
    }

        // if the request does not include /api/
        evt.respondWith(
            fetch(evt.request).catch(function() {
                return caches.match(evt.request)
                    .then(function(response) {
                        if (response) {
                            return response;
                        }
                        else if (evt.request.headers.get('accept').includes('text/html')) {
                            // return the cached home page for all requests for html pages
                            return caches.match('/');
                        }
                    });
            })
        );
});