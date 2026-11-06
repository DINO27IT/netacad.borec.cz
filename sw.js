// Service Worker pro dokonalé zamaskování zobrazení PDF
const CACHE_NAME = 'ccna-pdf-cache-v1';
const KEY_NAME = 'https://netacad.local/selected_file';
let currentVariantUrl = 'prikazy_ccna/prikazy_ccna2.pdf';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SET_VARIANT') {
    currentVariantUrl = event.data.file;
  }
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Zkontroluje, zda požadavek směřuje na prikazy_ccna2.pdf
  if (url.pathname.endsWith('/prikazy_ccna2.pdf') || url.pathname.endsWith('prikazy_ccna2.pdf')) {
    event.respondWith(
      (async () => {
        try {
          let fileToFetch = currentVariantUrl;
          try {
            const cache = await caches.open(CACHE_NAME);
            const matched = await cache.match(KEY_NAME);
            if (matched) {
              fileToFetch = await matched.text();
            }
          } catch(e) {}

          const response = await fetch(fileToFetch);
          const blob = await response.blob();

          // Vrátí PDF s hlavičkou prikazy_ccna2.pdf (žádné kódové číslo v názvu ani v hlavičkách!)
          return new Response(blob, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline; filename="prikazy_ccna2.pdf"'
            }
          });
        } catch (err) {
          return fetch('prikazy_ccna2.pdf');
        }
      })()
    );
  }
});
