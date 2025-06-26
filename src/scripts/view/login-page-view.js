// src/scripts/view/login-page-view.js
class LoginPageView {
  constructor() {
    this.loginForm = null;
    this.togglePasswordButton = null;
    this.passwordInput = null;
    this.emailInput = null;
    this.submitBtn = null;
    console.log("LoginPageView: Constructor called."); // Tambahan log
  }

  render() {
    console.log("LoginPageView: render() called, returning HTML string."); // Tambahan log
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
    console.log("LoginPageView: loginForm element found?", !!this.loginForm); // Tambahan log
    this.togglePasswordButton = document.querySelector(".toggle-password");
    console.log(
      "LoginPageView: togglePasswordButton element found?",
      !!this.togglePasswordButton
    ); // Tambahan log
    this.passwordInput = document.getElementById("password");
    console.log(
      "LoginPageView: passwordInput element found?",
      !!this.passwordInput
    ); // Tambahan log
    this.emailInput = document.getElementById("email");
    console.log("LoginPageView: emailInput element found?", !!this.emailInput); // Tambahan log
    this.submitBtn = this.loginForm?.querySelector('button[type="submit"]');
    console.log("LoginPageView: submitBtn element found?", !!this.submitBtn); // Tambahan log
  }

  // Method untuk mendaftarkan event listener
  bindTogglePassword(handler) {
    if (this.togglePasswordButton) {
      // Periksa keberadaan elemen sebelum menambahkan event listener
      this.togglePasswordButton.addEventListener("click", handler); //
      console.log(
        "LoginPageView: Toggle password button event listener bound."
      ); // Tambahan log
    } else {
      console.warn(
        "LoginPageView: Toggle password button not found, cannot bind event."
      ); // Tambahan log
    }
  }

  bindLoginFormSubmit(handler) {
    if (this.loginForm) {
      // Periksa keberadaan elemen sebelum menambahkan event listener
      this.loginForm.addEventListener("submit", handler); //
      console.log("LoginPageView: Login form submit event listener bound."); // Tambahan log
    } else {
      console.warn("LoginPageView: Login form not found, cannot bind event."); // Tambahan log
    }
  }

  // Method untuk mendapatkan nilai input
  getEmail() {
    return this.emailInput?.value.trim(); //
  }

  getPassword() {
    return this.passwordInput?.value.trim(); //
  }

  // Method untuk menampilkan/menyembunyikan password
  togglePasswordVisibility() {
    if (!this.passwordInput || !this.togglePasswordButton) {
      console.warn(
        "LoginPageView: Password input or toggle button not found for visibility toggle."
      );
      return;
    }
    const type =
      this.passwordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    this.passwordInput.setAttribute("type", type); //
    this.togglePasswordButton.innerHTML =
      type === "password"
        ? '<i data-feather="eye"></i>'
        : '<i data-feather="eye-off"></i>';
    if (window.feather) feather.replace(); //
    console.log(`LoginPageView: Password visibility toggled to ${type}.`); // Tambahan log
  }

  // Method untuk menampilkan pesan error
  showEmailError(message) {
    const emailError = document.getElementById("email-error");
    if (emailError) {
      emailError.textContent = message;
      console.log(`LoginPageView: Email error displayed: ${message}`); // Tambahan log
    }
  }

  showPasswordError(message) {
    const passwordError = document.getElementById("password-error");
    if (passwordError) {
      passwordError.textContent = message;
      console.log(`LoginPageView: Password error displayed: ${message}`); // Tambahan log
    }
  }

  clearErrors() {
    this.showEmailError("");
    this.showPasswordError("");
    console.log("LoginPageView: All errors cleared."); // Tambahan log
  }

  setSubmitButtonLoading(isLoading) {
    if (!this.submitBtn) return; //

    this.submitBtn.disabled = isLoading; //
    this.submitBtn.innerHTML = isLoading
      ? '<i data-feather="loader" class="spinning"></i> Memproses...'
      : '<i data-feather="log-in"></i> Login'; //
    if (window.feather) feather.replace(); //
    console.log(
      `LoginPageView: Submit button loading state set to ${isLoading}.`
    ); // Tambahan log
  }
}

export default LoginPageView;
