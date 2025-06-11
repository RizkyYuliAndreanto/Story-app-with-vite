// src/scripts/view/register-page-view.js
class RegisterPageView {
  constructor() {
    this.registerForm = null;
    this.togglePasswordButton = null;
    this.passwordInput = null;
    this.nameInput = null;
    this.emailInput = null;
    this.submitBtn = null;
  }

  render() {
    return `
        <div class="auth-container">
          <div class="auth-header">
            <i data-feather="user-plus"></i>
            <h1>Daftar Akun Baru</h1>
          </div>
          
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name"><i data-feather="user"></i> Nama Lengkap</label>
              <div class="input-with-icon">
                <input type="text" id="name" name="name" placeholder="Masukkan nama lengkap" required>
              </div>
              <p id="name-error" class="error-message"></p>
            </div>
            
            <div class="form-group">
              <label for="email"><i data-feather="mail"></i> Email</label>
              <div class="input-with-icon">
                <input type="email" id="email" name="email" placeholder="contoh@email.com" required>
              </div>
              <p id="email-error" class="error-message"></p>
            </div>
            
            <div class="form-group">
              <label for="password"><i data-feather="lock"></i> Password</label>
              <div class="input-with-icon">
                <input type="password" id="password" name="password" minlength="6" placeholder="Minimal 6 karakter" required>
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i data-feather="eye"></i>
                </button>
              </div>
              <p id="password-error" class="error-message"></p>
            </div>
          
            <button type="submit" class="submit-btn">
              <i data-feather="user-plus"></i> Daftar Sekarang
            </button>
            
            <p class="auth-link">
              Sudah punya akun? <a href="#/login"><i data-feather="log-in"></i> Masuk disini</a>
            </p>
          </form>
        </div>
      `;
  }


  getElements() {
    this.registerForm = document.getElementById("register-form");
    this.togglePasswordButton = document.querySelector(".toggle-password");
    this.passwordInput = document.getElementById("password");
    this.nameInput = document.getElementById("name");
    this.emailInput = document.getElementById("email");
    this.submitBtn = this.registerForm?.querySelector('button[type="submit"]');
  }


  bindTogglePassword(handler) {
    this.togglePasswordButton?.addEventListener("click", handler);
  }

  bindRegisterFormSubmit(handler) {
    this.registerForm?.addEventListener("submit", handler);
  }

  
  getName() {
    return this.nameInput?.value.trim();
  }

  getEmail() {
    return this.emailInput?.value.trim();
  }

  getPassword() {
    return this.passwordInput?.value.trim();
  }

 
  togglePasswordVisibility() {
    const type =
      this.passwordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    this.passwordInput.setAttribute("type", type);
    this.togglePasswordButton.innerHTML =
      type === "password"
        ? '<i data-feather="eye"></i>'
        : '<i data-feather="eye-off"></i>';
    if (window.feather) feather.replace();
  }

  showNameError(message) {
    const nameError = document.getElementById("name-error");
    if (nameError) {
      nameError.textContent = message;
    }
  }

  showEmailError(message) {
    const emailError = document.getElementById("email-error");
    if (emailError) {
      emailError.textContent = message;
    }
  }

  showPasswordError(message) {
    const passwordError = document.getElementById("password-error");
    if (passwordError) {
      passwordError.textContent = message;
    }
  }

  clearErrors() {
    this.showNameError("");
    this.showEmailError("");
    this.showPasswordError("");
  }


  setSubmitButtonLoading(isLoading) {
    if (!this.submitBtn) return;

    this.submitBtn.disabled = isLoading;
    this.submitBtn.innerHTML = isLoading
      ? '<i data-feather="loader" class="spinning"></i> Memproses...'
      : '<i data-feather="user-plus"></i> Daftar Sekarang';
    if (window.feather) feather.replace();
  }
}

export default RegisterPageView;
