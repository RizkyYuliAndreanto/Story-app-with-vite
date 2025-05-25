// src/data/api.js
import CONFIG from "../config.js";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ABOUT: `${CONFIG.BASE_URL}/about`,
  AUTH: {
    LOGIN: `${CONFIG.BASE_URL}/login`,
    REGISTER: `${CONFIG.BASE_URL}/register`,
    LOGOUT: `${CONFIG.BASE_URL}/logout`,
  },
};

export async function registerUser(userData) {
  const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
}

export async function loginUser(userData) {
  const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    // Jika response error (4xx/5xx)
    throw new Error(
      data.message || `Login failed with status ${response.status}`
    );
  }

  return data;
}

export async function allStories(token) {
  const response = await fetch(ENDPOINTS.STORIES, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengambil data cerita");
  }

  return data; // Pastikan ini mengembalikan object dengan array stories
}

export async function addStory(formData, token) {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal menambahkan cerita");
    }

    return data;
  } catch (error) {
    console.error("Error in addStory API:", error);
    throw error;
  }
}

// Add this to your api.js if not already present
export function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}
export default ENDPOINTS;
