import { allStories } from "../data/api";
import { addStoryToDb, getAllStoriesFromDb } from "../utils/indexeddb";
import { isStoryBookmarked } from "../utils/story-bookmark-db"; // Import

class HomePageModel {
  async getStories(token) {
    try {
      let stories = [];

      const cachedStories = await getAllStoriesFromDb();
      if (cachedStories && cachedStories.length > 0) {
        stories = cachedStories;
        console.log("Stories loaded from IndexedDB (offline-first).");
      }

      if (navigator.onLine && token) {
        try {
          const apiResponse = await allStories(token);
          if (
            apiResponse &&
            apiResponse.listStory &&
            Array.isArray(apiResponse.listStory)
          ) {
            stories = apiResponse.listStory;
            console.log("Stories loaded from API and IndexedDB updated.");
          } else {
            throw new Error(
              "Format data API tidak valid: " + JSON.stringify(apiResponse)
            );
          }
        } catch (apiError) {
          console.warn(
            "Failed to fetch stories from API, falling back to cached data:",
            apiError
          );
          if (stories.length === 0) {
            throw new Error(
              "Tidak dapat memuat cerita. Periksa koneksi internet Anda atau pastikan Anda sudah login."
            );
          }
        }
      } else if (!token && stories.length === 0) {
        throw new Error(
          "Anda perlu login terlebih dahulu atau tidak ada data offline."
        );
      }

      if (!stories || !Array.isArray(stories)) {
        throw new Error("Format data cerita tidak valid.");
      }

      // --- TAMBAHAN: Periksa status bookmark untuk setiap cerita ---
      const storiesWithBookmarkStatus = await Promise.all(
        stories.map(async (story) => {
          const bookmarked = await isStoryBookmarked(story.id);
          return { ...story, isBookmarked: bookmarked };
        })
      );
      return storiesWithBookmarkStatus;
      // --- AKHIR TAMBAHAN ---
    } catch (error) {
      console.error("Error fetching stories in HomePageModel:", error);
      throw error;
    }
  }
}

export default HomePageModel;
