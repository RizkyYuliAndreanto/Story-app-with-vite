// src/scripts/presenter/bookmark-presenter.js
import BookmarkModel from "../model/bookmark-model";
import BookmarkView from "../view/bookmark-view";
// UBAH BARIS INI: Pastikan impor dari story-bookmark-db.js
import {
  isStoryBookmarked,
  addBookmarkToDb,
  removeStoryFromBookmark,
} from "../utils/story-bookmark-db"; //

class BookmarkPresenter {
  constructor() {
    this.model = new BookmarkModel();
    this.view = new BookmarkView();
    this.bookmarkHandlersInitialized = false;
  }

  async render() {
    return this.view.render();
  }

  async afterRender() {
    try {
      this.view.showLoading();
      const bookmarkedStories = await this.model.getBookmarkedStories();
      this.view.renderBookmarkedStories(bookmarkedStories);

      this._initializeBookmarkHandlers(bookmarkedStories);
    } catch (error) {
      console.error("Error in BookmarkPresenter afterRender:", error);
      this.view.showError(error.message || "Gagal memuat cerita tersimpan.");
    } finally {
      if (window.feather) feather.replace();
    }
  }

  _initializeBookmarkHandlers(stories) {
    if (this.bookmarkHandlersInitialized) {
      return;
    }

    stories.forEach((story) => {
      const bookmarkButton = document.getElementById(
        `bookmark-btn-${story.id}`
      );
      if (bookmarkButton) {
        bookmarkButton.addEventListener("click", async (event) => {
          const storyId = event.currentTarget.dataset.storyId;
          const isBookmarked = await isStoryBookmarked(storyId); //

          try {
            if (isBookmarked) {
              await removeStoryFromBookmark(storyId); //
              alert("Cerita dihapus dari tersimpan!");
            } else {
              await addBookmarkToDb(story); //
              alert("Cerita ditambahkan ke tersimpan!");
            }
            const updatedBookmarkedStories =
              await this.model.getBookmarkedStories();
            this.view.renderBookmarkedStories(updatedBookmarkedStories);
            this._updateBookmarkButtonState(storyId, !isBookmarked);
          } catch (error) {
            console.error("Error toggling bookmark:", error);
            alert("Gagal mengelola bookmark: " + error.message);
          }
          if (window.feather) feather.replace();
        });
        this._updateBookmarkButtonState(story.id, true);
      }
    });
    this.bookmarkHandlersInitialized = true;
  }

  _updateBookmarkButtonState(storyId, isBookmarked) {
    const bookmarkButton = document.getElementById(`bookmark-btn-${storyId}`);
    if (bookmarkButton) {
      const icon = bookmarkButton.querySelector("i");
      if (isBookmarked) {
        icon.className = "fas fa-bookmark";
        bookmarkButton.classList.add("bookmarked");
      } else {
        icon.className = "far fa-bookmark";
        bookmarkButton.classList.remove("bookmarked");
      }
    }
  }

  cleanup() {
    this.bookmarkHandlersInitialized = false;
    console.log("Cleanup BookmarkPresenter: Event handlers reset.");
  }
}

export default BookmarkPresenter;
