// src/sw.js
// Import modul Workbox yang diperlukan
// Pastikan Workbox sudah terinstall di project Anda (misal: npm install workbox-precaching workbox-routing workbox-strategies workbox-expiration workbox-cacheable-response)
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  clientsClaim,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { createHandlerBoundToURL, NavigationRoute } from "workbox-precaching"; // Tambahkan ini

// Ini adalah array yang akan disuntikkan oleh vite-plugin-pwa saat build.
// Ini berisi daftar aset statis yang ditentukan di vite.config.js untuk di-precache.
// eslint-disable-next-line no-undef
precacheAndRoute(self.__WB_MANIFEST || []);

// Klaim semua klien yang ada segera setelah service worker aktif.
// Ini akan membuat service worker baru segera mengambil alih kendali halaman.
clientsClaim();
// Melewati tahap waiting (digunakan bersama clientsClaim)
// Ini memastikan service worker versi baru segera aktif.
self.skipWaiting();

// Membersihkan cache lama yang mungkin dibuat oleh Workbox versi sebelumnya.
// Ini penting untuk manajemen cache yang bersih.
cleanupOutdatedCaches();

// --- LOGIKA NOTIFIKASI PUSH ---
// Event listener untuk menerima pesan push dari server.
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Menerima event push..."); // Log bahwa event push diterima

  let data;
  try {
    data = event.data ? event.data.json() : {}; // Mengurai data yang dikirim dari server sebagai JSON
  } catch (error) {
    console.error(
      "[Service Worker] Gagal mengurai data push sebagai JSON:",
      error
    );
    // Jika data bukan JSON, gunakan default atau struktur yang sangat dasar
    data = {
      title: "Pesan Baru (Format Salah)",
      options: {
        body: "Ada pesan, tetapi formatnya tidak dikenali.",
        icon: "/Story-app-with-vite/images/icon-icon-x192.png", // Fallback icon
        badge: "/Story-app-with-vite/images/maskable-icon-x48.png", // Fallback badge
      },
    };
  }

  const title = data.title || "Notifikasi Baru!"; // Judul notifikasi
  const options = {
    body: data.options ? data.options.body : "Anda memiliki pesan baru.", // Isi pesan

    // Path ikon harus benar relatif ke root host situs Anda,
    // dan juga mempertimbangkan `APP_BASE_URL` jika aplikasi di-deploy di sub-path.
    // Saat di localhost, pathnya '/images/...' akan berfungsi jika publicDir dikonfigurasi benar.
    // Saat di GitHub Pages, '/Story-app-with-vite/images/...' akan berfungsi.
    icon:
      data.options && data.options.icon
        ? data.options.icon
        : "/images/icon-icon-x192.png", // Icon notifikasi

    badge:
      data.options && data.options.badge
        ? data.options.badge
        : "/images/maskable-icon-x48.png", // Badge notifikasi (biasanya di Android)

    image: data.options ? data.options.image : undefined, // Gambar besar di notifikasi (opsional)
    data: data.options ? data.options.data : {}, // Data tambahan untuk notifikasi (misal: URL untuk navigasi)
    actions: data.options ? data.options.actions : [], // Tombol aksi di notifikasi (opsional)
  };

  // Tampilkan notifikasi ke pengguna.
  // event.waitUntil() memastikan service worker tetap hidup sampai notifikasi ditampilkan.
  event.waitUntil(self.registration.showNotification(title, options)); //
});

// Event listener untuk saat notifikasi diklik oleh pengguna.
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notifikasi diklik:", event.notification.tag); // Log tag notifikasi yang diklik
  event.notification.close(); // Tutup notifikasi setelah diklik

  // Tentukan URL tujuan saat notifikasi diklik.
  // Jika ada URL di `data` notifikasi, gunakan itu; jika tidak, default ke `start_url` aplikasi.
  const targetUrl =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/Story-app-with-vite/"; // URL default, pastikan sesuai dengan base aplikasi Anda

  // Buka jendela baru atau fokus ke tab yang sudah ada.
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        // Mencocokkan URL client yang sudah ada dengan URL target.
        // Gunakan `startsWith` karena URL bisa memiliki fragmen hash atau parameter.
        // Pastikan URL klien juga diawali dengan base path.
        if (
          client.url.startsWith(
            new URL(targetUrl, self.location.origin).href
          ) &&
          "focus" in client
        ) {
          return client.focus(); // Fokus ke tab yang sudah ada
        }
      }
      // Jika tidak ada tab yang cocok, buka tab baru.
      return clients.openWindow(targetUrl);
    })
  );
});
// --- AKHIR LOGIKA NOTIFIKASI PUSH ---

// --- KONFIGURASI RUNTIME CACHING Workbox (dipindahkan dari vite.config.js) ---

// Rute untuk caching API cerita menggunakan strategi NetworkFirst.
// Ini akan mencoba mengambil dari jaringan terlebih dahulu, lalu fallback ke cache.
registerRoute(
  ({ url }) => url.href.includes("story-api.dicoding.dev/v1/stories"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10, // Maksimal 10 entri di cache
        maxAgeSeconds: 60 * 60 * 24 * 7, // Data cache berlaku selama 7 hari
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Hanya cache respons dengan status OK (200) atau opaque (0)
      }),
    ],
  }),
  "GET" // Metode HTTP yang akan di-cache
);

// Rute untuk caching aset eksternal (CDN seperti Cloudflare, Unpkg) menggunakan strategi CacheFirst.
// Ini akan mencoba dari cache terlebih dahulu, lalu fallback ke jaringan.
registerRoute(
  ({ url }) =>
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.origin === "https://unpkg.com",
  new CacheFirst({
    cacheName: "external-assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // Maksimal 50 entri
        maxAgeSeconds: 60 * 60 * 24 * 30, // Data cache berlaku selama 30 hari
      }),
    ],
  }),
  "GET"
);

// Rute untuk caching gambar cerita dari API menggunakan strategi CacheFirst.
registerRoute(
  /^https:\/\/story-api\.dicoding\.dev\/images\/stories\/.*\.(png|jpg|jpeg|gif|webp|blob)$/,
  new CacheFirst({
    cacheName: "story-images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100, // Maksimal 100 entri
        maxAgeSeconds: 60 * 60 * 24 * 30, // Data cache berlaku selama 30 hari
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  "GET"
);

// Rute untuk caching aset statis lokal (gambar, ikon, screenshot) menggunakan strategi CacheFirst.
// Regex ini harus cocok dengan path aset Anda setelah build di folder dist,
// dengan mempertimbangkan APP_BASE_URL.
registerRoute(
  /\/Story-app-with-vite\/(images|icons|screenshot)\/.*\.(png|jpg|jpeg|svg|webp)$/,
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

// Rute untuk navigasi Single-Page Application (SPA).
// Memastikan semua permintaan navigasi dilayani oleh `index.html` yang di-precache.
registerRoute(
  new NavigationRoute(
    // createHandlerBoundToURL akan mem-precache index.html dan mengembalikannya untuk rute navigasi.
    // URL ini harus sesuai dengan `start_url` di manifest dan `APP_BASE_URL` Anda.
    createHandlerBoundToURL("/Story-app-with-vite/index.html"),
    {
      // allowlist: Pola regex untuk URL yang diizinkan untuk rute navigasi.
      allowlist: [/^\/Story-app-with-vite\//],
      // denylist: Pola regex untuk URL yang tidak boleh menggunakan rute navigasi ini.
      denylist: [
        /^.*\/auth\//, // Contoh: Jangan gunakan untuk halaman autentikasi
        /^https:\/\/story-api\.dicoding\.dev\//, // Contoh: Jangan gunakan untuk permintaan API
      ],
    }
  )
);
// --- AKHIR RUNTIME CACHING ---
