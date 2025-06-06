
import LoginPageModel from "../model/login-page-model.js";
import LoginPageView from "../view/login-page-view.js";

class LoginPagePresenter {
  constructor() {
    this.model = new LoginPageModel();
    this.view = new LoginPageView();
  }

  async render() {
    return this.view.render();
  }

  async afterRender() {
    if (window.feather) feather.replace();
    this.view.getElements(); 

    this.view.bindTogglePassword(() => {
      this.view.togglePasswordVisibility();
    });

    this.view.bindLoginFormSubmit(this._onLoginFormSubmit.bind(this));
  }

  async _onLoginFormSubmit(event) {
    event.preventDefault();
    this.view.clearErrors(); 

    const email = this.view.getEmail();
    const password = this.view.getPassword();

    // Validasi input
    if (!email) {
      this.view.showEmailError("Email harus diisi");
      return;
    }

    if (!password) {
      this.view.showPasswordError("Password harus diisi");
      return;
    }

    try {
      this.view.setSubmitButtonLoading(true); 
      await this.model.login(email, password); 

      const returnTo = sessionStorage.getItem("returnTo") || "#/";
      sessionStorage.removeItem("returnTo");
      window.location.hash = returnTo;
      window.location.reload();
    } catch (error) {
      console.error("Login Presenter error:", error);
      this.view.showPasswordError(error.message); 
    } finally {
      this.view.setSubmitButtonLoading(false);
    }
  }
}

export default LoginPagePresenter;
