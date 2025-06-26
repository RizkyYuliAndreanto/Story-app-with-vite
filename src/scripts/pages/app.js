// src/scripts/pages/app.js
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isAuthenticated } from "../utils/auth";
import NotFoundPage from "../pages/notFound/not-found";
// Tambahkan import yang diperlukan
import NotificationHelper from "../utils/notification.js"; // Pastikan path benar
// Anda mungkin juga perlu mengimpor Model jika method isLoggedIn() ada di Model.
// import StoryModel from "../models/story-model.js"; // Contoh, jika StoryModel punya isLoggedIn()

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #sidebarOverlay = null;
  #currentPagePresenter = null; // Menambahkan ini untuk cleanup presenter

  // Inisialisasi NotificationHelper
  notificationHelper = new NotificationHelper();
  // Jika Anda punya model yang punya isLoggedIn(), inisialisasi di sini
  // model = new StoryModel(); // Contoh

  constructor({ navigationDrawer, drawerButton, content, sidebarOverlay }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#sidebarOverlay = sidebarOverlay;
    console.log("App: Constructor called.");

    this.#setupDrawer();
    // Panggil notifikasi selamat datang setelah setup awal
    this.showWelcomeNotificationIfNeeded();
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
    console.log("App: Drawer setup complete.");
  }

  // Metode untuk menampilkan notifikasi selamat datang
  async showWelcomeNotificationIfNeeded() {
    // Cek apakah pengguna sudah pernah melihat notifikasi selamat datang di sesi ini
    const hasSeenWelcomeNotification = sessionStorage.getItem(
      "hasSeenWelcomeNotification"
    );
    if (hasSeenWelcomeNotification) {
      console.debug("App: Welcome notification already shown in this session.");
      return;
    }

    // Pastikan Service Worker siap
    if (!("serviceWorker" in navigator)) {
      console.warn(
        "App: Service Worker not supported, cannot show welcome notification."
      );
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log("App: Service Worker ready for welcome notification.");

      // Cek izin notifikasi
      if (Notification.permission !== "granted") {
        console.warn(
          "App: Notification permission not granted, cannot show welcome notification."
        );
        return;
      }

      // Pastikan pengguna terautentikasi (jika notifikasi ini hanya untuk yang login)
      // Asumsi Anda punya method isAuthenticated() dari auth.js yang dicek di sini.
      if (!isAuthenticated()) {
        console.debug(
          "App: User not logged in, skipping welcome notification."
        );
        return;
      }

      // Tampilkan notifikasi
      registration.showNotification("Selamat Datang di Story App!", {
        body: "Bagikan cerita Anda dengan komunitas kami. Klik untuk menambahkan cerita baru!",
        icon: "/images/icon-icon-x192.png", // Path ikon Anda di public/images
        badge: "/images/maskable-icon-x48.png", // Path badge ikon Anda di public/images
        tag: "welcome-notification", // Tag unik untuk notifikasi ini
        renotify: true, // Izinkan notifikasi ini untuk diperbarui
        actions: [
          {
            action: "add_story_action",
            title: "Tambah Cerita",
            icon: "/images/add-icon-x192.png", // Ikon untuk tombol aksi
          },
        ],
        data: {
          url: "/Story-app-with-vite/#/addstory", // Data tambahan jika diklik di body
        },
      });

      sessionStorage.setItem("hasSeenWelcomeNotification", "true");
      console.log("App: Welcome notification shown.");
    } catch (error) {
      console.error("App: Failed to show welcome notification:", error);
    }
  }

  async renderPage() {
    console.log("App: renderPage() called.");

    document.body.classList.toggle("authenticated", isAuthenticated());
    console.log(
      "App: Auth status updated on body. authenticated:",
      isAuthenticated()
    );

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
      console.log("App: Target content element (#content):", this.#content);

      try {
        // Cleanup presenter sebelumnya jika ada dan memiliki metode cleanup
        if (
          this.#currentPagePresenter &&
          typeof this.#currentPagePresenter.cleanup === "function"
        ) {
          console.log(`App: Calling cleanup for previous presenter.`);
          this.#currentPagePresenter.cleanup();
        }

        this.#content.innerHTML = await page.render();
        console.log("App: Page HTML rendered into content element.");

        // Simpan referensi ke presenter halaman saat ini untuk cleanup
        this.#currentPagePresenter = page.presenter || page; // Asumsi page bisa juga presenter

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
