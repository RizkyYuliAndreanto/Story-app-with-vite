// src/scripts/index.js

// Impor file CSS utama Anda. Vite akan mengurus bundling-nya.
import "../styles/styles.css";
import { isAuthenticated, clearAuth, isProtectedRoute } from "./utils/auth";
import App from "./pages/app";
import {
  subscribeUserToPush,
  checkNotificationSubscriptionStatus,
  toggleNotificationSubscription,
} from "./utils/notification";

// Debug: File index.js dimuat
console.debug("[index.js] Loaded");

// Base URL aplikasi Anda. PENTING: HARUS SESUAI dengan `start_url` di manifest
// dan `scope` service worker.
const APP_BASE_URL = "/Story-app-with-vite/";

// Debug: Update status autentikasi dan UI terkait
function updateAuthStatus() {
  const isUserAuthenticated = isAuthenticated();
  document.body.classList.toggle("authenticated", isUserAuthenticated);
  // Panggil checkNotificationSubscriptionStatus untuk update UI tombol notifikasi
  checkNotificationSubscriptionStatus();
  console.debug("[index.js] updateAuthStatus:", {
    isUserAuthenticated,
  });
}

// Debug: Setup tombol logout
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth(); // Hapus token autentikasi
      updateAuthStatus(); // Perbarui status UI
      console.debug("[index.js] Logout clicked, redirecting to #/login");
      // Gunakan View Transitions API jika didukung untuk transisi yang mulus
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = "#/login";
        });
      } else {
        window.location.hash = "#/login";
      }
    });
    console.debug("[index.js] Logout button listener attached");
  } else {
    console.warn("[index.js] Logout button not found");
  }
}

// Debug: Setup tombol toggle notifikasi push
function setupNotificationToggle() {
  const notificationToggleBtn = document.getElementById(
    "notification-toggle-btn"
  );
  if (notificationToggleBtn) {
    notificationToggleBtn.addEventListener(
      "click",
      toggleNotificationSubscription
    );
    // Panggil ini untuk update UI awal tombol saat DOMContentLoaded
    checkNotificationSubscriptionStatus();
    console.debug("[index.js] Notification toggle listener attached");
  } else {
    console.warn("[index.js] Notification toggle button not found");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.debug("[index.js] DOMContentLoaded");

  // Dapatkan referensi elemen DOM yang diperlukan
  const mainContentEl = document.querySelector("#main-content");
  const drawerButtonEl = document.querySelector("#drawer-button");
  const navigationDrawerEl = document.querySelector("#navigation-drawer");
  const sidebarOverlayEl = document.querySelector(".sidebar-overlay");

  console.debug("[index.js] DOM elements", {
    mainContentEl: !!mainContentEl,
    drawerButtonEl: !!drawerButtonEl,
    navigationDrawerEl: !!navigationDrawerEl,
    sidebarOverlayEl: !!sidebarOverlayEl,
  });

  // Periksa apakah semua elemen DOM yang diperlukan ada
  if (
    !mainContentEl ||
    !drawerButtonEl ||
    !navigationDrawerEl ||
    !sidebarOverlayEl
  ) {
    console.error("[index.js] Required DOM elements not found. App aborted.");
    return;
  }

  // Inisialisasi instance App utama
  const app = new App({
    content: mainContentEl,
    drawerButton: drawerButtonEl,
    navigationDrawer: navigationDrawerEl,
    sidebarOverlay: sidebarOverlayEl,
  });
  console.debug("[index.js] App instance created");

  // Guard rute awal: Redirect ke halaman login jika rute dilindungi dan user belum autentikasi
  const currentHash = window.location.hash;
  const authStatus = isAuthenticated();
  const protectedRoute = isProtectedRoute(currentHash);
  console.debug("[index.js] Route guard", {
    currentHash,
    authStatus,
    protectedRoute,
  });

  if (protectedRoute && !authStatus) {
    console.debug("[index.js] Redirect unauthenticated to #/login");
    sessionStorage.setItem("returnTo", currentHash); // Simpan rute saat ini untuk kembali setelah login
    window.location.hash = "#/login";
  }

  // Perbarui status autentikasi UI awal
  updateAuthStatus();

  // --- Opsional: Panggil subscribeUserToPush jika ingin auto-subscribe setelah SW siap ---
  // Pastikan ada kondisi yang sesuai (misal: user sudah login) agar tidak meminta izin berlebihan.
  if ("serviceWorker" in navigator && isAuthenticated()) {
    console.debug(
      "[index.js] Service Worker supported and user authenticated. Attempting auto-subscribe to push."
    );
    // navigator.serviceWorker.ready akan menunggu service worker terdaftar dan aktif.
    const registration = await navigator.serviceWorker.ready;
    subscribeUserToPush(registration);
  } else if (!isAuthenticated()) {
    console.debug(
      "[index.js] User not authenticated, skipping auto-subscribe to push."
    );
  } else {
    console.warn(
      "[index.js] Service Worker not supported by browser, skipping auto-subscribe to push."
    );
  }

  // Render halaman awal aplikasi
  await app.renderPage();
  console.debug("[index.js] app.renderPage() initial");

  // Setup event listener untuk tombol logout dan notifikasi
  setupLogout();
  setupNotificationToggle();

  // Event listener untuk perubahan hash (routing sisi klien)
  window.addEventListener("hashchange", async () => {
    console.debug("[index.js] hashchange");

    const newHash = window.location.hash;
    const newAuthStatus = isAuthenticated();
    const newProtectedRoute = isProtectedRoute(newHash);
    console.debug("[index.js] Hashchange guard", {
      newHash,
      newAuthStatus,
      newProtectedRoute,
    });

    if (newProtectedRoute && !newAuthStatus) {
      console.debug("[index.js] Redirect unauthenticated on hashchange");
      sessionStorage.setItem("returnTo", newHash);
      window.location.hash = "#/login";
    }

    // Gunakan View Transitions API untuk transisi halaman yang mulus
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await app.renderPage();
      });
    } else {
      await app.renderPage();
    }
    updateAuthStatus(); // Perbarui status UI notifikasi setelah hashchange
    console.debug("[index.js] app.renderPage() after hashchange");
  });
});
