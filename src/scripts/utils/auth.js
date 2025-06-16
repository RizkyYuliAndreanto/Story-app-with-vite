// src/scripts/utils/auth.js
import { getRoute } from "../routes/url-parser.js"; // Import getRoute

export const AUTH_CONFIG = {
  TOKEN_KEY: "token",
  USER_KEY: "userData",
  // Daftarkan rute TANPA hash di sini, dan pastikan sesuai dengan hasil getRoute
  PROTECTED_ROUTES: ["/", "/addstory", "/profile", "/stories/:id", "/bookmark"], // Tambahkan '/stories/:id' dan '/bookmark' jika mereka juga dilindungi
  LOGIN_ROUTE: "#/login",
};

// Check authentication status
export function isAuthenticated() {
  return !!localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Redirect if not authenticated (fungsi ini dipanggil dari luar)
export function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.hash = AUTH_CONFIG.LOGIN_ROUTE;
    return false;
  }
  return true;
}

// Store authentication data
export function setAuthData(token, userData) {
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
}

// Clear authentication data
export function clearAuth() {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
}

// Get authenticated user data
export function getAuthUser() {
  const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

// Get auth token
export function getAuthToken() {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Check if route is protected
export function isProtectedRoute(fullPathWithHash) {
  // Gunakan getRoute dari url-parser untuk mendapatkan rute yang sudah 'bersih'
  // Misalnya, "#/login" akan jadi "/login", "/stories/123" akan jadi "/stories/:id"
  const cleanRoute = getRoute(fullPathWithHash.replace("#", ""));

  // Sekarang bandingkan cleanRoute dengan rute yang ada di PROTECTED_ROUTES secara persis
  // Perhatikan bahwa di PROTECTED_ROUTES, kita sekarang menggunakan rute TANPA hash
  return AUTH_CONFIG.PROTECTED_ROUTES.some((protectedRoute) => {
    return cleanRoute === protectedRoute;
  });
}
