// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Root aplikasi Vite Anda, tempat `index.html` dan `sw.js` sumber berada
  root: resolve(__dirname, "src"),

  // Direktori aset statis publik Anda (misalnya, ikon, gambar, manifest.json)
  // Ini diasumsikan sekarang berada di `(root proyek Anda)/public/`
  publicDir: resolve(__dirname, "public"),

  build: {
    outDir: resolve(__dirname, "dist"), // Direktori output build
    emptyOutDir: true, // Bersihkan direktori output sebelum build
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // Alias untuk impor modul
    },
  },
  plugins: [
    VitePWA({
      // --- KONFIGURASI PWA UTAMA UNTUK NOTIFIKASI PUSH ---
      registerType: "injectManifest", // PENTING: Menggunakan mode injectManifest
      // Direktori tempat file service worker kustom Anda berada,
      // relatif terhadap `root` yang diatur di atas (yaitu, `src/`).
      srcDir: ".", // Ini berarti Workbox akan mencari `sw.js` di `src/sw.js`
      filename: "sw.js", // Nama file service worker yang akan dihasilkan di `dist/`
      // --- AKHIR KONFIGURASI PWA UTAMA ---

      // Aset yang akan disertakan dalam Workbox's precaching manifest
      includeAssets: [
        "favicon.png",
        "images/*.png",
        "screenshot/*.png",
        "icons/*.png",
      ],
      manifest: {
        name: "Story App Dicoding",
        short_name: "StoryApp",
        description: "Aplikasi untuk berbagi cerita dari Dicoding.",
        // URL awal aplikasi saat diluncurkan sebagai PWA
        // HARUS SESUAI dengan `APP_BASE_URL` di `src/scripts/index.js`
        // dan `scope` service worker.
        start_url: "/Story-app-with-vite/",
        display: "standalone", // Mode tampilan PWA
        background_color: "#ffffff", // Warna latar belakang PWA
        theme_color: "#304ffe", // Warna tema PWA
        icons: [
          { src: "favicon.png", sizes: "192x192", type: "image/png" },
          { src: "favicon.png", sizes: "512x512", type: "image/png" },
          {
            src: "images/add-icon-x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/add-icon-x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "images/bookmark-icon-x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/bookmark-icon-x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "images/icon-icon-x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "images/icon-icon-x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/maskable-icon-x48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/maskable-icon-x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/maskable-icon-x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/maskable-icon-x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/maskable-icon-x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Tambah Cerita Baru",
            short_name: "Tambah",
            description: "Menambahkan cerita baru ke aplikasi.",
            url: "/#/addstory", // URL shortcut
            icons: [{ src: "images/add-icon-x192.png", sizes: "192x192" }],
          },
        ],
        screenshots: [
          {
            src: "screenshot/Screenshot_desktop_1.jpg",
            sizes: "1280x582",
            type: "image/png",
            form_factor: "wide",
            label: "Tampilan Desktop Aplikasi Story App (1)",
          },
          {
            src: "screenshot/Screenshot_desktop_2.jpg",
            sizes: "1280x847",
            type: "image/png",
            form_factor: "wide",
            label: "Tampilan Desktop Aplikasi Story App (2)",
          },
          {
            src: "screenshot/Screenshots_mobile_1.jpg",
            sizes: "362x789",
            type: "image/png",
            form_factor: "narrow",
            label: "Tampilan Mobile Aplikasi Story App (1)",
          },
          {
            src: "screenshot/screenshoot_mobile_2.jpg",
            sizes: "362x794",
            type: "image/png",
            form_factor: "narrow",
            label: "Tampilan Mobile Aplikasi Story App (2)",
          },
        ],
      },
      workbox: {
        // Pola glob untuk file yang akan di-precache oleh Workbox
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico,json}"],
        // Catatan: runtimeCaching TIDAK ADA di sini karena menggunakan injectManifest.
        // Semua rute runtimeCaching didefinisikan di src/sw.js
      },
    }),
  ],
  server: {
    proxy: {
      "/v1": {
        target: "https://story-api.dicoding.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1/, "/v1"),
        secure: true,
      },
    },
    hmr: {
      overlay: true, // Tampilkan overlay error HMR di browser
    },
  },
});
