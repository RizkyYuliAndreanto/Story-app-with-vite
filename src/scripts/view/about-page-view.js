// src/scripts/view/about-page-view.js
class AboutPageView {
  constructor() {
    this.container = null;
  }

  render(userName = "Pengguna") {
    
    return `
        <section class="container about-container">
          <h1><i data-feather="info"></i> Tentang Kami</h1>
          <div class="about-content">
            <p>Aplikasi ini dibuat untuk berbagi cerita dan pengalaman menarik.</p>
            <p>Halo, <strong>${userName}</strong>!</p>
          </div>
        </section>
      `;
  }

  
  getElements() {
  
  }

  
  replaceFeatherIcons() {
    if (window.feather) {
      feather.replace();
    }
  }
}

export default AboutPageView;
