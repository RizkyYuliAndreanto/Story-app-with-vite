// src/scripts/model/bookmark-model.js
import { getAllBookmarksFromDb } from "../utils/story-bookmark-db";

class BookmarkModel {
  async getBookmarkedStories() {
    try {
      const bookmarkedStories = await getAllBookmarksFromDb();
      return bookmarkedStories;
    } catch (error) {
      console.error("Error fetching bookmarked stories:", error);
      throw error;
    }
  }
}

export default BookmarkModel;
