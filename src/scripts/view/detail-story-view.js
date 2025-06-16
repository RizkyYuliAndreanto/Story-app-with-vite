// src/scripts/view/detail-story-view.js
import L from "leaflet";
import "leaflet/dist/leaflet.css";

class DetailStoryView {
  constructor() {
    this.mapInstance = null;
    this.mapMarker = null;
  }

  render() {
    return `
      <section class="detail-story-page">
        <h2 style="color: white;"><i data-feather="book-open" style="color: white;"></i> Detail Cerita</h2>
        <div id="story-detail-content" class="story-detail-content">
          <div class="loading" style="color: white;"><i data-feather="loader" style="color: white;"></i> Memuat detail cerita...</div>
        </div>
        <div id="detail-map" class="map" style="display: none;"></div>
      </section>
    `;
  }

  showLoading() {
    const detailContent = document.getElementById("story-detail-content");
    if (detailContent) {
      detailContent.innerHTML =
        '<div class="loading" style="color: white;"><i data-feather="loader" style="color: white;"></i> Memuat detail cerita...</div>';
      if (window.feather) feather.replace();
    }
    const mapElement = document.getElementById("detail-map");
    if (mapElement) mapElement.style.display = "none";
  }

  renderStoryDetail(story) {
    const detailContent = document.getElementById("story-detail-content");
    if (!detailContent) return;

    detailContent.innerHTML = `
        <div class="detail-card">
            <img src="${story.photoUrl}" alt="${
      story.name
    }" class="detail-image" />
            <div class="detail-info">
                <h3 style="color: white;"><i data-feather="user" style="color: white;"></i> ${
                  story.name
                }</h3>
                <p class="detail-date" style="color: white;"><i data-feather="calendar" style="color: white;"></i> ${new Date(
                  story.createdAt
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
                <div class="detail-description" style="color: white;">
                    <h4>Deskripsi:</h4>
                    <p>${story.description}</p>
                </div>
                ${
                  story.lat && story.lon
                    ? `<p class="detail-location" style="color: white;"><i data-feather="map-pin" style="color: white;"></i> Lokasi: ${story.lat.toFixed(
                        4
                      )}, ${story.lon.toFixed(4)}</p>`
                    : ""
                }
            </div>
            <button id="bookmark-toggle-btn" class="bookmark-btn">
                <i class="far fa-bookmark"></i>
            </button>
        </div>
    `;

    if (window.feather) feather.replace();

    // Inisialisasi peta jika ada lokasi
    if (story.lat && story.lon) {
      this.initMap(story.lat, story.lon, story.name);
    } else {
      const mapElement = document.getElementById("detail-map");
      if (mapElement) mapElement.style.display = "none";
    }
  }

  initMap(lat, lon, name) {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }

    const mapElement = document.getElementById("detail-map");
    if (!mapElement) {
      console.error("Map element with ID 'detail-map' not found.");
      return;
    }
    mapElement.style.display = "block"; // Tampilkan peta

    this.mapInstance = L.map("detail-map").setView([lat, lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.mapInstance);

    const customMarkerIcon = L.divIcon({
      className: "custom-story-marker",
      html: '<div class="story-marker-icon"><i data-feather="map-pin"></i></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    this.mapMarker = L.marker([lat, lon], { icon: customMarkerIcon })
      .addTo(this.mapInstance)
      .bindPopup(`<b>${name}</b><br>Lokasi cerita`)
      .openPopup();

    setTimeout(() => {
      if (this.mapInstance) {
        this.mapInstance.invalidateSize();
        console.log("Detail Map invalidated size.");
      }
    }, 100);
  }

  updateBookmarkButton(isBookmarked) {
    const bookmarkButton = document.getElementById("bookmark-toggle-btn");
    if (bookmarkButton) {
      const icon = bookmarkButton.querySelector("i");
      if (isBookmarked) {
        icon.className = "fas fa-bookmark"; // Ikon penuh
        bookmarkButton.classList.add("bookmarked");
      } else {
        icon.className = "far fa-bookmark"; // Ikon outline
        bookmarkButton.classList.remove("bookmarked");
      }
      if (window.feather) feather.replace();
    }
  }

  showError(message) {
    const detailContent = document.getElementById("story-detail-content");
    if (detailContent) {
      detailContent.innerHTML = `
            <div class="error" style="color: white;">
              <i data-feather="alert-circle" style="color: white;"></i> ${message}
            </div>
          `;
      if (window.feather) feather.replace();
    }
    const mapElement = document.getElementById("detail-map");
    if (mapElement) mapElement.style.display = "none";
  }
}

export default DetailStoryView;
