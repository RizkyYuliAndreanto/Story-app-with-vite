import "../styles/styles.css";
import { isAuthenticated, clearAuth, isProtectedRoute } from "./utils/auth";
import App from "./pages/app";

function updateAuthStatus() {
  document.body.classList.toggle("authenticated", isAuthenticated());
}

function setupLogout() {
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    clearAuth();
    updateAuthStatus();
    // Memastikan transisi berjalan saat logout
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = "#/login";
      });
    } else {
      window.location.hash = "#/login";
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Handle protected routes
  if (isProtectedRoute(window.location.hash) && !isAuthenticated()) {
    sessionStorage.setItem("returnTo", window.location.hash);
    window.location.hash = "#/login";
    return;
  }

  updateAuthStatus();

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();
  setupLogout();

  window.addEventListener("hashchange", async () => {
    if (isProtectedRoute(window.location.hash) && !isAuthenticated()) {
      sessionStorage.setItem("returnTo", window.location.hash);
      window.location.hash = "#/login";
      return;
    }

    // Mengimplementasikan View Transition API
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        //
        await app.renderPage();
      });
    } else {
      await app.renderPage();
    }
  });
});
