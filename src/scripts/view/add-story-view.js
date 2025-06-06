// src/scripts/view/add-story-view.js
import L from "leaflet";
import "leaflet/dist/leaflet.css";

class AddStoryView {
  constructor() {
    this.form = null;
    this.descriptionInput = null;
    this.uploadBtn = null;
    this.cameraBtn = null;
    this.fileUploadContainer = null;
    this.cameraContainer = null;
    this.fileInput = null;
    this.imagePreview = null;
    this.cameraPreview = null;
    this.cameraSelect = null;
    this.captureBtn = null;
    this.switchCameraBtn = null;
    this.cancelCameraBtn = null;
    this.cameraCanvas = null;
    this.cameraImageHiddenInput = null;
    this.mapContainer = null;
    this.latitudeInput = null;
    this.longitudeInput = null;
    this.coordinatesDisplay = null;
    this.submitBtn = null;
    this.cameraPermissionError = null;

    this.mapInstance = null;
    this.mapMarker = null;
    this.cameraStream = null;
  }

  render() {
    return `
      <section class="add-story">
        <h2>Tambah Cerita Baru</h2>
        <form id="add-story-form">

          <div class="form-group">
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" required></textarea>
          </div>

          <div class="form-group">
            <label>Gambar:</label>
            <div class="image-source-options">
              <button type="button" id="upload-btn" class="source-btn active">
                <i data-feather="upload"></i> Upload File
              </button>
              <button type="button" id="camera-btn" class="source-btn">
                <i data-feather="camera"></i> Kamera
              </button>
            </div>

            <div class="image-upload-container" id="file-upload-container">
              <input type="file" id="image-file" name="image" accept="image/*" />
              <div class="image-preview" id="image-preview"></div>
            </div>

            <div class="camera-container" id="camera-container" style="display: none;">
              <p id="camera-permission-error" class="error-message" style="display: none;">
                <i data-feather="alert-circle"></i> Izin kamera tidak diberikan atau ada masalah.
              </p>
              <video id="camera-preview" autoplay playsinline></video>
              <div class="form-group">
                <label for="camera-select">Pilih Kamera:</label>
                <select id="camera-select" class="camera-select"></select>
              </div>
              <div class="camera-controls">
                <button type="button" id="capture-btn" class="btn-capture">
                  <i data-feather="camera"></i> Ambil Foto
                </button>
                <button type="button" id="switch-camera" class="btn-switch">
                  <i data-feather="refresh-cw"></i> Ganti Kamera
                </button>
                <button type="button" id="cancel-camera" class="btn-cancel">
                  <i data-feather="x-circle"></i> Batal
                </button>
              </div>
              <canvas id="camera-canvas" style="display: none;"></canvas>
              <input type="hidden" id="camera-image" name="image" />
            </div>
          </div>

          <div class="form-group">
            <label>Lokasi:</label>
            <div class="map-container">
              <div id="map"></div>
            </div>
            <div class="coordinates">
              <input type="hidden" id="latitude" name="latitude" />
              <input type="hidden" id="longitude" name="longitude" />
              <p>Koordinat: <span id="coordinates-display">Belum dipilih</span></p>
            </div>
          </div>

          <button type="submit" class="submit-btn">Kirim Cerita</button>
        </form>
      </section>
    `;
  }

  getElements() {
    this.form = document.getElementById("add-story-form");
    this.descriptionInput = document.getElementById("description");
    this.uploadBtn = document.getElementById("upload-btn");
    this.cameraBtn = document.getElementById("camera-btn");
    this.fileUploadContainer = document.getElementById("file-upload-container");
    this.cameraContainer = document.getElementById("camera-container");
    this.fileInput = document.getElementById("image-file");
    this.imagePreview = document.getElementById("image-preview");
    this.cameraPreview = document.getElementById("camera-preview");
    this.cameraSelect = document.getElementById("camera-select");
    this.captureBtn = document.getElementById("capture-btn");
    this.switchCameraBtn = document.getElementById("switch-camera");
    this.cancelCameraBtn = document.getElementById("cancel-camera");
    this.cameraCanvas = document.getElementById("camera-canvas");
    this.cameraImageHiddenInput = document.getElementById("camera-image");
    this.mapContainer = document.getElementById("map");
    this.latitudeInput = document.getElementById("latitude");
    this.longitudeInput = document.getElementById("longitude");
    this.coordinatesDisplay = document.getElementById("coordinates-display");
    this.submitBtn = this.form?.querySelector('button[type="submit"]');
    this.cameraPermissionError = document.getElementById(
      "camera-permission-error"
    );

    if (window.feather) feather.replace();
  }

  setSubmitButtonLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    this.submitBtn.innerHTML = isLoading
      ? '<i data-feather="loader" class="spinning"></i> Memproses...'
      : '<i data-feather="send"></i> Kirim Cerita';
    if (window.feather) feather.replace();
  }

  showUploadMode() {
    this.stopCamera();
    this.fileUploadContainer.style.display = "block";
    this.cameraContainer.style.display = "none";
    this.uploadBtn.classList.add("active");
    this.cameraBtn.classList.remove("active");
    this.fileInput.value = "";
    this.resetImagePreview();
    this.hideCameraPermissionError();
  }

  showCameraMode() {
    this.fileUploadContainer.style.display = "none";
    this.cameraContainer.style.display = "block";
    this.cameraBtn.classList.add("active");
    this.uploadBtn.classList.remove("active");
    this.resetImagePreview();
  }

  displayImagePreview(src) {
    this.imagePreview.innerHTML = `<img src="${src}" alt="Preview Gambar" class="preview-image">`;
  }

  resetImagePreview() {
    this.imagePreview.innerHTML = "";
    this.cameraImageHiddenInput.value = "";
  }

  async getAvailableCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "videoinput");
  }

  populateCameraSelect(videoDevices, currentDeviceId = null) {
    this.cameraSelect.innerHTML = "";
    videoDevices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Kamera ${index + 1}`;
      option.selected = currentDeviceId === device.deviceId;
      this.cameraSelect.appendChild(option);
    });
  }

  async startCameraStream(deviceId) {
    this.stopCamera();
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      this.cameraPreview.srcObject = this.cameraStream;
      this.cameraPreview.style.transform = "";

      await new Promise((resolve) => {
        this.cameraPreview.onloadedmetadata = () => {
          this.cameraPreview.play();
          resolve();
        };
      });
      this.hideCameraPermissionError();
      return true;
    } catch (error) {
      console.error("Failed to start camera:", error);
      this.showCameraPermissionError();
      return false;
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
      this.cameraPreview.srcObject = null;
    }
  }

  captureImage() {
    if (
      !this.cameraStream ||
      this.cameraPreview.readyState !== this.cameraPreview.HAVE_ENOUGH_DATA
    ) {
      alert("Kamera belum siap mengambil gambar!");
      return null;
    }

    const canvas = this.cameraCanvas;
    const ctx = canvas.getContext("2d");
    canvas.width = this.cameraPreview.videoWidth;
    canvas.height = this.cameraPreview.videoHeight;

    const isFrontCamera =
      this.cameraSelect.selectedOptions[0]?.text.includes("front") ||
      this.cameraSelect.selectedOptions[0]?.text.includes("depan") ||
      this.cameraPreview.srcObject?.getVideoTracks()[0]?.getSettings()
        .facingMode === "user";

    if (isFrontCamera) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(this.cameraPreview, 0, 0, canvas.width, canvas.height);

    if (isFrontCamera) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const imageDataURL = canvas.toDataURL("image/png");

    if (imageDataURL === "data:,") {
      alert("Gagal mengambil foto. Coba lagi!");
      return null;
    }

    this.cameraImageHiddenInput.value = imageDataURL;
    this.displayImagePreview(imageDataURL);
    this.stopCamera();
    return imageDataURL;
  }

  showCameraPermissionError() {
    if (this.cameraPermissionError) {
      this.cameraPermissionError.style.display = "block";
      if (window.feather) feather.replace();
    }
  }

  hideCameraPermissionError() {
    if (this.cameraPermissionError) {
      this.cameraPermissionError.style.display = "none";
    }
  }

  initMap(onMapClickCallback) {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }

    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.error("Map element with ID 'map' not found.");
      return;
    }

    this.mapInstance = L.map(mapElement).setView([-6.2, 106.8], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18,
    }).addTo(this.mapInstance);

    // Gunakan ikon kustom yang sama dengan halaman home
    const customMarkerIcon = L.divIcon({
      className: "custom-story-marker", // Kelas CSS yang sama dari styles.css
      html: '<div class="story-marker-icon"><i data-feather="map-pin"></i></div>',
      iconSize: [36, 36], // Ukuran ikon
      iconAnchor: [18, 36], // Titik jangkar ikon (pusat bawah)
      popupAnchor: [0, -36], // Titik jangkar popup relatif terhadap ikon
    });

    this.mapMarker = null;
    this.mapInstance.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (!this.mapMarker) {
        this.mapMarker = L.marker([lat, lng], { icon: customMarkerIcon }).addTo(
          // Gunakan customMarkerIcon
          this.mapInstance
        );
      } else {
        this.mapMarker.setLatLng([lat, lng]);
      }
      this.mapMarker
        .bindPopup(`Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup();
      this.latitudeInput.value = lat;
      this.longitudeInput.value = lng;
      this.coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(
        6
      )}`;
      if (onMapClickCallback) {
        onMapClickCallback(lat, lng);
      }
      if (window.feather) feather.replace(); // Pastikan ikon di popup dirender
    });

    setTimeout(() => {
      if (this.mapInstance) {
        this.mapInstance.invalidateSize();
        console.log("Map invalidated size.");
      }
    }, 100);
  }

  getLatitude() {
    return this.latitudeInput.value;
  }

  getLongitude() {
    return this.longitudeInput.value;
  }

  resetFormAndDisplay() {
    this.form.reset();
    this.resetImagePreview();
    this.coordinatesDisplay.textContent = "Belum dipilih";
    if (this.mapMarker) {
      this.mapInstance.removeLayer(this.mapMarker);
      this.mapMarker = null;
    }
    this.initMap(); 
    this.showUploadMode(); 
  }

  bindUploadButtonClick(handler) {
    this.uploadBtn.addEventListener("click", handler);
  }

  bindCameraButtonClick(handler) {
    this.cameraBtn.addEventListener("click", handler);
  }

  bindCancelCameraButtonClick(handler) {
    this.cancelCameraBtn.addEventListener("click", handler);
  }

  bindCameraSelectChange(handler) {
    this.cameraSelect.addEventListener("change", handler);
  }

  bindSwitchCameraButtonClick(handler) {
    this.switchCameraBtn.addEventListener("click", handler);
  }

  bindCaptureButtonClick(handler) {
    this.captureBtn.addEventListener("click", handler);
  }

  bindFileInputChange(handler) {
    this.fileInput.addEventListener("change", handler);
  }

  bindFormSubmit(handler) {
    this.form.addEventListener("submit", handler);
  }

  getDescription() {
    return this.descriptionInput.value;
  }
}

export default AddStoryView;
