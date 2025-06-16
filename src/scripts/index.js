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

const APP_BASE_URL = "/Story-app-with-vite/";

// Debug: Update status autentikasi
function updateAuthStatus() {
  const isUserAuthenticated = isAuthenticated();
  document.body.classList.toggle("authenticated", isUserAuthenticated);
  checkNotificationSubscriptionStatus();
  console.debug("[index.js] updateAuthStatus:", { isUserAuthenticated });
}

// Debug: Setup tombol logout
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      updateAuthStatus();
      console.debug("[index.js] Logout clicked, redirecting to #/login");
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

// Debug: Setup toggle notifikasi
function setupNotificationToggle() {
  const notificationToggleBtn = document.getElementById(
    "notification-toggle-btn"
  );
  if (notificationToggleBtn) {
    notificationToggleBtn.addEventListener(
      "click",
      toggleNotificationSubscription
    );
    checkNotificationSubscriptionStatus();
    console.debug("[index.js] Notification toggle listener attached");
  } else {
    console.warn("[index.js] Notification toggle button not found");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.debug("[index.js] DOMContentLoaded");

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

  if (
    !mainContentEl ||
    !drawerButtonEl ||
    !navigationDrawerEl ||
    !sidebarOverlayEl
  ) {
    console.error("[index.js] Required DOM elements not found. App aborted.");
    return;
  }

  // Debug: Inisialisasi App utama
  const app = new App({
    content: mainContentEl,
    drawerButton: drawerButtonEl,
    navigationDrawer: navigationDrawerEl,
    sidebarOverlay: sidebarOverlayEl,
  });
  console.debug("[index.js] App instance created");

  // Debug: Guard rute awal
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
    sessionStorage.setItem("returnTo", currentHash);
    window.location.hash = "#/login";
  }

  updateAuthStatus();

  // Debug: Registrasi Service Worker hanya di production
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    console.debug("[index.js] Service Worker supported and in production mode");
    try {
      const swUrl = `${APP_BASE_URL}sw.js`;
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: APP_BASE_URL,
      });
      console.debug("[index.js] Service Worker registered", {
        scope: registration.scope,
      });
      // Debug: Aktifkan push notification jika diperlukan
      // subscribeUserToPush(registration);
    } catch (error) {
      console.error("[index.js] Service Worker registration failed", error);
    }
  } else if (!import.meta.env.PROD) {
    console.warn(
      "[index.js] Service Worker registration skipped in development mode."
    );
  } else {
    console.warn("[index.js] Service Worker not supported by browser.");
  }

  // Debug: Render halaman awal
  await app.renderPage();
  console.debug("[index.js] app.renderPage() initial");

  setupLogout();
  setupNotificationToggle();

  // Debug: Routing hashchange
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

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await app.renderPage();
      });
    } else {
      await app.renderPage();
    }
    updateAuthStatus();
    console.debug("[index.js] app.renderPage() after hashchange");
  });
});
