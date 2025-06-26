// src/scripts/view/add-story-view.js
import L from "leaflet"; 
import "leaflet/dist/leaflet.css"; 

class AddStoryView {
  
  form = null;
  descriptionInput = null;
  uploadBtn = null;
  cameraBtn = null;
  fileUploadContainer = null;
  cameraContainer = null;
  fileInput = null;
  imagePreview = null;
  cameraPreview = null;
  cameraSelect = null;
  captureBtn = null;
  switchCameraBtn = null;
  cancelCameraBtn = null;
  cameraCanvas = null;
  cameraImageHiddenInput = null; 
  mapContainer = null; 
  latitudeInput = null;
  longitudeInput = null;
  coordinatesDisplay = null;
  submitBtn = null;
  cameraPermissionError = null;
  testNotificationBtn = null; 

  mapInstance = null;
  mapMarker = null; 
  cameraStream = null; 

  constructor() {
    
  }

  /**
   * Merender struktur HTML halaman "Tambah Cerita".
   * @returns {string} String HTML dari halaman.
   */
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
          
          <button type="button" id="test-notification-btn" class="submit-btn" style="background-color: #007bff; margin-top: 10px;">
            <i data-feather="bell"></i> Test Notifikasi Lokal
          </button>
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
    this.testNotificationBtn = document.getElementById("test-notification-btn"); 

    if (window.feather) feather.replace(); 
  }

  /**
   * Mengatur status loading pada tombol submit.
   * @param {boolean} isLoading True untuk mode loading, false untuk normal.
   */
  setSubmitButtonLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    this.submitBtn.innerHTML = isLoading
      ? '<i data-feather="loader" class="spinning"></i> Memproses...'
      : '<i data-feather="send"></i> Kirim Cerita';
    if (window.feather) feather.replace();
  }

  /**
   * Menampilkan mode upload file dan menyembunyikan mode kamera.
   */
  showUploadMode() {
    this.stopCamera(); // Pastikan kamera dihentikan
    this.fileUploadContainer.style.display = "block";
    this.cameraContainer.style.display = "none";
    this.uploadBtn.classList.add("active");
    this.cameraBtn.classList.remove("active");
    this.fileInput.value = ""; // Bersihkan input file
    this.resetImagePreview(); // Reset preview gambar
    this.hideCameraPermissionError(); // Sembunyikan pesan error kamera
  }

  /**
   * Menampilkan mode kamera dan menyembunyikan mode upload file.
   */
  showCameraMode() {
    this.fileUploadContainer.style.display = "none";
    this.cameraContainer.style.display = "block";
    this.cameraBtn.classList.add("active");
    this.uploadBtn.classList.remove("active");
    this.resetImagePreview(); // Reset preview gambar
  }

  /**
   * Menampilkan pratinjau gambar dari Data URL atau Blob URL.
   * @param {string} src Data URL atau Blob URL gambar.
   */
  displayImagePreview(src) {
    this.imagePreview.innerHTML = `<img src="${src}" alt="Preview Gambar" class="preview-image">`;
  }

  /**
   * Mereset pratinjau gambar dan input terkait.
   */
  resetImagePreview() {
    this.imagePreview.innerHTML = "";
    this.cameraImageHiddenInput.value = ""; // Kosongkan input hidden kamera
    this.fileInput.value = ""; // Kosongkan input file
  }

  /**
   * Mendapatkan daftar perangkat kamera yang tersedia.
   * @returns {Promise<MediaDeviceInfo[]>} Array perangkat video input.
   */
  async getAvailableCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "videoinput");
  }

  /**
   * Mengisi elemen `<select>` kamera dengan perangkat yang tersedia.
   * @param {MediaDeviceInfo[]} videoDevices Array perangkat kamera.
   * @param {string} [currentDeviceId] ID perangkat kamera yang sedang aktif.
   */
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

  /**
   * Memulai stream kamera dari perangkat tertentu.
   * @param {string} deviceId ID perangkat kamera yang akan digunakan.
   * @returns {Promise<boolean>} True jika berhasil memulai stream, false jika gagal.
   */
  async startCameraStream(deviceId) {
    this.stopCamera(); // Hentikan stream yang ada
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      this.cameraPreview.srcObject = this.cameraStream;
      this.cameraPreview.style.transform = ""; // Reset transform jika ada dari kamera depan

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
      this.showCameraPermissionError(); // Tampilkan error izin kamera
      return false;
    }
  }

  /**
   * Menghentikan stream kamera yang aktif.
   */
  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
      this.cameraPreview.srcObject = null;
      console.log("AddStoryView: Camera stream stopped.");
    }
  }

  /**
   * Mengambil gambar dari stream kamera dan mengembalikannya sebagai Data URL.
   * @returns {string|null} Data URL gambar atau null jika gagal.
   */
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
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for subsequent draws
    }

    const imageDataURL = canvas.toDataURL("image/png");

    if (imageDataURL === "data:,") {
      alert("Gagal mengambil foto. Coba lagi!");
      return null;
    }

    this.cameraImageHiddenInput.value = imageDataURL; // Simpan ke input hidden
    this.displayImagePreview(imageDataURL); // Tampilkan di preview
    this.stopCamera(); // Hentikan kamera setelah ambil gambar
    this.showUploadMode(); // Kembali ke mode upload untuk menampilkan preview
    return imageDataURL;
  }

  /**
   * Menampilkan pesan error izin kamera.
   */
  showCameraPermissionError() {
    if (this.cameraPermissionError) {
      this.cameraPermissionError.style.display = "block";
      if (window.feather) feather.replace(); // Pastikan ikon dirender
    }
  }

  /**
   * Menyembunyikan pesan error izin kamera.
   */
  hideCameraPermissionError() {
    if (this.cameraPermissionError) {
      this.cameraPermissionError.style.display = "none";
    }
  }

  /**
   * Menginisialisasi peta Leaflet.
   * @param {Function} onMapClickCallback Callback yang dipanggil saat peta diklik.
   */
  initMap(onMapClickCallback) {
    if (this.mapInstance) {
      this.mapInstance.remove(); // Hapus instance peta yang ada
      this.mapInstance = null;
    }

    const mapElement = document.getElementById("map"); // Mengacu ke ID asli 'map'
    if (!mapElement) {
      console.error("AddStoryView: Map element with ID 'map' not found.");
      return;
    }

    this.mapInstance = L.map(mapElement).setView([-6.2, 106.8], 13); // Default view Jakarta
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

    // Perbarui ukuran peta setelah sedikit penundaan untuk memastikan rendering yang benar
    setTimeout(() => {
      if (this.mapInstance) {
        this.mapInstance.invalidateSize();
        console.log("AddStoryView: Map invalidated size.");
      }
    }, 100);
  }

  /**
   * Mengembalikan nilai latitude dari input hidden.
   * @returns {string} Latitude.
   */
  getLatitude() {
    return this.latitudeInput.value;
  }

  /**
   * Mengembalikan nilai longitude dari input hidden.
   * @returns {string} Longitude.
   */
  getLongitude() {
    return this.longitudeInput.value;
  }

  /**
   * Mereset formulir dan tampilan kembali ke keadaan awal.
   */
  resetFormAndDisplay() {
    this.form.reset();
    this.resetImagePreview();
    this.coordinatesDisplay.textContent = "Belum dipilih";
    if (this.mapMarker) {
      this.mapInstance.removeLayer(this.mapMarker); // Hapus marker dari peta
      this.mapMarker = null;
    }
    this.initMap(); // Re-inisialisasi peta
    this.showUploadMode(); // Pastikan kembali ke mode upload
  }

  /**
   * Menampilkan hasil submit formulir (sukses/gagal).
   * @param {Object} result Objek hasil submit dari Model/API.
   * @param {boolean} result.error Status error.
   * @param {string} result.message Pesan dari API.
   */
  showSubmitResult(result) {
    if (result.error) {
      alert(`Gagal menambahkan cerita: ${result.message}`);
    } else {
      alert("Cerita berhasil ditambahkan!");
      this.resetFormAndDisplay(); // Reset form dan tampilan setelah berhasil
    }
  }

  // --- Metode untuk mengikat event listener ---

  /**
   * Mengikat event click pada tombol "Pilih File".
   * @param {Function} handler Handler event.
   */
  bindUploadButtonClick(handler) {
    this.uploadBtn.addEventListener("click", handler);
  }

  /**
   * Mengikat event click pada tombol "Ambil Foto".
   * @param {Function} handler Handler event.
   */
  bindCameraButtonClick(handler) {
    this.cameraBtn.addEventListener("click", handler);
  }

  /**
   * Mengikat event click pada tombol "Batal" di mode kamera.
   * @param {Function} handler Handler event.
   */
  bindCancelCameraButtonClick(handler) {
    this.cancelCameraBtn.addEventListener("click", handler);
  }

  /**
   * Mengikat event change pada pilihan kamera.
   * @param {Function} handler Handler event.
   */
  bindCameraSelectChange(handler) {
    this.cameraSelect.addEventListener("change", handler);
  }

  /**
   * Mengikat event click pada tombol "Ganti Kamera".
   * @param {Function} handler Handler event.
   */
  bindSwitchCameraButtonClick(handler) {
    this.switchCameraBtn.addEventListener("click", handler);
  }

  /**
   * Mengikat event click pada tombol "Ambil Foto".
   * @param {Function} handler Handler event.
   */
  bindCaptureButtonClick(handler) {
    this.captureBtn.addEventListener("click", handler);
  }

  /**
   * Mengikat event change pada input file.
   * @param {Function} handler Handler event.
   */
  bindFileInputChange(handler) {
    this.fileInput.addEventListener("change", handler);
  }

  /**
   * Mengikat event submit pada formulir.
   * @param {Function} handler Handler event.
   */
  bindFormSubmit(handler) {
    this.form.addEventListener("submit", handler);
  }

  /**
   * Mengikat event click pada tombol "Test Notifikasi Lokal".
   * @param {Function} handler Handler event.
   */
  bindTestNotificationButtonClick(handler) {
    if (this.testNotificationBtn) {
      this.testNotificationBtn.addEventListener("click", handler);
    }
  }
  // --- Akhir metode baru ---

  /**
   * Mengembalikan nilai deskripsi dari input.
   * @returns {string} Deskripsi cerita.
   */
  getDescription() {
    return this.descriptionInput.value;
  }

  
  cleanup() {
    this.stopCamera(); // Hentikan kamera jika aktif
    if (this.mapInstance) {
      this.mapInstance.remove(); // Hapus instance peta
      this.mapInstance = null;
      console.log("AddStoryView: Map instance removed during cleanup.");
    }
   
  }
}

export default AddStoryView;
