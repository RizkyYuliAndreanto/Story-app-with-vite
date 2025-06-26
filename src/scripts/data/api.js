// src/data/api.js
import CONFIG from "../config.js";
import { getAuthToken } from "../utils/auth.js"; // Pastikan getAuthToken diimpor

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  AUTH: {
    LOGIN: `${CONFIG.BASE_URL}/login`,
    REGISTER: `${CONFIG.BASE_URL}/register`,
  },
  NOTIFICATIONS: {
    SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
    UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  },
  // Catatan: Endpoint untuk memicu notifikasi seperti di bawah ini TIDAK ADA di dokumentasi API Dicoding Story.
  // Ini hanya sebagai placeholder agar kode di presenter tidak error.
  SEND_STORY_NOTIFICATION: `${CONFIG.BASE_URL}/non-existent-notification-trigger-endpoint`,
};

// Fungsi register user
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

// Fungsi login user
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
    throw new Error(
      data.message || `Login failed with status ${response.status}`
    );
  }

  return data;
}

// Ambil semua cerita (dengan fallback offline)
export async function allStories(token) {
  try {
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

    return data;
  } catch (error) {
    console.error("Error fetching stories from API:", error);
    throw error;
  }
}

// Tambah cerita baru
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

// Konversi dataURL ke Blob
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

// Subscribe notifikasi push
// Parameter `subscription` diharapkan adalah hasil dari `PushSubscription.toJSON()`
export async function subscribeNotification(subscription) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Tidak ada token autentikasi. Anda harus login.");
  }
  try {
    // Filter hanya properti yang diizinkan oleh API: endpoint dan keys
    const requestBody = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      // Properti lain seperti `expirationTime` TIDAK diizinkan oleh API Dicoding Story.
    };

    const response = await fetch(ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      // API mengembalikan 400 jika ada properti yang tidak diizinkan.
      // Pesan error dari server akan ada di data.message.
      throw new Error(
        data.message ||
          `Gagal berlangganan notifikasi. Status: ${response.status}`
      );
    }
    return data;
  } catch (error) {
    console.error("Error subscribing notification:", error);
    throw error;
  }
}

// Unsubscribe notifikasi push
export async function unsubscribeNotification(endpoint) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Tidak ada token autentikasi. Anda harus login.");
  }
  try {
    const response = await fetch(ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Gagal berhenti berlangganan notifikasi."
      );
    }
    return data;
  } catch (error) {
    console.error("Error unsubscribing notification:", error);
    throw error;
  }
}

// Ambil detail cerita berdasarkan ID
export async function getStoryById(id, token) {
  try {
    const response = await fetch(`${ENDPOINTS.STORIES}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Gagal mengambil detail cerita ID: ${id}`
      );
    }
    return data.story;
  } catch (error) {
    console.error(`Error fetching detail story ID ${id} from API:`, error);
    throw error;
  }
}

// --- FUNGSI-FUNGSI DI BAWAH INI TIDAK ADA DI DOKUMENTASI API DICODING STORY ---
// Mereka disimulasikan untuk menghindari error di presenter dan memberi tahu bahwa
// endpoint ini tidak didukung oleh API yang ada.

export async function sendStoryNotificationToBackend(
  storyId,
  notificationData
) {
  console.warn(
    `[API] sendStoryNotificationToBackend called for storyId: ${storyId}, but this endpoint for sending notifications is NOT SUPPORTED by Dicoding Story API.`
  );
  console.info(
    "Notification data (would be sent to backend):",
    notificationData
  );
  return {
    error: true,
    message:
      "Endpoint for sending notifications is not supported by Dicoding Story API.",
    ok: false,
  };
}

export default ENDPOINTS;
