// src/scripts/utils/story-bookmark-db.js
const BOOKMARK_DB_NAME = "story-bookmark-db";
const BOOKMARK_DB_VERSION = 1;
const BOOKMARK_OBJECT_STORE_NAME = "bookmarked_stories";

let bookmarkDb;

// [DEBUG:bookmark-db] Open bookmark database connection
const openBookmarkDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BOOKMARK_DB_NAME, BOOKMARK_DB_VERSION);

    request.onerror = (event) => {
      console.error(
        "[DEBUG:bookmark-db] IndexedDB error:",
        event.target.errorCode
      );
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
        console.debug(
          "[DEBUG:bookmark-db] Object store created:",
          BOOKMARK_OBJECT_STORE_NAME
        );
      }
    };
  });
};

// [DEBUG:bookmark-db] Add or update bookmark
export const addBookmarkToDb = async (story) => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(story);
    request.onsuccess = () => {
      console.debug("[DEBUG:bookmark-db] Story bookmarked:", story.id);
      resolve(story);
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:bookmark-db] Failed to bookmark story:",
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:bookmark-db] Get all bookmarks
export const getAllBookmarksFromDb = async () => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      console.debug(
        "[DEBUG:bookmark-db] Retrieved all bookmarks:",
        request.result.length
      );
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:bookmark-db] Failed to get all bookmarks:",
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:bookmark-db] Get bookmark by ID
export const getBookmarkByIdFromDb = async (id) => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readonly");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      console.debug(
        "[DEBUG:bookmark-db] Retrieved bookmark by id:",
        id,
        request.result
      );
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:bookmark-db] Failed to get bookmark by id:",
        id,
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:bookmark-db] Remove bookmark by ID
export const removeStoryFromBookmark = async (id) => {
  if (!bookmarkDb) await openBookmarkDatabase();
  const tx = bookmarkDb.transaction(BOOKMARK_OBJECT_STORE_NAME, "readwrite");
  const store = tx.objectStore(BOOKMARK_OBJECT_STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => {
      console.debug("[DEBUG:bookmark-db] Removed bookmark by id:", id);
      resolve();
    };
    request.onerror = (event) => {
      console.error(
        "[DEBUG:bookmark-db] Failed to remove bookmark by id:",
        id,
        event.target.error
      );
      reject(event.target.error);
    };
  });
};

// [DEBUG:bookmark-db] Check if story is bookmarked
export const isStoryBookmarked = async (id) => {
  const story = await getBookmarkByIdFromDb(id);
  console.debug("[DEBUG:bookmark-db] isStoryBookmarked:", id, !!story);
  return !!story; // Mengembalikan true jika story ditemukan (sudah dibookmark)
};
