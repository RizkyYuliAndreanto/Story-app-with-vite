// src/scripts/view/home-page-view.js
import L from "leaflet";
import "leaflet/dist/leaflet.css";

class HomePageView {
  constructor(containerId = "main-content") {
    this.container = document.querySelector(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found.`);
    }
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
  }

  renderStories(stories) {
    const storyList = document.getElementById("story-list");
    if (storyList) {
      storyList.innerHTML = stories
        .map(
          (story) => `
            <div class="story-card">
              <img src="${story.photoUrl}" alt="${story.name}" />
              <div class="story-card-content" style="color: white;">
                <h3><i data-feather="user" style="color: white;"></i> ${
                  story.name
                }</h3>
                <p><i data-feather="align-left" style="color: white;"></i> ${
                  story.description
                }</p>
                ${
                  story.location
                    ? `<p class="location" style="color: white;"><i data-feather="map-pin" style="color: white;"></i> ${story.location}</p>`
                    : ""
                }
                <p class="date" style="color: white;"><i data-feather="calendar" style="color: white;"></i> ${new Date(
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
    }
  }

  showError(message) {
    const storyList = document.getElementById("story-list");
    if (storyList) {
      storyList.innerHTML = `
            <div class="error" style="color: white;">
              <i data-feather="alert-circle" style="color: white;"></i> Gagal memuat cerita: ${message}
            </div>
          `;
      if (window.feather) feather.replace();
    }
  }

  // ==== Tambahkan Metode Peta di sini ====
  initMap() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
    const mapElement = document.getElementById("home-map");
    if (!mapElement) {
      console.error("Map element with ID 'home-map' not found.");
      return;
    }

    // Ubah koordinat default ke Jakarta
    this.mapInstance = L.map("home-map").setView([-6.2088, 106.8456], 13); // Koordinat Jakarta, zoom 13

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.mapInstance);

    setTimeout(() => this.mapInstance.invalidateSize(), 100);
  }

  renderStoryLocations(stories) {
    this.storyMarkers.forEach((marker) => this.mapInstance.removeLayer(marker));
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
            <p>${story.description.substring(0, 50)}...</p>
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
      // Jika tidak ada lokasi, set ke tampilan default Jakarta
      this.mapInstance.setView([-6.2088, 106.8456], 13); // Koordinat Jakarta, zoom 13
    }

    if (window.feather) feather.replace();
  }
}

export default HomePageView;
