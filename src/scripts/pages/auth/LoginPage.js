// src/pages/auth/LoginPage.js
import LoginPagePresenter from "../../presenter/login-page-presenter";

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPagePresenter();
  }

  async render() {
    return this.presenter.render();
  }

  async afterRender() {
    await this.presenter.afterRender();
  }
}
