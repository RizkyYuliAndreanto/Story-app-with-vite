import { redirectIfNotAuthenticated } from "../../utils/auth.js";

export default class AboutPage {
  async render() {
    const isLoggedIn = redirectIfNotAuthenticated();

    return `
      <section class="container about-container">
        <h1><i data-feather="info"></i> Tentang Kami</h1>
        <div class="about-content">
          <p>Aplikasi ini dibuat untuk berbagi cerita dan pengalaman menarik.</p>
          ${
            isLoggedIn
              ? `
            <button id="logout-btn" class="logout-btn">
              <i data-feather="log-out"></i> Keluar
            </button>
          `
              : ""
          }
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (window.feather) {
      feather.replace();
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        clearAuth();
        window.location.hash = "#/login";
      });
    }
  }
}
