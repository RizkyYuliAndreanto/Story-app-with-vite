// src/pages/auth/login-page-view.js
class LoginPageView {
  constructor() {
    this.loginForm = null;
    this.togglePasswordButton = null;
    this.passwordInput = null;
    this.emailInput = null;
    this.submitBtn = null;
  }

  render() {
    return `
        <div class="auth-container">
          <div class="auth-header">
            <i data-feather="lock"></i>
            <h1>Login</h1>
          </div>
          
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email"><i data-feather="mail"></i> Email</label>
              <div class="input-with-icon">
                <input type="email" id="email" name="email" placeholder="Masukkan email Anda" required>
              </div>
              <p id="email-error" class="error-message"></p>
            </div>
            
            <div class="form-group">
              <label for="password"><i data-feather="key"></i> Password</label>
              <div class="input-with-icon">
                <input type="password" id="password" name="password" minlength="6" placeholder="Masukkan password Anda" required>
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <i data-feather="eye"></i>
                </button>
              </div>
              <p id="password-error" class="error-message"></p>
            </div>
          
            <div class="form-footer">
              <button type="submit" class="submit-btn">
                <i data-feather="log-in"></i> Login
              </button>
              <p class="auth-link">
                <i data-feather="help-circle"></i> Belum punya akun? <a href="#/register">Register</a>
              </p>
            </div>
          </form>
        </div>
      `;
  }

  // Method untuk mendapatkan elemen DOM setelah render
  getElements() {
    this.loginForm = document.getElementById("login-form");
    this.togglePasswordButton = document.querySelector(".toggle-password");
    this.passwordInput = document.getElementById("password");
    this.emailInput = document.getElementById("email");
    this.submitBtn = this.loginForm?.querySelector('button[type="submit"]');
  }

  // Method untuk mendaftarkan event listener
  bindTogglePassword(handler) {
    this.togglePasswordButton?.addEventListener("click", handler);
  }

  bindLoginFormSubmit(handler) {
    this.loginForm?.addEventListener("submit", handler);
  }

  // Method untuk mendapatkan nilai input
  getEmail() {
    return this.emailInput?.value.trim();
  }

  getPassword() {
    return this.passwordInput?.value.trim();
  }

  // Method untuk menampilkan/menyembunyikan password
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

  // Method untuk menampilkan pesan error
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
    this.showEmailError("");
    this.showPasswordError("");
  }

  
  setSubmitButtonLoading(isLoading) {
    if (!this.submitBtn) return;

    this.submitBtn.disabled = isLoading;
    this.submitBtn.innerHTML = isLoading
      ? '<i data-feather="loader" class="spinning"></i> Memproses...'
      : '<i data-feather="log-in"></i> Login';
    if (window.feather) feather.replace();
  }
}

export default LoginPageView;
