import HomePagePresenter from "../../presenter/home-page-presenter";

export default class HomePage {
  constructor() {
    this.presenter = new HomePagePresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
