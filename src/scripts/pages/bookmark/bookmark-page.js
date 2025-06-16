// src/scripts/pages/bookmark/bookmark-page.js
import BookmarkPresenter from "../../presenter/bookmark-presenter";

export default class BookmarkPage {
  constructor() {
    this.presenter = new BookmarkPresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }

  // Metode cleanup untuk Presenter jika diperlukan (misalnya untuk event listener global)
  cleanup() {
    if (this.presenter && typeof this.presenter.cleanup === "function") {
      this.presenter.cleanup();
    }
  }
}
