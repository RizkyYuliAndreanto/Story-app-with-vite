// src/scripts/utils/story-bookmark-db.js
const BOOKMARK_DB_NAME = "story-bookmark-db";
const BOOKMARK_DB_VERSION = 1;
const BOOKMARK_OBJECT_STORE_NAME = "bookmarked_stories";

let bookmarkDb;

const openBookmarkDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BOOKMARK_DB_NAME, BOOKMARK_DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB Bookmark error:", event.target.errorCode);
      reject(event.target.errorCode);
    };

    request.onsuccess = (event) => {
      bookmarkDb = event.target.result;
      resolve(bookmarkDb);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BOOKMARK_OBJECT_STORE_NAME)) {
        db.createObjectStore(BOOKMARK_OBJECT_STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const addBookmarkToDb = async (story) => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(story); // 'put' akan menambahkan atau memperbarui
    request.onsuccess = () => resolve(story);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getAllBookmarksFromDb = async () => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getBookmarkByIdFromDb = async (id) => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const removeStoryFromBookmark = async (id) => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const isStoryBookmarked = async (id) => {
  const story = await getBookmarkByIdFromDb(id);
  return !!story; // Mengembalikan true jika story ditemukan (sudah dibookmark)
};
