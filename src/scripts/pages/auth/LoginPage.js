import { loginUser } from "../../data/api";
import { setAuthData } from "../../utils/auth";

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
    if (window.feather) feather.replace();

    const loginForm = document.getElementById("login-form");
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    // Toggle password visibility
    togglePassword?.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.innerHTML =
        type === "password"
          ? '<i data-feather="eye"></i>'
          : '<i data-feather="eye-off"></i>';
      if (window.feather) feather.replace();
    });

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const emailError = document.getElementById("email-error");
      const passwordError = document.getElementById("password-error");

      

      try {
        if (!email) {
          emailError.textContent = "Email harus diisi";
          return;
        }

        if (!password) {
          passwordError.textContent = "Password harus diisi";
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i data-feather="loader" class="spinning"></i> Memproses...';
        if (window.feather) feather.replace();

        const result = await loginUser({ email, password });

        if (!result.loginResult?.token) {
          throw new Error(result.message || "Autentikasi gagal");
        }

        setAuthData(result.loginResult.token, {
          id: result.loginResult.userId,
          name: result.loginResult.name,
          email: email,
        });

        const returnTo = sessionStorage.getItem("returnTo") || "#/";
        sessionStorage.removeItem("returnTo");
        window.location.hash = returnTo;
        window.location.reload();
      } catch (error) {
        console.error("Login error:", error);
        passwordError.textContent = error.message;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-feather="log-in"></i> Login';
        if (window.feather) feather.replace();
      }
    });
  }
}
