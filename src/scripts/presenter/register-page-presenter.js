
import RegisterPageModel from "../model/register-page-model.js";
import RegisterPageView from "../view/register-page-view.js";

class RegisterPagePresenter {
  constructor() {
    this.model = new RegisterPageModel();
    this.view = new RegisterPageView();
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

    this.view.bindRegisterFormSubmit(this._onRegisterFormSubmit.bind(this));
  }

  async _onRegisterFormSubmit(event) {
    event.preventDefault();
    this.view.clearErrors(); 

    const name = this.view.getName();
    const email = this.view.getEmail();
    const password = this.view.getPassword();

    // Validasi input
    if (!name) {
      this.view.showNameError("Nama harus diisi");
      return;
    }
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
      await this.model.register({ name, email, password }); 

      alert("Registrasi berhasil! Silakan login");
      window.location.hash = "#/login"; 
    } catch (error) {
      console.error("Register Presenter error:", error);
      alert(error.message);
    } finally {
      this.view.setSubmitButtonLoading(false);
    }
  }
}

export default RegisterPagePresenter;
