// src/sw.js
// Impor modul Workbox yang diperlukan
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  clientsClaim,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { createHandlerBoundToURL, NavigationRoute } from "workbox-precaching"; // Tambahkan ini

// Ini adalah array yang akan disuntikkan oleh vite-plugin-pwa saat build
// Ini berisi daftar aset statis yang akan di-precache
// eslint-disable-next-line no-undef
precacheAndRoute(self.__WB_MANIFEST || []);

// Klaim semua klien yang ada segera setelah service worker aktif
// dan lewati status waiting
clientsClaim();
self.skipWaiting();

// Membersihkan cache lama yang mungkin dibuat oleh Workbox versi sebelumnya
cleanupOutdatedCaches();

// --- LOGIKA NOTIFIKASI PUSH ---
// Event listener untuk menerima pesan push dari server
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Menerima event push...");
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notifikasi Baru!";
  const options = {
    body: data.options ? data.options.body : "Anda memiliki pesan baru.",
    icon: data.options
      ? data.options.icon
      : "/Story-app-with-vite/images/icon-icon-x192.png", // Sesuaikan path ikon
    badge: data.options
      ? data.options.badge
      : "/Story-app-with-vite/images/maskable-icon-x48.png", // Sesuaikan path badge
    image: data.options ? data.options.image : undefined,
    data: data.options ? data.options.data : {}, // Data tambahan untuk notifikasi
    actions: data.options ? data.options.actions : [], // Tombol aksi notifikasi
  };

  // Tampilkan notifikasi
  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener untuk klik notifikasi
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notifikasi diklik:", event.notification.tag);
  event.notification.close(); // Tutup notifikasi setelah diklik

  // Dapatkan URL dari data notifikasi, jika ada. Default ke root.
  const targetUrl =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/Story-app-with-vite/"; // URL default, pastikan sesuai dengan base Anda

  // Buka window baru atau fokus ke tab yang sudah ada
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(targetUrl) && "focus" in client) {
          // Gunakan startsWith untuk path base
          return client.focus();
        }
      }
      // Jika tidak ada tab yang cocok, buka tab baru
      return clients.openWindow(targetUrl);
    })
  );
});
// --- AKHIR LOGIKA NOTIFIKASI PUSH ---

// --- KONFIGURASI RUNTIME CACHING DARI VITE.CONFIG.JS ---
// Pindahkan semua rute runtimeCaching dari vite.config.js ke sini.

// Cache API cerita (NetworkFirst)
registerRoute(
  ({ url }) => url.href.includes("story-api.dicoding.dev/v1/stories"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache respons OK atau opaque
      }),
    ],
  }),
  "GET" // Metode HTTP
);

// Cache aset eksternal (CDN) (CacheFirst)
registerRoute(
  ({ url }) =>
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.origin === "https://unpkg.com",
  new CacheFirst({
    cacheName: "external-assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
      }),
    ],
  }),
  "GET"
);

// Cache gambar cerita (CacheFirst)
registerRoute(
  /^https:\/\/story-api\.dicoding\.dev\/images\/stories\/.*\.(png|jpg|jpeg|gif|webp|blob)$/,
  new CacheFirst({
    // Menggunakan CacheFirst untuk gambar
    cacheName: "story-images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  "GET"
);

// Cache aset statis lokal (CacheFirst)
registerRoute(
  /\/(images|icons|screenshot)\/.*\.(png|jpg|jpeg|svg|webp)$/, // Pastikan regex ini cocok dengan struktur folder Anda
  new CacheFirst({
    cacheName: "static-assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
      }),
    ],
  }),
  "GET"
);

// Rute untuk navigasi SPA (penting untuk single-page application)
// Pastikan base URL ini cocok dengan start_url di manifest.json dan APP_BASE_URL di index.js
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL("/Story-app-with-vite/"), // Ini adalah URL HTML Anda setelah precache
    {
      allowlist: [/^\/Story-app-with-vite\//], // Sesuaikan dengan base path aplikasi Anda
      denylist: [/^.*\/auth\//], // Contoh denylist untuk halaman autentikasi jika tidak ingin di-cache
    }
  )
);
// --- AKHIR RUNTIME CACHING ---
