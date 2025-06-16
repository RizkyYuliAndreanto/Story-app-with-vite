// src/scripts/model/detail-story-model.js
// --- PASTIKAN IMPOR INI BENAR ---
import { getStoryById } from "../data/api"; // <-- Ini harus diimpor sebagai named export
// --- AKHIR IMPOR ---
import { getStoryByIdFromDb } from "../utils/indexeddb";
import {
  addBookmarkToDb,
  removeStoryFromBookmark,
  isStoryBookmarked,
} from "../utils/story-bookmark-db";

class DetailStoryModel {
  async getStoryDetail(id, token) {
    let story = null;

    try {
      story = await getStoryByIdFromDb(id);
      if (story) {
        console.log(`Story ID ${id} loaded from IndexedDB cache.`);
      }
    } catch (dbError) {
      console.warn(
        `Failed to load story ID ${id} from IndexedDB cache:`,
        dbError
      );
    }

    if ((!story && navigator.onLine) || (navigator.onLine && token)) {
      try {
        const apiStory = await getStoryById(id, token); // <-- Fungsi ini dipanggil
        if (apiStory) {
          story = apiStory;
          console.log(`Story ID ${id} loaded from API.`);
        }
      } catch (apiError) {
        console.warn(`Failed to load story ID ${id} from API:`, apiError);
        if (!story) {
          throw new Error(
            `Gagal memuat detail cerita ID ${id}. Periksa koneksi internet atau pastikan cerita sudah dimuat sebelumnya.`
          );
        }
      }
    } else if (!story) {
      throw new Error(`Anda offline dan cerita ID ${id} tidak ada di cache.`);
    }

    if (!story) {
      throw new Error(`Cerita dengan ID ${id} tidak ditemukan.`);
    }

    story.isBookmarked = await isStoryBookmarked(story.id);

    return story;
  }

  async toggleBookmark(story) {
    const isBookmarked = await isStoryBookmarked(story.id);
    if (isBookmarked) {
      await removeStoryFromBookmark(story.id);
      return false;
    } else {
      await addBookmarkToDb(story);
      return true;
    }
  }
}

export default DetailStoryModel;
