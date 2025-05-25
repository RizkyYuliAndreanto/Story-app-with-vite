// src/utils/auth.js
export function isAuthenticated() {
  const token = localStorage.getItem("token");
  return !!token;
}

export function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.hash = "#/login";
  }
}
