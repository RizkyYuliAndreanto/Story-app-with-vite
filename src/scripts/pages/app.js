// src/scripts/pages/app.js
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isAuthenticated } from "../utils/auth";
import NotFoundPage from "../pages/notFound/not-found";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #sidebarOverlay = null;

  constructor({ navigationDrawer, drawerButton, content, sidebarOverlay }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#sidebarOverlay = sidebarOverlay;
    console.log("App: Constructor called."); // Tambahan log

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
      this.#sidebarOverlay.classList.toggle("active");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target) &&
        this.#navigationDrawer.classList.contains("open")
      ) {
        this.#navigationDrawer.classList.remove("open");
        this.#sidebarOverlay.classList.remove("active");
      }
    });

    this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.#navigationDrawer.classList.remove("open");
        this.#sidebarOverlay.classList.remove("active");
      });
    });
    console.log("App: Drawer setup complete."); // Tambahan log
  }

  async renderPage() {
    console.log("App: renderPage() called."); // Tambahan log

    document.body.classList.toggle("authenticated", isAuthenticated());
    console.log(
      "App: Auth status updated on body. authenticated:",
      isAuthenticated()
    ); // Tambahan log

    const url = getActiveRoute();
    console.log("App: Active route determined:", url);
    const PageClass = routes[url]; // Dapatkan KELAS halaman, bukan instance-nya
    console.log("App: PageClass retrieved from routes:", PageClass);

    let page;
    if (PageClass) {
      page = new PageClass(); // BUAT INSTANCE BARU DI SINI
      console.log("App: Page instance created:", page);
    } else {
      console.warn(
        `App: No specific PageClass found for URL "${url}". Using NotFoundPage.`
      );
      page = new NotFoundPage();
      console.log("App: NotFoundPage instance created.");
    }

    if (page && typeof page.render === "function") {
      console.log(`App: Page has render() method. Proceeding to render:`, page);
      // Ini adalah baris KUNCI. Periksa apakah #content valid di sini.
      console.log("App: Target content element (#content):", this.#content);

      try {
        this.#content.innerHTML = await page.render();
        console.log("App: Page HTML rendered into content element.");

        if (typeof page.afterRender === "function") {
          console.log("App: Page has afterRender() method. Calling it.");
          await page.afterRender();
          console.log("App: afterRender() completed.");
        } else {
          console.warn("App: Page does not have an afterRender() method.");
        }
      } catch (renderError) {
        console.error("App: Error during page rendering:", renderError);
        this.#content.innerHTML = `<h1 style="color: red;">Error Rendering Page!</h1><p style="color: red;">Check console for details.</p>`;
      }
    } else {
      console.error(
        `App: Halaman untuk URL "${url}" tidak memiliki metode render atau bukan objek valid.`
      );
      this.#content.innerHTML = await new NotFoundPage().render();
      await new NotFoundPage().afterRender();
    }
  }
}

export default App;
