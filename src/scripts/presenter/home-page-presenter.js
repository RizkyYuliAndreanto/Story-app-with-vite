// src/scripts/presenter/home-page-presenter.js
import { redirectIfNotAuthenticated, getAuthToken } from "../utils/auth.js";
import HomePageModel from "../model/home-page-model.js";
import HomePageView from "../view/home-page-view.js";
import {
  addBookmarkToDb,
  removeStoryFromBookmark,
  isStoryBookmarked,
} from "../utils/story-bookmark-db"; // Import utilitas bookmark

class HomePagePresenter {
  constructor() {
    this.model = new HomePageModel();
    this.view = new HomePageView();
    this.boundBookmarkHandler = this._onBookmarkClick.bind(this); // Untuk menghapus listener
    this.isBookmarkHandlerAttached = false; // Flag untuk mencegah attachment ganda
  }

  async render() {
    return this.view.render();
  }

  async afterRender() {
    try {
      this.view.showLoading();

      const token = getAuthToken();

      const stories = await this.model.getStories(token);

      this.view.renderStories(stories);
      this.view.initMap();
      this.view.renderStoryLocations(stories);

      // --- TAMBAHAN: Inisialisasi event listener bookmark ---
      this._initializeBookmarkHandlers(stories);
      // --- AKHIR TAMBAHAN ---
    } catch (error) {
      console.error("Error in HomePagePresenter afterRender:", error);
      if (
        error.message.includes("login terlebih dahulu") ||
        error.message.includes("data offline")
      ) {
        this.view.showError(
          "Anda perlu login terlebih dahulu untuk melihat cerita. Jika offline, pastikan Anda sudah login sebelumnya."
        );
        if (!getAuthToken()) {
          redirectIfNotAuthenticated();
        }
      } else {
        this.view.showError(error.message);
      }
    } finally {
      if (window.feather) feather.replace();
    }
  }

  // --- TAMBAHAN FUNGSI UNTUK BOOKMARK ---
  _initializeBookmarkHandlers(stories) {
    if (this.isBookmarkHandlerAttached) {
      // Pastikan hanya satu kali terpasang per render
      this._removeBookmarkHandlers(); // Hapus yang lama jika ada
    }

    stories.forEach((story) => {
      const bookmarkButton = document.getElementById(
        `bookmark-btn-${story.id}`
      );
      if (bookmarkButton) {
        bookmarkButton.addEventListener("click", this.boundBookmarkHandler);
        // Atur status awal tombol berdasarkan isBookmarked dari model
        this.view.updateBookmarkButton(story.id, story.isBookmarked);
      }
    });
    this.isBookmarkHandlerAttached = true;
  }

  async _onBookmarkClick(event) {
    const storyId = event.currentTarget.dataset.storyId;
    const isBookmarked = await isStoryBookmarked(storyId); // Cek status saat ini

    try {
      if (isBookmarked) {
        await removeStoryFromBookmark(storyId);
        alert("Cerita dihapus dari tersimpan!");
      } else {
        // Untuk menambahkan bookmark, kita butuh seluruh objek cerita.
        // Ambil cerita dari list yang sudah dimuat di view/model
        const stories = await this.model.getStories(getAuthToken()); // Ambil cerita terbaru lagi
        const storyToAdd = stories.find((s) => s.id === storyId);
        if (storyToAdd) {
          await addBookmarkToDb(storyToAdd);
          alert("Cerita ditambahkan ke tersimpan!");
        } else {
          throw new Error("Cerita tidak ditemukan untuk dibookmark.");
        }
      }
      // Perbarui tampilan tombol setelah aksi berhasil
      this.view.updateBookmarkButton(storyId, !isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Gagal mengelola bookmark: " + error.message);
    }
    if (window.feather) feather.replace();
  }

  _removeBookmarkHandlers() {
    // Hapus event listener dari tombol-tombol yang mungkin sudah ada
    document.querySelectorAll(".bookmark-btn").forEach((button) => {
      button.removeEventListener("click", this.boundBookmarkHandler);
    });
    this.isBookmarkHandlerAttached = false;
  }

  // Metode cleanup untuk Presenter ini (dipanggil oleh App.js saat berganti halaman)
  cleanup() {
    this._removeBookmarkHandlers();
    console.log("Cleanup HomePagePresenter: Bookmark handlers removed.");
  }
  // --- AKHIR TAMBAHAN FUNGSI UNTUK BOOKMARK ---
}

export default HomePagePresenter;
