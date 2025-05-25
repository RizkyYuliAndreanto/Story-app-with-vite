import { registerUser } from "../../data/api";

export default class RegisterPage {
  async render() {
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
          </div>
          
          <div class="form-group">
            <label for="email"><i data-feather="mail"></i> Email</label>
            <div class="input-with-icon">
              
              <input type="email" id="email" name="email" placeholder="contoh@email.com" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password"><i data-feather="lock"></i> Password</label>
            <div class="input-with-icon">
              
              <input type="password" id="password" name="password" minlength="6" placeholder="Minimal 6 karakter" required>
              <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                <i data-feather="eye"></i>
              </button>
            </div>
          </div>
        
          <button type="submit" class="submit-btn">
            <i data-feather="user-plus"></i> Daftar Sekarang
          </button>
          
          <p class="auth-link">
            Sudah punya akun? <a href="#/login"><i data-feather="log-in"></i> Masuk disini</a>
          </p>
        </form>
      </div>

      <style>
      .auth-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 420px;
        margin: 2rem auto;
      }

      .auth-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .auth-header i {
        width: 48px;
        height: 48px;
        padding: 12px;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        color: white;
        border-radius: 50%;
        margin-bottom: 1rem;
      }

      .auth-header h1 {
        color: #2c3e50;
        font-size: 1.5rem;
        margin: 0;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #2c3e50;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .form-group label i {
        width: 18px;
        height: 18px;
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-with-icon i:first-child {
        position: absolute;
        left: 14px;
        color: #7f8c8d;
        width: 18px;
        height: 18px;
      }

      .input-with-icon input {
        width: 100%;
        padding: 12px 16px 12px 42px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s;
      }

      .input-with-icon input:focus {
        outline: none;
        border-color: #6a11cb;
        box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
      }

      .toggle-password {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        color: #7f8c8d;
        padding: 8px;
      }

      .toggle-password i {
        width: 20px;
        height: 20px;
      }

      .submit-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s;
        margin-top: 1rem;
      }

      .submit-btn:hover {
        background: linear-gradient(135deg, #5a0db5, #1a65e0);
        transform: translateY(-2px);
      }

      .submit-btn i {
        width: 20px;
        height: 20px;
      }

      .auth-link {
        text-align: center;
        margin-top: 1.5rem;
        color: #7f8c8d;
      }

      .auth-link a {
        color: #6a11cb;
        text-decoration: none;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .auth-link a:hover {
        text-decoration: underline;
      }

      .auth-link i {
        width: 16px;
        height: 16px;
      }
      </style>
    `;
  }

  async afterRender() {
    // Initialize Feather Icons
    if (window.feather) {
      feather.replace();
    }

    const registerForm = document.getElementById("register-form");
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    // Toggle password visibility
    togglePassword?.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Update icon
      togglePassword.innerHTML =
        type === "password"
          ? '<i data-feather="eye"></i>'
          : '<i data-feather="eye-off"></i>';

      if (window.feather) {
        feather.replace();
      }
    });

    registerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      // Show loading state
      submitBtn.disabled = true;
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i data-feather="loader" class="spinning"></i> Memproses...';

      if (window.feather) {
        feather.replace();
      }

      const name = document.getElementById("name")?.value;
      const email = document.getElementById("email")?.value;
      const password = document.getElementById("password")?.value;

      try {
        if (!name || !email || !password) {
          throw new Error("Semua field harus diisi");
        }

        const result = await registerUser({ name, email, password });

        if (result.error) {
          throw new Error(result.message || "Registrasi gagal");
        }

        alert("Registrasi berhasil! Silakan login");
        window.location.href = "#/login";
      } catch (error) {
        console.error("Registration error:", error);
        alert(error.message);
      } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        if (window.feather) {
          feather.replace();
        }
      }
    });
  }
}
