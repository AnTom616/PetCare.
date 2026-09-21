/* ============================================================
   PetCare São Mateus - sw.js (Service Worker)
   Estratégia: Cache First
   Cache: petcare-v1
   ============================================================ */

const CACHE_NAME = 'petcare-v1';

// Arquivos salvos no cache durante a instalação
const ARQUIVOS_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

/* ---------- INSTALAÇÃO: salva os arquivos principais no cache ---------- */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(ARQUIVOS_CACHE))
            .then(() => self.skipWaiting())
    );
});

/* ---------- ACTIVATION: remove caches antigos ---------- */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((nomes) =>
                Promise.all(
                    nomes
                        .filter((nome) => nome !== CACHE_NAME)
                        .map((nome) => caches.delete(nome))
                )
            )
            .then(() => self.clients.claim())
    );
});

/* ---------- FETCH: estratégia Cache First ---------- */
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((respostaCache) => {
            // 1º tenta no cache; se não houver, busca na rede
            return (
                respostaCache ||
                fetch(event.request).catch(() => caches.match('/index.html'))
            );
        })
    );
});
