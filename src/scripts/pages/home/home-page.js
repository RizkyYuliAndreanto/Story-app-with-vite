import { allStories } from "../../data/api.js";
import { redirectIfNotAuthenticated, getAuthToken } from "../../utils/auth.js";

export default class HomePage {
  async render() {
    if (!redirectIfNotAuthenticated()) return "";

    return `
      <section class="home">
        <h2 style="color: white;"><i data-feather="book-open" style="color: white;"></i> Daftar Cerita</h2>
        <div id="story-list" class="list"></div>
        <div id="map" class="map"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyList = document.getElementById("story-list");

    try {
      storyList.innerHTML =
        '<div class="loading" style="color: white;"><i data-feather="loader" style="color: white;"></i> Memuat cerita...</div>';

      const token = getAuthToken();
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
          <div class="story-card-content" style="color: white;">
            <h3 ><i data-feather="user" style="color: white;"></i> ${
              story.name
            }</h3>
            <p><i data-feather="align-left" style="color: white;"></i> ${
              story.description
            }</p>
            ${
              story.location
                ? `<p class="location" style="color: white;><i data-feather="map-pin" style="color: white;"></i> ${story.location}</p>`
                : ""
            }
            <p class="date" style="color: white;><i data-feather="calendar" style="color: white;"></i> ${new Date(
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

      if (window.feather) feather.replace();
    } catch (error) {
      console.error("Error:", error);
      storyList.innerHTML = `
        <div class="error" style="color: white;">
          <i data-feather="alert-circle" style="color: white;"></i> Gagal memuat cerita: ${error.message}
        </div>
      `;
      if (window.feather) feather.replace();
    }
  }
}
