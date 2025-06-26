// src/scripts/utils/indexeddb.js
const DB_NAME = "story-app-db";
const DB_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

let db;

// [DEBUG:indexeddb] Open database connection
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error(
        "[DEBUG:indexeddb] IndexedDB error:",
        event.target.errorCode
      );
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
        console.debug(
          "[DEBUG:indexeddb] Object store created:",
          OBJECT_STORE_NAME
        );
      }
    };
  });
};

// [DEBUG:indexeddb] Add or update story in IndexedDB
export const addStoryToDb = async (story) => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(story);
    request.onsuccess = () => {
      console.debug("[DEBUG:indexeddb] Story added/updated:", story.id);
      resolve(story);
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:indexeddb] Failed to add/update story:",
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:indexeddb] Get all stories from IndexedDB
export const getAllStoriesFromDb = async () => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      console.debug(
        "[DEBUG:indexeddb] Retrieved all stories:",
        request.result.length
      );
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:indexeddb] Failed to get all stories:",
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:indexeddb] Get story by ID from IndexedDB
export const getStoryByIdFromDb = async (id) => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      console.debug(
        "[DEBUG:indexeddb] Retrieved story by id:",
        id,
        request.result
      );
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:indexeddb] Failed to get story by id:",
        id,
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:indexeddb] Delete story by ID from IndexedDB
export const deleteStoryFromDb = async (id) => {
  if (!db) await openDatabase();
  const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => {
      console.debug("[DEBUG:indexeddb] Deleted story by id:", id);
      resolve();
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:indexeddb] Failed to delete story by id:",
        id,
        event.target.error
      );
      reject(event.target.error);
    };
  });
};
