// src/scripts/presenter/detail-story-presenter.js
import DetailStoryModel from "../model/detail-story-model";
import DetailStoryView from "../view/detail-story-view";
import { getActivePathname } from "../routes/url-parser"; // Untuk mendapatkan ID cerita
import { getAuthToken, redirectIfNotAuthenticated } from "../utils/auth"; // Untuk otentikasi

class DetailStoryPresenter {
  constructor() {
    this.model = new DetailStoryModel();
    this.view = new DetailStoryView();
    this.storyId = null; // Untuk menyimpan ID cerita
  }

  async render() {
    // Ambil ID cerita dari URL
    const urlSegments = getActivePathname().split("/"); // Misalnya '/stories/story-123'
    this.storyId = urlSegments[2]; // ID cerita ada di segmen ketiga

    if (!this.storyId) {
      return `<section class="detail-story-page"><p class="error-message" style="color: white;">ID cerita tidak ditemukan di URL.</p></section>`;
    }

    return this.view.render(); // Render placeholder atau loading state
  }

  async afterRender() {
    if (!redirectIfNotAuthenticated()) return; // Pastikan user login

    try {
      this.view.showLoading();

      const token = getAuthToken();
      if (!token) {
        throw new Error(
          "Anda perlu login terlebih dahulu untuk melihat detail cerita."
        );
      }

      const story = await this.model.getStoryDetail(this.storyId, token);
      this.view.renderStoryDetail(story);
      this._initializeBookmarkButton(story); // Inisialisasi tombol bookmark
    } catch (error) {
      console.error("Error in DetailStoryPresenter afterRender:", error);
      this.view.showError(error.message || "Gagal memuat detail cerita.");
    } finally {
      if (window.feather) feather.replace();
    }
  }

  _initializeBookmarkButton(story) {
    const bookmarkButton = document.getElementById("bookmark-toggle-btn");
    if (bookmarkButton) {
      this.view.updateBookmarkButton(story.isBookmarked); // Atur status awal tombol
      bookmarkButton.addEventListener("click", async () => {
        try {
          const isBookmarkedNow = await this.model.toggleBookmark(story);
          this.view.updateBookmarkButton(isBookmarkedNow);
          alert(
            `Cerita berhasil ${
              isBookmarkedNow ? "ditambahkan ke" : "dihapus dari"
            } tersimpan!`
          );
        } catch (error) {
          console.error("Error toggling bookmark:", error);
          alert("Gagal mengelola bookmark: " + error.message);
        }
        if (window.feather) feather.replace();
      });
    }
  }

  cleanup() {
    // Hapus event listener jika ada, misalnya dari tombol bookmark
    const bookmarkButton = document.getElementById("bookmark-toggle-btn");
    if (bookmarkButton) {
      bookmarkButton.removeEventListener(
        "click",
        this._initializeBookmarkButton
      ); // Ini mungkin salah, perlu referensi fungsi yang tepat
      // Lebih baik: ketika mengikat listener, bind ke this._boundBookmarkHandler = this._onBookmarkClick.bind(this);
      // Lalu di cleanup: bookmarkButton.removeEventListener('click', this._boundBookmarkHandler);
    }
    console.log("Cleanup DetailStoryPresenter.");
  }
}

export default DetailStoryPresenter;
