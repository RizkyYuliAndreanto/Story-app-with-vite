// src/scripts/utils/auth.js
import { getRoute } from "../routes/url-parser.js";

// Konfigurasi kunci dan rute autentikasi
export const AUTH_CONFIG = {
  TOKEN_KEY: "token",
  USER_KEY: "userData",
  PROTECTED_ROUTES: ["/", "/addstory", "/profile", "/stories/:id", "/bookmark"],
  LOGIN_ROUTE: "#/login",
};

// Mengecek status autentikasi user
export function isAuthenticated() {
  return !!localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Melakukan redirect ke halaman login jika belum login
export function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.hash = AUTH_CONFIG.LOGIN_ROUTE;
    return false;
  }
  return true;
}

// Menyimpan data autentikasi (token & user)
export function setAuthData(token, userData) {
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
}

// Menghapus data autentikasi dari localStorage
export function clearAuth() {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
}

// Mengambil data user yang sudah login
export function getAuthUser() {
  const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

// Mengambil token autentikasi
export function getAuthToken() {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Mengecek apakah rute tertentu membutuhkan autentikasi
export function isProtectedRoute(fullPathWithHash) {
  // Membersihkan hash dan mendapatkan rute dinamis
  const cleanRoute = getRoute(fullPathWithHash.replace("#", ""));
  // Cek apakah rute termasuk dalam daftar rute yang dilindungi
  return AUTH_CONFIG.PROTECTED_ROUTES.some((protectedRoute) => {
    return cleanRoute === protectedRoute;
  });
}
