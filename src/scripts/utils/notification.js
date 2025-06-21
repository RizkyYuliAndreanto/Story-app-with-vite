// src/scripts/utils/notification.js
import CONFIG from "../config.js"; // Sesuaikan path jika berbeda
import { getAuthToken } from "./auth.js"; // Sesuaikan path jika berbeda
import { subscribeNotification, unsubscribeNotification } from "../data/api.js"; // Sesuaikan path jika berbeda

// [DEBUG:notification] Konversi VAPID key base64 ke Uint8Array
function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// [DEBUG:notification] Cek status langganan notifikasi & update UI tombol
export async function checkNotificationSubscriptionStatus() {
  const notificationToggleBtn = document.getElementById(
    "notification-toggle-btn"
  );
  const notificationBtnText = document.getElementById("notification-btn-text");
  if (!notificationToggleBtn || !notificationBtnText) return;

  // Pastikan browser mendukung Service Worker dan PushManager
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    notificationToggleBtn.style.display = "none"; // Sembunyikan tombol jika tidak didukung
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      notificationToggleBtn.classList.add("subscribed");
      notificationBtnText.textContent = "Nonaktifkan Notifikasi";
      notificationToggleBtn.querySelector("i").className = "fas fa-bell-slash";
      console.debug("[DEBUG:notification] User sudah berlangganan notifikasi");
    } else {
      notificationToggleBtn.classList.remove("subscribed");
      notificationBtnText.textContent = "Aktifkan Notifikasi";
      notificationToggleBtn.querySelector("i").className = "fas fa-bell";
      console.debug("[DEBUG:notification] User belum berlangganan notifikasi");
    }
  } catch (error) {
    console.error(
      "[DEBUG:notification] Error checking subscription status:",
      error
    );
    notificationToggleBtn.style.display = "none"; // Sembunyikan jika ada error
  }
  notificationToggleBtn.style.display = "block"; // Tampilkan tombol setelah status diperbarui
}

// [DEBUG:notification] Toggle langganan notifikasi push (aktifkan/nonaktifkan)
export async function toggleNotificationSubscription() {
  const notificationToggleBtn = document.getElementById(
    "notification-toggle-btn"
  );
  if (!notificationToggleBtn) return;

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Browser Anda tidak mendukung Push Notification.");
    return;
  }

  const token = getAuthToken();
  if (!token) {
    alert("Anda harus login untuk mengelola notifikasi.");
    return;
  }

  notificationToggleBtn.disabled = true; // Nonaktifkan tombol sementara proses berjalan

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Jika sudah berlangganan, batalkan langganan
      await subscription.unsubscribe();
      console.debug(
        "[DEBUG:notification] User unsubscribed from push service."
      );
      // Kirim informasi berhenti langganan ke backend
      await unsubscribeNotification(token, subscription.endpoint);
      alert("Notifikasi berhasil dinonaktifkan.");
    } else {
      // Jika belum berlangganan, minta izin dan berlangganan
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const applicationServerKey = urlB64ToUint8Array(
          CONFIG.VAPID_PUBLIC_KEY
        );
        const options = { applicationServerKey, userVisibleOnly: true }; // userVisibleOnly harus true
        const newSubscription = await registration.pushManager.subscribe(
          options
        );
        console.debug(
          "[DEBUG:notification] User subscribed to push service:",
          newSubscription
        );
        // Kirim detail langganan ke backend
        await subscribeNotification(token, newSubscription.toJSON());
        alert("Notifikasi berhasil diaktifkan.");
      } else {
        alert(
          "Izin notifikasi tidak diberikan. Anda tidak akan menerima notifikasi."
        );
        console.warn(
          "[DEBUG:notification] Notification permission not granted."
        );
      }
    }
  } catch (error) {
    console.error(
      "[DEBUG:notification] Failed to toggle push subscription:",
      error
    );
    alert(`Gagal mengelola notifikasi: ${error.message}`);
  } finally {
    notificationToggleBtn.disabled = false; // Aktifkan kembali tombol
    await checkNotificationSubscriptionStatus(); // Perbarui UI tombol
  }
}

// [DEBUG:notification] Subscribe user ke push notification secara otomatis
export async function subscribeUserToPush(registration) {
  if (!("PushManager" in window)) {
    console.warn(
      "[DEBUG:notification] Push notifications are not supported in this browser."
    );
    return;
  }
  const token = getAuthToken(); // Dapatkan token autentikasi pengguna
  if (!token) {
    console.debug(
      "[DEBUG:notification] No auth token found, skipping auto-subscribe."
    );
    return; // Lewati jika tidak ada token (user belum login)
  }

  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      // Hanya subscribe jika belum ada langganan aktif
      const applicationServerKey = urlB64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
      const options = { applicationServerKey, userVisibleOnly: true };
      const newSubscription = await registration.pushManager.subscribe(options);
      console.debug(
        "[DEBUG:notification] User subscribed automatically:",
        newSubscription
      );
      await subscribeNotification(token, newSubscription.toJSON());
    } else {
      console.debug(
        "[DEBUG:notification] User already subscribed, skipping auto-subscribe."
      );
    }
  } catch (error) {
    // Tangani error jika auto-subscribe gagal (misal: izin ditolak sebelumnya)
    console.error(
      "[DEBUG:notification] Failed to subscribe automatically:",
      error
    );
  }
  await checkNotificationSubscriptionStatus(); // Selalu perbarui UI setelah upaya subscribe
}
