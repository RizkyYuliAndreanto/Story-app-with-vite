// src/view/home-page-view.js
import L from "leaflet";
import "leaflet/dist/leaflet.css";

class HomePageView {
  constructor() {
    this.mapInstance = null;
    this.storyMarkers = [];
  }

  render() {
    return `
      <section class="home">
        <h2 style="color: white;"><i data-feather="book-open" style="color: white;"></i> Daftar Cerita</h2>
        <div id="story-list" class="list"></div>
        <div id="home-map" class="map"></div>
      </section>
    `;
  }

  showLoading() {
    const storyList = document.getElementById("story-list");
    if (storyList) {
      storyList.innerHTML =
        '<div class="loading" style="color: white;"><i data-feather="loader" style="color: white;"></i> Memuat cerita...</div>';
      if (window.feather) feather.replace();
    }
    const mapElement = document.getElementById("home-map");
    if (mapElement) {
      mapElement.style.display = "none";
    }
  }

  renderStories(stories) {
    const storyList = document.getElementById("story-list");
    if (storyList) {
      if (stories && stories.length > 0) {
        storyList.innerHTML = stories
          .map(
            (story) => `
              <div class="story-card" data-story-id="${story.id}">
                <img src="${story.photoUrl}" alt="${
              story.name
            }" loading="lazy" />
                <div class="story-card-content" style="color: white;">
                  <h3><i data-feather="user" style="color: white;"></i> ${
                    story.name
                  }</h3>
                  <p><i data-feather="align-left" style="color: white;"></i> ${story.description.substring(
                    0,
                    100
                  )}${story.description.length > 100 ? "..." : ""}</p>
                  ${
                    story.lat && story.lon
                      ? `<p class="location" style="color: white;"><i data-feather="map-pin" style="color: white;"></i> Lokasi Tersedia</p>`
                      : ""
                  }
                  <p class="date" style="color: white;"><i data-feather="calendar" style="color: white;"></i> ${new Date(
                    story.createdAt
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}</p>
                  <div class="story-actions">
                    <a href="#/stories/${
                      story.id
                    }" class="btn-read-detail">Baca Detail</a>
                    <button id="bookmark-btn-${
                      story.id
                    }" class="bookmark-btn" data-story-id="${story.id}">
                        <i class="${
                          story.isBookmarked
                            ? "fas fa-bookmark"
                            : "far fa-bookmark"
                        }"></i>
                    </button>
                  </div>
                </div>
              </div>
            `
          )
          .join("");
      } else {
        storyList.innerHTML = `
          <div class="info-message" style="color: white;">
            <i data-feather="info" style="color: white;"></i> Belum ada cerita yang tersedia.
          </div>
        `;
      }
      if (window.feather) feather.replace();
    }
    const mapElement = document.getElementById("home-map");
    if (mapElement) {
      mapElement.style.display = "block";
    }
  }

  // --- FUNGSI BARU UNTUK BOOKMARK BUTTON STATE ---
  updateBookmarkButton(storyId, isBookmarked) {
    const bookmarkButton = document.getElementById(`bookmark-btn-${storyId}`);
    if (bookmarkButton) {
      const icon = bookmarkButton.querySelector("i");
      if (isBookmarked) {
        icon.className = "fas fa-bookmark"; // Ikon penuh
        bookmarkButton.classList.add("bookmarked");
      } else {
        icon.className = "far fa-bookmark"; // Ikon outline
        bookmarkButton.classList.remove("bookmarked");
      }
    }
  }
  // --- AKHIR FUNGSI BARU ---

  showError(message) {
    const storyList = document.getElementById("story-list");
    if (storyList) {
      storyList.innerHTML = `
            <div class="error" style="color: white;">
              <i data-feather="alert-circle" style="color: white;"></i> ${message}
            </div>
          `;
      if (window.feather) feather.replace();
    }
    const mapElement = document.getElementById("home-map");
    if (mapElement) {
      mapElement.style.display = "none";
    }
  }

  initMap() {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }

    const mapElement = document.getElementById("home-map");
    if (!mapElement) {
      console.error("Map element with ID 'home-map' not found.");
      return;
    }

    this.mapInstance = L.map("home-map").setView([-6.2088, 106.8456], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.mapInstance);

    setTimeout(() => {
      if (this.mapInstance) {
        this.mapInstance.invalidateSize();
        console.log("Map invalidated size.");
      }
    }, 100);
  }

  renderStoryLocations(stories) {
    this.storyMarkers.forEach((marker) => {
      if (this.mapInstance && this.mapInstance.hasLayer(marker)) {
        this.mapInstance.removeLayer(marker);
      }
    });
    this.storyMarkers = [];

    if (!this.mapInstance) {
      console.warn("Map not initialized. Cannot render story locations.");
      return;
    }

    const storyIcon = L.divIcon({
      className: "custom-story-marker",
      html: '<div class="story-marker-icon"><i data-feather="map-pin"></i></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    let hasLocations = false;
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        hasLocations = true;
        const marker = L.marker([story.lat, story.lon], {
          icon: storyIcon,
        }).addTo(this.mapInstance);

        marker.bindPopup(`
          <div class="map-popup-content">
            <h4>${story.name}</h4>
            <p>${story.description.substring(0, 50)}${
          story.description.length > 50 ? "..." : ""
        }</p>
            <p class="popup-date">${new Date(
              story.createdAt
            ).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
          </div>
        `);
        this.storyMarkers.push(marker);
      }
    });

    if (hasLocations && this.storyMarkers.length > 0) {
      const group = new L.featureGroup(this.storyMarkers);
      this.mapInstance.fitBounds(group.getBounds().pad(0.5));
    } else {
      this.mapInstance.setView([-6.2088, 106.8456], 13);
    }

    if (window.feather) feather.replace();
  }
}

export default HomePageView;
