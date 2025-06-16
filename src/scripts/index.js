// src/scripts/index.js
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

function updateAuthStatus() {
  const isUserAuthenticated = isAuthenticated();
  document.body.classList.toggle("authenticated", isUserAuthenticated);
  checkNotificationSubscriptionStatus();
  // Debug: Status autentikasi diperbarui
  console.debug("[index.js] updateAuthStatus:", { isUserAuthenticated });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      updateAuthStatus();
      // Debug: Logout diklik
      console.debug("[index.js] Logout clicked, redirecting to #/login");
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          window.location.hash = "#/login";
        });
      } else {
        window.location.hash = "#/login";
      }
    });
    // Debug: Logout button listener terpasang
    console.debug("[index.js] Logout button listener attached");
  } else {
    // Debug: Logout button tidak ditemukan
    console.warn("[index.js] Logout button not found");
  }
}

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
    // Debug: Notification toggle listener terpasang
    console.debug("[index.js] Notification toggle listener attached");
  } else {
    // Debug: Notification toggle button tidak ditemukan
    console.warn("[index.js] Notification toggle button not found");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Debug: DOMContentLoaded
  console.debug("[index.js] DOMContentLoaded");

  const mainContentEl = document.querySelector("#main-content");
  const drawerButtonEl = document.querySelector("#drawer-button");
  const navigationDrawerEl = document.querySelector("#navigation-drawer");
  const sidebarOverlayEl = document.querySelector(".sidebar-overlay");

  // Debug: Cek elemen DOM
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

  const app = new App({
    content: mainContentEl,
    drawerButton: drawerButtonEl,
    navigationDrawer: navigationDrawerEl,
    sidebarOverlay: sidebarOverlayEl,
  });
  // Debug: App instance dibuat
  console.debug("[index.js] App instance created");

  const currentHash = window.location.hash;
  const authStatus = isAuthenticated();
  const protectedRoute = isProtectedRoute(currentHash);
  // Debug: Guard awal rute
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

  if ("serviceWorker" in navigator) {
    // Debug: Service Worker support
    console.debug("[index.js] Service Worker supported");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      // Debug: Service Worker registered
      console.debug("[index.js] Service Worker registered", {
        scope: registration.scope,
      });
      // subscribeUserToPush(registration);
    } catch (error) {
      console.error("[index.js] Service Worker registration failed", error);
    }
  } else {
    console.warn("[index.js] Service Worker not supported");
  }

  await app.renderPage();
  // Debug: Halaman dirender pertama kali
  console.debug("[index.js] app.renderPage() initial");

  setupLogout();
  setupNotificationToggle();

  window.addEventListener("hashchange", async () => {
    // Debug: Hashchange event
    console.debug("[index.js] hashchange");

    const newHash = window.location.hash;
    const newAuthStatus = isAuthenticated();
    const newProtectedRoute = isProtectedRoute(newHash);
    // Debug: Guard hashchange
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
    // Debug: Halaman dirender setelah hashchange
    console.debug("[index.js] app.renderPage() after hashchange");
  });
});
