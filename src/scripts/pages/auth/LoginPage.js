import { loginUser } from "../../data/api";

export default class LoginPage {
  async render() {
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
           
          </div>
          
          <div class="form-group">
            <label for="password"><i data-feather="key"></i> Password</label>
            <div class="input-with-icon">
              
              <input type="password" id="password" name="password" minlength="6" placeholder="Masukkan password Anda" required>
              <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                <i data-feather="eye"></i>
              </button>
            </div>
          
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

  async afterRender() {
    // Inisialisasi Feather Icons
    if (window.feather) {
      feather.replace();
    }

    const loginForm = document.getElementById("login-form");
    const submitBtn = loginForm?.querySelector('button[type="submit"]');
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    // Toggle password visibility
    togglePassword?.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Update icon
      if (type === "text") {
        togglePassword.innerHTML = '<i data-feather="eye-off"></i>';
        togglePassword.style.color = "#4a90e2";
      } else {
        togglePassword.innerHTML = '<i data-feather="eye"></i>';
        togglePassword.style.color = "#777";
      }

      // Replace icons
      if (window.feather) {
        feather.replace();
      }
    });

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i data-feather="loader" class="spinning"></i> Memproses...';

      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Clear previous errors
        document.getElementById("email-error").textContent = "";
        document.getElementById("password-error").textContent = "";

        if (!email) {
          document.getElementById("email-error").textContent =
            "Email harus diisi";
          throw new Error("Email harus diisi");
        }

        if (!password) {
          document.getElementById("password-error").textContent =
            "Password harus diisi";
          throw new Error("Password harus diisi");
        }

        const result = await loginUser({ email, password });

        if (result.error || !result.loginResult?.token) {
          const errorMsg = result.message || "Autentikasi gagal";
          document.getElementById("password-error").textContent = errorMsg;
          throw new Error(errorMsg);
        }

        localStorage.setItem("token", result.loginResult.token);
        localStorage.setItem("userId", result.loginResult.userId);
        localStorage.setItem("userName", result.loginResult.name);

        window.location.href = "#/";
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-feather="log-in"></i> Login';
        if (window.feather) {
          feather.replace();
        }
      }
    });
  }
}
