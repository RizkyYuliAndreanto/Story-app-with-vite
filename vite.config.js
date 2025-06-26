// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  root: resolve(__dirname, "src"),

  publicDir: resolve(__dirname, "public"),

  base: "/Story-app-with-vite/",

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
      strategies: "injectManifest",

      srcDir: ".",

      filename: "sw.js",

      registerType: "autoUpdate",

      devOptions: {
        enabled: true,
        type: "module",
      },

      includeAssets: [
        "favicon.png",

        "images/add-icon-x192.png",
        "images/add-icon-x512.png",
        "images/bookmark-icon-x192.png",
        "images/bookmark-icon-x512.png",
        "images/icon-icon-x144.png",
        "images/icon-icon-x192.png",
        "images/maskable-icon-x48.png",
        "images/maskable-icon-x96.png",
        "images/maskable-icon-x192.png",
        "images/maskable-icon-x384.png",
        "images/maskable-icon-x512.png",
        "screenshot/*.jpg",
        "manifest.webmanifest",
      ],
      manifest: {
        name: "Story App Dicoding",
        short_name: "StoryApp",
        description: "Aplikasi untuk berbagi cerita dari Dicoding.",
        start_url: "/Story-app-with-vite/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#304ffe",
        icons: [
          { src: "favicon.png", sizes: "192x192", type: "image/png" },
          { src: "favicon.png", sizes: "512x512", type: "image/png" },
          {
            src: "images/icon-icon-x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icon-icon-x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },

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
            url: "/Story-app-with-vite/#/addstory",
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
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
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
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              `[Proxy Request] ${req.method} ${req.url} -> ${options.target}${req.url}`
            );
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader(
              "Access-Control-Allow-Methods",
              "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
            );
            res.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization"
            );
            console.log(
              `[Proxy Response] ${req.method} ${req.url} - Status: ${proxyRes.statusCode}`
            );
          });
        },
      },
    },
    hmr: { overlay: true },
  },
});
