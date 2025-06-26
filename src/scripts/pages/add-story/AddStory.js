// src/scripts/pages/add-story/AddStory.js
import AddStoryPresenter from "../../presenter/add-story-presenter.js";

export default class AddStory {
  constructor() {
    this.presenter = new AddStoryPresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
