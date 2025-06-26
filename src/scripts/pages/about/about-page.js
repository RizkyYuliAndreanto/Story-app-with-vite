// src/scripts/pages/about/about-page.js
import AboutPagePresenter from "../../presenter/about-page-presenter.js";

export default class AboutPage {
  constructor() {
    this.presenter = new AboutPagePresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
