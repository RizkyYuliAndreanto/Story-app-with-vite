// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "images/*.png",
        "screenshot/*.png",
      ],
      manifest: {
        name: "Story App Dicoding",
        short_name: "StoryApp",
        description: "Aplikasi untuk berbagi cerita dari Dicoding.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#304ffe",
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
            url: "/#/addstory",
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
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico,json}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.href.includes("story-api.dicoding.dev/v1/stories"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === "https://cdnjs.cloudflare.com" ||
              url.origin === "https://unpkg.com",
            handler: "CacheFirst",
            options: {
              cacheName: "external-assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.href.includes("story-api.dicoding.dev/images/stories/"),
            handler: "CacheFirst",
            options: {
              cacheName: "story-images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
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
  },
});
