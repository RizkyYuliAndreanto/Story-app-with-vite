// src/data/api.js
import CONFIG from "../config.js";
// Asumsi ada file indexeddb.js untuk addStoryToDb dan getAllStoriesFromDb
// Jika tidak ada, fungsi yang menggunakannya akan menyebabkan error.
import { addStoryToDb, getAllStoriesFromDb } from "../utils/indexeddb.js";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ABOUT: `${CONFIG.BASE_URL}/about`,
  AUTH: {
    LOGIN: `${CONFIG.BASE_URL}/login`,
    REGISTER: `${CONFIG.BASE_URL}/register`,
    LOGOUT: `${CONFIG.BASE_URL}/logout`,
  },
  // --- ENDPOINT BARU UNTUK NOTIFIKASI ---
  NOTIFICATIONS: {
    SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
    UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  },
  // --- AKHIR ENDPOINT BARU ---
};

// Fungsi-fungsi yang ada sebelumnya (disertakan untuk konteks)
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
    throw new Error(
      data.message || `Login failed with status ${response.status}`
    );
  }

  return data;
}

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

    if (data.listStory && Array.isArray(data.listStory)) {
      // Menggunakan addStoryToDb - pastikan indexeddb.js ada
      data.listStory.forEach(async (story) => {
        await addStoryToDb(story);
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching stories from API:", error);
    // Menggunakan getAllStoriesFromDb - pastikan indexeddb.js ada
    const cachedStories = await getAllStoriesFromDb();
    if (cachedStories && cachedStories.length > 0) {
      console.log("Mengambil cerita dari IndexedDB (offline mode).");
      return {
        error: false,
        message: "Berhasil mengambil cerita dari IndexedDB",
        listStory: cachedStories,
      };
    }
    throw error;
  }
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

    if (data.storyId) {
      const newStory = {
        id: data.storyId,
        description: formData.get("description"),
        photoUrl: "https://via.placeholder.com/150",
        createdAt: new Date().toISOString(),
        name: "Nama Pengguna",
      };
      // Menggunakan addStoryToDb - pastikan indexeddb.js ada
      await addStoryToDb(newStory);
    }

    return data;
  } catch (error) {
    console.error("Error in addStory API:", error);
    throw error;
  }
}

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

// --- FUNGSI BARU UNTUK NOTIFIKASI ---

export async function subscribeNotification(token, subscription) {
  try {
    // Ekstrak data yang dibutuhkan sesuai format API
    const requestBody = {
      endpoint: subscription.endpoint,
      keys: {
        // API mengharapkan keys sebagai objek dengan p256dh dan auth
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    const response = await fetch(ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // Gunakan requestBody yang diformat
    });

    const data = await response.json();

    if (!response.ok) {
      // Tangkap pesan error dari respons API jika ada
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

export async function unsubscribeNotification(token, endpoint) {
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
// --- AKHIR FUNGSI BARU ---

export async function getStoryById(id, token) {
  // <-- Pastikan ada 'export' di sini
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
    return data.story; // API mengembalikan objek 'story' di dalamnya
  } catch (error) {
    console.error(`Error fetching detail story ID ${id} from API:`, error);
    throw error;
  }
}

export default ENDPOINTS;
