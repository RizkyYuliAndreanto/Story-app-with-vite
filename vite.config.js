import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
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
  // --- Tambahkan konfigurasi proxy di sini ---
  server: {
    proxy: {
      "/v1": {
        // Setiap request yang dimulai dengan /v1 akan diproxy
        target: "https://story-api.dicoding.dev", // Target API Dicoding
        changeOrigin: true, // Mengubah origin header request ke target
        rewrite: (path) => path.replace(/^\/v1/, "/v1"), // Memastikan path tetap /v1
        secure: true, // Untuk HTTPS (penting jika target adalah HTTPS)
      },
    },
  },
  // --- Akhir konfigurasi proxy ---
});
