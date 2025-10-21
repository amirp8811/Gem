// 🚀 SERVICE WORKER FOR GRAVITY JEWELRY
// Provides offline functionality and performance caching

const CACHE_NAME = 'gravity-jewelry-v1.0.0';
const STATIC_CACHE = 'gravity-static-v1';
const DYNAMIC_CACHE = 'gravity-dynamic-v1';
const API_CACHE = 'gravity-api-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/layout.html',
  '/assets/css/main.css',
  '/assets/js/app.js',
  '/pages/home.js',
  '/pages/products.js',
  '/pages/cart.js',
  '/manifest.json',
  '/assets/images/hero-jewelry.jpg',
  '/assets/images/product-placeholder.jpg',
  '/assets/images/category-placeholder.jpg',
  // Add more critical assets
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/cart'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isPageRequest(url)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(url) {
  return url.pathname.startsWith('/assets/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff') ||
         url.pathname === '/manifest.json' ||
         url.pathname === '/sw.js';
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Check if request is for images
function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

// Check if request is for pages
function isPageRequest(url) {
  return url.pathname === '/' ||
         url.pathname.startsWith('/products') ||
         url.pathname.startsWith('/categories') ||
         url.pathname.startsWith('/cart') ||
         url.pathname.startsWith('/about') ||
         url.pathname.startsWith('/contact');
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      
      // Only cache GET requests for certain endpoints
      if (shouldCacheAPIResponse(request.url)) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for API request');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      success: false,
      message: 'You are offline. Please check your connection.',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle image requests with stale-while-revalidate
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Return placeholder image if network fails and no cache
    if (!cachedResponse) {
      return new Response(getPlaceholderImage(), {
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
  });
  
  return cachedResponse || fetchPromise;
}

// Handle page requests with network-first, fallback to app shell
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for page request');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to app shell
    const appShell = await caches.match('/layout.html');
    if (appShell) {
      return appShell;
    }
    
    // Final fallback - offline page
    return new Response(getOfflinePage(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle other dynamic requests
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Content not available offline', { 
      status: 503 
    });
  }
}

// Check if API response should be cached
function shouldCacheAPIResponse(url) {
  const cacheableEndpoints = [
    '/api/products',
    '/api/categories',
    '/api/health'
  ];
  
  return cacheableEndpoints.some(endpoint => url.includes(endpoint));
}

// Generate placeholder image SVG
function getPlaceholderImage() {
  return `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">
        Image not available offline
      </text>
    </svg>
  `;
}

// Generate offline page HTML
function getOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Gravity Jewelry</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        .offline-container {
          max-width: 500px;
          padding: 2rem;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 2rem; opacity: 0.9; }
        .btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .btn:hover {
          background: white;
          color: #667eea;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>You're Offline</h1>
        <p>It looks like you've lost your internet connection. Some content may not be available until you're back online.</p>
        <a href="/" class="btn" onclick="window.location.reload()">Try Again</a>
      </div>
    </body>
    </html>
  `;
}

// Background sync for cart updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
});

// Sync cart data when back online
async function syncCartData() {
  try {
    // Get pending cart operations from IndexedDB
    const pendingOperations = await getPendingCartOperations();
    
    for (const operation of pendingOperations) {
      try {
        await fetch(operation.url, operation.options);
        await removePendingOperation(operation.id);
      } catch (error) {
        console.error('Failed to sync cart operation:', error);
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingCartOperations() {
  // Implementation would use IndexedDB to store pending operations
  return [];
}

async function removePendingOperation(id) {
  // Implementation would remove operation from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/assets/images/icon-192.png',
      badge: '/assets/images/badge-72.png',
      tag: data.tag || 'gravity-notification',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Log performance metrics
    console.log('Performance measure:', event.data.measure);
  }
});

console.log('Service Worker: Loaded and ready');
