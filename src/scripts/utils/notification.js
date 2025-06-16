// src/scripts/utils/notification.js
import CONFIG from "../config.js";
import { getAuthToken } from "./auth.js";
import { subscribeNotification, unsubscribeNotification } from "../data/api.js";

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

export async function checkNotificationSubscriptionStatus() {
  const notificationToggleBtn = document.getElementById(
    "notification-toggle-btn"
  );
  const notificationBtnText = document.getElementById("notification-btn-text");
  if (!notificationToggleBtn || !notificationBtnText) return;

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    notificationToggleBtn.style.display = "none";
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    notificationToggleBtn.classList.add("subscribed");
    notificationBtnText.textContent = "Nonaktifkan Notifikasi";
    notificationToggleBtn.querySelector("i").className = "fas fa-bell-slash";
  } else {
    notificationToggleBtn.classList.remove("subscribed");
    notificationBtnText.textContent = "Aktifkan Notifikasi";
    notificationToggleBtn.querySelector("i").className = "fas fa-bell";
  }
  notificationToggleBtn.style.display = "block";
}

export async function toggleNotificationSubscription() {
  const notificationToggleBtn = document.getElementById(
    "notification-toggle-btn"
  );
  const notificationBtnText = document.getElementById("notification-btn-text");
  if (!notificationToggleBtn || !notificationBtnText) return;

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
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
      await subscription.unsubscribe();
      console.log("User unsubscribed from push service.");
      await unsubscribeNotification(token, subscription.endpoint);
      alert("Notifikasi berhasil dinonaktifkan.");
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const applicationServerKey = urlB64ToUint8Array(
          CONFIG.VAPID_PUBLIC_KEY
        );
        const options = { applicationServerKey, userVisibleOnly: true };
        const newSubscription = await registration.pushManager.subscribe(
          options
        );
        console.log("User subscribed to push service:", newSubscription);
        await subscribeNotification(token, newSubscription.toJSON());
        alert("Notifikasi berhasil diaktifkan.");
      } else {
        alert(
          "Izin notifikasi tidak diberikan. Anda tidak akan menerima notifikasi."
        );
        console.warn("Notification permission not granted.");
      }
    }
  } catch (error) {
    console.error("Failed to toggle push subscription:", error);
    alert(`Gagal mengelola notifikasi: ${error.message}`);
  } finally {
    notificationToggleBtn.disabled = false;
    await checkNotificationSubscriptionStatus();
  }
}

export async function subscribeUserToPush(registration) {
  if (!("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser.");
    return;
  }
  const token = getAuthToken();
  if (!token) return;

  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const applicationServerKey = urlB64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
      const options = { applicationServerKey, userVisibleOnly: true };
      const newSubscription = await registration.pushManager.subscribe(options);
      console.log("User subscribed automatically:", newSubscription);
      await subscribeNotification(token, newSubscription.toJSON());
    }
  } catch (error) {
    console.error("Failed to subscribe automatically:", error);
  }
  await checkNotificationSubscriptionStatus();
}
