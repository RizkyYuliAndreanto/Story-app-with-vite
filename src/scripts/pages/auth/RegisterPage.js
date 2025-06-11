
import RegisterPagePresenter from "../../presenter/register-page-presenter.js";

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPagePresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
