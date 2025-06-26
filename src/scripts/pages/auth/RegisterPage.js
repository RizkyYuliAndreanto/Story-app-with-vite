
import RegisterPagePresenter from "../../presenter/register-page-presenter.js";

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPagePresenter();
  }

  async render() {
    return await this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
