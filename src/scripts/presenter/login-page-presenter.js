// src/presenter/login-page-presenter.js
import LoginPageModel from "../model/login-page-model.js"; //
import LoginPageView from "../view/login-page-view.js"; //

class LoginPagePresenter {
  constructor() {
    this.model = new LoginPageModel(); //
    this.view = new LoginPageView(); //
    console.log("LoginPagePresenter: Constructor called."); // Tambahan log
  }

  async render() {
    console.log("LoginPagePresenter: render() called."); // Tambahan log
    return this.view.render(); //
  }

  async afterRender() {
    console.log("LoginPagePresenter: afterRender() called."); // Tambahan log
    if (window.feather) feather.replace(); //
    this.view.getElements(); //
    console.log("LoginPagePresenter: getElements called on view."); // Tambahan log

    this.view.bindTogglePassword(() => {
      console.log("LoginPagePresenter: Toggle password handler triggered."); // Tambahan log
      this.view.togglePasswordVisibility(); //
    });

    this.view.bindLoginFormSubmit(this._onLoginFormSubmit.bind(this)); //
    console.log("LoginPagePresenter: Login form submit handler bound."); // Tambahan log
  }

  async _onLoginFormSubmit(event) {
    event.preventDefault(); //
    console.log("LoginPagePresenter: _onLoginFormSubmit triggered."); // Tambahan log
    this.view.clearErrors(); //

    const email = this.view.getEmail(); //
    const password = this.view.getPassword(); //
    console.log(
      `LoginPagePresenter: Attempting login with Email: ${email}, Password length: ${password.length}`
    ); // Tambahan log (jangan log password sebenarnya!)

    // Validasi input
    if (!email) {
      this.view.showEmailError("Email harus diisi"); //
      console.log("LoginPagePresenter: Email is empty."); // Tambahan log
      return;
    }

    if (!password) {
      this.view.showPasswordError("Password harus diisi"); //
      console.log("LoginPagePresenter: Password is empty."); // Tambahan log
      return;
    }

    try {
      this.view.setSubmitButtonLoading(true); //
      console.log("LoginPagePresenter: Submit button set to loading."); // Tambahan log
      await this.model.login(email, password); //
      console.log("LoginPagePresenter: Login successful."); // Tambahan log

      const returnTo = sessionStorage.getItem("returnTo") || "#/"; //
      sessionStorage.removeItem("returnTo"); //
      window.location.hash = returnTo; //
      window.location.reload(); //
      console.log(
        `LoginPagePresenter: Redirecting to ${returnTo} and reloading.`
      ); // Tambahan log
    } catch (error) {
      console.error("Login Presenter error:", error); //
      this.view.showPasswordError(error.message); //
      console.log(
        `LoginPagePresenter: Login failed with error: ${error.message}`
      ); // Tambahan log
    } finally {
      this.view.setSubmitButtonLoading(false); //
      console.log("LoginPagePresenter: Submit button loading state reset."); // Tambahan log
    }
  }
}

export default LoginPagePresenter;
