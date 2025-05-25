import { redirectIfNotAuthenticated, getAuthUser } from "../../utils/auth.js";

export default class AboutPage {
  async render() {
    // Cek apakah user sudah login, jika tidak arahkan ke login
    if (!redirectIfNotAuthenticated()) return "";

    const user = getAuthUser();

    return `
      <section class="container about-container">
        <h1><i data-feather="info"></i> Tentang Kami</h1>
        <div class="about-content">
          <p>Aplikasi ini dibuat untuk berbagi cerita dan pengalaman menarik.</p>
          <p>Halo, <strong>${user?.name || "Pengguna"}</strong>!</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (window.feather) feather.replace();
    // Tidak ada fungsi logout di sini
  }
}
