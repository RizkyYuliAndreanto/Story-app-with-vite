// src/data/api.js
import CONFIG from "../config.js";
import { addStoryToDb, getAllStoriesFromDb } from "../utils/indexeddb.js";

// Debug: Daftar endpoint API
const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ABOUT: `${CONFIG.BASE_URL}/about`,
  AUTH: {
    LOGIN: `${CONFIG.BASE_URL}/login`,
    REGISTER: `${CONFIG.BASE_URL}/register`,
    LOGOUT: `${CONFIG.BASE_URL}/logout`,
  },
  NOTIFICATIONS: {
    SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
    UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  },
};

// Debug: Fungsi register user
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

// Debug: Fungsi login user
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

// Debug: Ambil semua cerita (dengan fallback offline)
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
      data.listStory.forEach(async (story) => {
        await addStoryToDb(story);
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching stories from API:", error);
    // Debug: Fallback ke IndexedDB jika offline
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

// Debug: Tambah cerita baru
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
      await addStoryToDb(newStory);
    }

    return data;
  } catch (error) {
    console.error("Error in addStory API:", error);
    throw error;
  }
}

// Debug: Konversi dataURL ke Blob
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

// Debug: Subscribe notifikasi push
export async function subscribeNotification(token, subscription) {
  try {
    const requestBody = {
      endpoint: subscription.endpoint,
      keys: {
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
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
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

// Debug: Unsubscribe notifikasi push
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

// Debug: Ambil detail cerita berdasarkan ID
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

export default ENDPOINTS;
