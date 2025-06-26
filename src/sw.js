// src/sw.js

import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);
// --- LOGIKA NOTIFIKASI PUSH ---
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Menerima event push...");

  let data;
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error(
      "[Service Worker] Gagal mengurai data push sebagai JSON:",
      error
    );
    data = {
      title: "Pesan Baru (Format Salah)",
      options: {
        body: "Ada pesan, tetapi formatnya tidak dikenali.",
        icon: "/images/icon-icon-x192.png", 
        badge: "/images/maskable-icon-x48.png", 
      },
    };
  }

  const title = data.title || "Notifikasi Baru!";
  const options = {
    body: data.options ? data.options.body : "Anda memiliki pesan baru.",
    icon:
      data.options && data.options.icon
        ? data.options.icon
        : "/images/icon-icon-x192.png", 
    badge:
      data.options && data.options.badge
        ? data.options.badge
        : "/images/maskable-icon-x48.png", 
    image: data.options ? data.options.image : undefined,
    data: data.options ? data.options.data : {},
    actions: data.options ? data.options.actions : [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notifikasi diklik:", event.notification.tag);
  event.notification.close();

  const clickedNotificationTag = event.notification.tag; 
  const clickedAction = event.action; 

  let targetUrl = "/Story-app-with-vite/"; 

  
  if (
    clickedNotificationTag === "welcome-notification" &&
    clickedAction === "add_story_action"
  ) {
    targetUrl = "/Story-app-with-vite/#/addstory"; 
  } else {
   
    targetUrl =
      event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : "/Story-app-with-vite/";
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        
        if (
          client.url.startsWith(
            new URL(targetUrl, self.location.origin).href
          ) &&
          "focus" in client
        ) {
          return client.focus();
        }
      }
     
      return clients.openWindow(targetUrl);
    })
  );
});

