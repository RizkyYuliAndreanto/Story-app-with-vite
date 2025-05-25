import { allStories } from "../../data/api.js";
import { redirectIfNotAuthenticated } from "../../utils/auth.js";

export default class HomePage {
  async render() {
     redirectIfNotAuthenticated();
    return `
      <section class="home">
        <h2><i data-feather="book-open"></i> Daftar Cerita</h2>
        <div id="story-list" class="list"></div>
        <div id="map" class="map"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyList = document.getElementById("story-list");

    try {
      storyList.innerHTML =
        '<div class="loading"><i data-feather="loader"></i> Memuat cerita...</div>';

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Anda perlu login terlebih dahulu");

      const response = await allStories(token);
      console.log("API Response:", response);

      if (
        !response ||
        !response.listStory ||
        !Array.isArray(response.listStory)
      ) {
        throw new Error("Format data tidak valid: " + JSON.stringify(response));
      }

      const stories = response.listStory;

      storyList.innerHTML = stories
        .map(
          (story) => `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}" />
          <div class="story-card-content">
            <h3><i data-feather="user"></i> ${story.name}</h3>
            <p><i data-feather="align-left"></i> ${story.description}</p>
            ${
              story.location
                ? `<p class="location"><i data-feather="map-pin"></i> ${story.location}</p>`
                : ""
            }
            <p class="date"><i data-feather="calendar"></i> ${new Date(
              story.createdAt
            ).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
          </div>
        </div>
      `
        )
        .join("");

      // Panggil feather.replace() setelah konten dimuat
      if (window.feather) {
        feather.replace();
      }
    } catch (error) {
      console.error("Error:", error);
      storyList.innerHTML = `
        <div class="error">
          <i data-feather="alert-circle"></i> Gagal memuat cerita: ${error.message}
        </div>
      `;
      if (window.feather) {
        feather.replace();
      }
    }
  }
}
