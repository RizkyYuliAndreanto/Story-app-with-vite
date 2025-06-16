// src/scripts/pages/detail-story/detail-story-page.js
import DetailStoryPresenter from "../../presenter/detail-story-presenter";

export default class DetailStoryPage {
  constructor() {
    this.presenter = new DetailStoryPresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }

  cleanup() {
    if (this.presenter && typeof this.presenter.cleanup === "function") {
      this.presenter.cleanup();
    }
  }
}
