// src/scripts/utils/notification-helper-new.js
import CONFIG from "../config.js";
import { getAuthToken } from "./auth.js";
import { subscribeNotification, unsubscribeNotification } from "../data/api.js";

// Helper untuk konversi VAPID key base64 ke Uint8Array
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

class NotificationHelper {
  constructor() {
    console.log("NotificationHelper: Initialized.");
  }

  // Memeriksa apakah browser mendukung Push Notification
  isPushNotificationSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  // Menginisialisasi Service Worker jika belum terdaftar
  async init() {
    if (!this.isPushNotificationSupported()) {
      console.warn(
        "NotificationHelper: Push notifications not supported by this browser."
      );
      return false;
    }

    try {
      // Tunggu Service Worker terdaftar (ini akan dilakukan oleh VitePWA)
      const registration = await navigator.serviceWorker.ready;
      console.log("NotificationHelper: Service Worker ready.");

      // Cek dan update status tombol notifikasi
      await this.checkNotificationSubscriptionStatus();

      // Coba auto-subscribe jika pengguna sudah login dan belum subscribe
      await this.subscribeUserToPush(registration);

      return true;
    } catch (error) {
      console.error(
        "NotificationHelper: Failed to initialize push notifications:",
        error
      );
      return false;
    }
  }

  // Memeriksa status langganan notifikasi & update UI tombol
  async checkNotificationSubscriptionStatus() {
    const notificationToggleBtn = document.getElementById(
      "notification-toggle-btn"
    );
    const notificationBtnText = document.getElementById(
      "notification-btn-text"
    );
    if (!notificationToggleBtn || !notificationBtnText) return;

    if (!this.isPushNotificationSupported()) {
      notificationToggleBtn.style.display = "none";
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        notificationToggleBtn.classList.add("subscribed");
        notificationBtnText.textContent = "Nonaktifkan Notifikasi";
        notificationToggleBtn.querySelector("i").className =
          "fas fa-bell-slash";
        console.debug(
          "NotificationHelper: User sudah berlangganan notifikasi."
        );
      } else {
        notificationToggleBtn.classList.remove("subscribed");
        notificationBtnText.textContent = "Aktifkan Notifikasi";
        notificationToggleBtn.querySelector("i").className = "fas fa-bell";
        console.debug(
          "NotificationHelper: User belum berlangganan notifikasi."
        );
      }
    } catch (error) {
      console.error(
        "NotificationHelper: Error checking subscription status:",
        error
      );
      notificationToggleBtn.style.display = "none";
    }
    notificationToggleBtn.style.display = "block";
  }

  // Toggle langganan notifikasi push (aktifkan/nonaktifkan)
  async toggleNotificationSubscription() {
    const notificationToggleBtn = document.getElementById(
      "notification-toggle-btn"
    );
    if (!notificationToggleBtn) return;

    if (!this.isPushNotificationSupported()) {
      alert("Browser Anda tidak mendukung Push Notification.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("Anda harus login untuk mengelola notifikasi.");
      return;
    }

    notificationToggleBtn.disabled = true;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Jika sudah berlangganan, batalkan langganan
        const response = await unsubscribeNotification(subscription.endpoint);
        if (response.error) {
          throw new Error(
            response.message || "Gagal berhenti berlangganan di server."
          );
        }
        await subscription.unsubscribe();
        console.debug(
          "NotificationHelper: User unsubscribed from push service."
        );
        alert("Notifikasi berhasil dinonaktifkan.");
      } else {
        // Jika belum berlangganan, minta izin dan berlangganan
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const applicationServerKey = urlB64ToUint8Array(
            CONFIG.VAPID_PUBLIC_KEY
          );
          const options = { applicationServerKey, userVisibleOnly: true };
          const newSubscription = await registration.pushManager.subscribe(
            options
          );
          console.debug(
            "NotificationHelper: User subscribed to push service:",
            newSubscription
          );

          const response = await subscribeNotification(
            newSubscription.toJSON()
          );
          if (response.error) {
            await newSubscription.unsubscribe(); // Batalkan jika gagal di server
            throw new Error(
              response.message || "Gagal berlangganan di server."
            );
          }
          alert("Notifikasi berhasil diaktifkan.");
        } else {
          alert(
            "Izin notifikasi tidak diberikan. Anda tidak akan menerima notifikasi."
          );
          console.warn(
            "NotificationHelper: Notification permission not granted."
          );
        }
      }
    } catch (error) {
      console.error(
        "NotificationHelper: Failed to toggle push subscription:",
        error
      );
      alert(`Gagal mengelola notifikasi: ${error.message}`);
    } finally {
      notificationToggleBtn.disabled = false;
      await this.checkNotificationSubscriptionStatus(); // Perbarui UI tombol
    }
  }

  // Subscribe user ke push notification secara otomatis
  async subscribeUserToPush(registration) {
    if (!this.isPushNotificationSupported()) return;

    const token = getAuthToken();
    if (!token) {
      console.debug(
        "NotificationHelper: No auth token found, skipping auto-subscribe."
      );
      return;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const applicationServerKey = urlB64ToUint8Array(
          CONFIG.VAPID_PUBLIC_KEY
        );
        const options = { applicationServerKey, userVisibleOnly: true };
        const newSubscription = await registration.pushManager.subscribe(
          options
        );
        console.debug(
          "NotificationHelper: User subscribed automatically:",
          newSubscription
        );

        const response = await subscribeNotification(newSubscription.toJSON());
        if (response.error) {
          await newSubscription.unsubscribe();
          throw new Error(
            response.message || "Auto-subscribe failed on server."
          );
        }
      } else {
        console.debug(
          "NotificationHelper: User already subscribed, skipping auto-subscribe."
        );
      }
    } catch (error) {
      console.error(
        "NotificationHelper: Failed to subscribe automatically:",
        error
      );
    }
    await this.checkNotificationSubscriptionStatus();
  }
}

export default NotificationHelper;
