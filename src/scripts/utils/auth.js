
export const AUTH_CONFIG = {
  TOKEN_KEY: "token",
  USER_KEY: "userData",
  PROTECTED_ROUTES: ["#/addstory", "#/profile"],
  LOGIN_ROUTE: "#/login",
};

// Check authentication status
export function isAuthenticated() {
  return !!localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Redirect if not authenticated
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
export function isProtectedRoute(path) {
  return AUTH_CONFIG.PROTECTED_ROUTES.some((route) => path.startsWith(route));
}
