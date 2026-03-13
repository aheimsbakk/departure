const VERSION = '1.38.3';
const CACHE_NAME = `departures-v${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './icons.css',
  './css/tokens.css',
  './css/base.css',
  './css/buttons.css',
  './css/layout.css',
  './css/utils.css',
  './css/header.css',
  './css/toolbar.css',
  './css/departures.css',
  './css/scroll-more.css',
  './css/options-panel.css',
  './css/autocomplete.css',
  './css/transport-modes.css',
  './css/language-switcher.css',
  './css/share-modal.css',
  './css/toasts.css',
  './css/gps-dropdown.css',
  './css/footer.css',
  './css/debug.css',
  './app.js',
  './app/settings.js',
  './app/url-import.js',
  './app/render.js',
  './app/fetch-loop.js',
  './app/handlers.js',
  './app/action-bar.js',
  './app/gps-bar.js',
  './app/sw-updater.js',
  './app/scroll-more.js',
  './config.js',
  './entur/index.js',
  './entur/modes.js',
  './entur/parser.js',
  './entur/query.js',
  './entur/http.js',
  './entur/departures.js',
  './entur/geocoder.js',
  './entur/gps-search.js',
  './i18n.js',
  './i18n/index.js',
  './i18n/translations.js',
  './i18n/languages.js',
  './i18n/detect.js',
  './i18n/store.js',
  './time.js',
  './ui/ui.js',
  './ui/departure.js',
  './ui/header.js',
  './ui/options.js',
  './ui/options/index.js',
  './ui/options/settings-store.js',
  './ui/options/transport-modes.js',
  './ui/options/station-autocomplete.js',
  './ui/options/language-switcher.js',
  './ui/options/panel-lifecycle.js',
  './ui/share-button.js',
  './ui/station-dropdown.js',
  './ui/theme-toggle.js',
  './ui/mode-utils.js',
  './ui/gps-dropdown.js',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

// Install: cache core assets, bypassing the HTTP cache so that a new
// versioned cache never contains stale responses from a previous deploy.
// cache.addAll() uses the HTTP cache by default, which causes the bug
// where the "new" cache silently stores old asset bodies.
self.addEventListener('install', (ev) => {
  ev.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const requests = ASSETS.map((url) => new Request(url, { cache: 'reload' }));
      await cache.addAll(requests);
    })()
  );
});

// Activate: remove old caches, then claim clients.
// controllerchange fires on the client only after claim() resolves, which
// guarantees old caches are gone before the page reloads into new assets.
self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
      await clients.claim();
    })()
  );
});

// Listen for messages from the page (e.g. SKIP_WAITING)
self.addEventListener('message', (ev) => {
  if (!ev.data) return;
  if (ev.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: use network-first for navigation requests so users get fresh HTML,
// fall back to cache when offline. For other requests prefer cache-first.
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const isNavigation =
    req.mode === 'navigate' ||
    (req.method === 'GET' &&
      req.headers.get('accept') &&
      req.headers.get('accept').includes('text/html'));
  if (isNavigation) {
    ev.respondWith(
      (async () => {
        try {
          const netRes = await fetch(req);
          // update the cache with the latest HTML
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone()).catch(() => {});
          return netRes;
        } catch (e) {
          const cached = (await caches.match(req)) || (await caches.match('./'));
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // For other requests (CSS, JS, etc), use cache-first from the current versioned cache only
  // EXCEPTION: Don't cache API requests from external domains (like api.entur.io)
  const url = new URL(req.url);
  const isExternalAPI = url.hostname !== self.location.hostname;

  if (isExternalAPI) {
    // Network-only for external API requests - don't cache them
    ev.respondWith(fetch(req));
    return;
  }

  ev.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Exact match only — do NOT use ignoreSearch, as that would serve stale
      // assets when the page reloads after a SW update.
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const netRes = await fetch(req);
        // Cache the response for future use
        cache.put(req, netRes.clone()).catch(() => {});
        return netRes;
      } catch (e) {
        // Offline and not in cache
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});
