// src/scripts/utils/indexeddb.js
const DB_NAME = "story-app-db";
const DB_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

let db;

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const addStoryToDb = async (story) => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(story);
    request.onsuccess = () => resolve(story);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getAllStoriesFromDb = async () => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getStoryByIdFromDb = async (id) => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteStoryFromDb = async (id) => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};
