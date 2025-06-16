// src/pages/auth/LoginPage.js
import LoginPagePresenter from "../../presenter/login-page-presenter.js"; //

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPagePresenter(); //
    console.log("LoginPage: Constructor called."); // Tambahan log
  }

  async render() {
    console.log("LoginPage: render() called."); // Tambahan log
    return await this.presenter.render();
  }

  async afterRender() {
    console.log("LoginPage: afterRender() called."); // Tambahan log
    await this.presenter.afterRender(); //
  }
}
