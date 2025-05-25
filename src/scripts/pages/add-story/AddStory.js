import { addStory, dataURLtoBlob } from "../../data/api";
import { redirectIfNotAuthenticated } from "../../utils/auth.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default class AddStory {
  async render() {
    redirectIfNotAuthenticated();
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
              <button type="button" id="upload-btn" class="source-btn active">📁 Upload File</button>
              <button type="button" id="camera-btn" class="source-btn">📷 Kamera</button>
            </div>

            <div class="image-upload-container" id="file-upload-container">
              <input type="file" id="image-file" name="image" accept="image/*" />
              <div class="image-preview" id="image-preview"></div>
            </div>

            <div class="camera-container" id="camera-container">
              <video id="camera-preview" autoplay playsinline></video>
              <div class="form-group">
                <label for="camera-select">Pilih Kamera:</label>
                <select id="camera-select" class="camera-select"></select>
              </div>
              <div class="camera-controls">
                <button type="button" id="capture-btn" class="btn-capture">📸 Ambil Foto</button>
                <button type="button" id="switch-camera" class="btn-switch">🔁 Ganti Kamera</button>
                <button type="button" id="cancel-camera" class="btn-cancel">❌ Batal</button>
              </div>
              <canvas id="camera-canvas"></canvas>
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

  async afterRender() {
    // Initialize variables
    let stream = null;
    let currentDeviceId = null;
    const video = document.getElementById("camera-preview");
    const select = document.getElementById("camera-select");
    const fileInput = document.getElementById("image-file");
    const imagePreview = document.getElementById("image-preview");

    // Helper functions
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
        video.srcObject = null;
      }
    };

    const resetImagePreview = () => {
      imagePreview.innerHTML = "";
      document.getElementById("camera-image").value = "";
    };

    // Upload File Mode
    const initUploadMode = () => {
      stopCamera();
      document.getElementById("file-upload-container").style.display = "block";
      document.getElementById("camera-container").style.display = "none";
      document.getElementById("upload-btn").classList.add("active");
      document.getElementById("camera-btn").classList.remove("active");
      fileInput.value = "";
    };

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Hanya file gambar yang diizinkan!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.innerHTML = `
  <img src="${event.target.result}" 
       alt="Preview Gambar" 
       class="preview-image">
`;
      };
      reader.readAsDataURL(file);
    });

    // Camera Mode
    const initCameraMode = async () => {
      stopCamera();
      document.getElementById("file-upload-container").style.display = "none";
      document.getElementById("camera-container").style.display = "block";
      document.getElementById("camera-btn").classList.add("active");
      document.getElementById("upload-btn").classList.remove("active");
      await getCameras();
    };

    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        select.innerHTML = "";
        videoDevices.forEach((device, index) => {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.text = device.label || `Kamera ${index + 1}`;
          select.appendChild(option);
        });

        if (videoDevices.length > 0) {
          currentDeviceId = videoDevices[0].deviceId;
          await startCamera(currentDeviceId);
        }
      } catch (error) {
        console.error("Error accessing cameras:", error);
        alert("Tidak dapat mengakses kamera. Pastikan izin sudah diberikan.");
      }
    };

    const startCamera = async (deviceId) => {
      stopCamera();
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // Remove facingMode unless you specifically want rear camera
          },
        });
        video.srcObject = stream;

        // Add this to handle camera orientation
        video.style.transform = "";

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        });
      } catch (error) {
        console.error("Failed to start camera:", error);
        alert(`Gagal mengakses kamera: ${error.message}`);
      }
    };
    // Event Listeners
    document
      .getElementById("upload-btn")
      .addEventListener("click", initUploadMode);
    document
      .getElementById("camera-btn")
      .addEventListener("click", initCameraMode);
    document.getElementById("cancel-camera").addEventListener("click", () => {
      stopCamera();
      initUploadMode();
      resetImagePreview();
    });

    select.addEventListener("change", async (e) => {
      currentDeviceId = e.target.value;
      await startCamera(currentDeviceId);
    });

    document
      .getElementById("switch-camera")
      .addEventListener("click", async () => {
        const options = Array.from(select.options);
        const currentIndex = options.findIndex(
          (opt) => opt.value === currentDeviceId
        );
        const nextIndex = (currentIndex + 1) % options.length;
        currentDeviceId = options[nextIndex].value;
        select.value = currentDeviceId;
        await startCamera(currentDeviceId);
      });

    document
      .getElementById("capture-btn")
      .addEventListener("click", async () => {
        if (!stream || video.readyState !== video.HAVE_ENOUGH_DATA) {
          alert("Kamera belum siap mengambil gambar!");
          return;
        }

        const canvas = document.getElementById("camera-canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Check if this is a front-facing camera (mirrored)
        const isFrontCamera =
          select.selectedOptions[0]?.text.includes("front") ||
          select.selectedOptions[0]?.text.includes("depan") ||
          video.srcObject?.getVideoTracks()[0]?.getSettings().facingMode ===
            "user";

        if (isFrontCamera) {
          // Flip horizontally for front camera
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Reset transform if applied
        if (isFrontCamera) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        const imageDataURL = canvas.toDataURL("image/png");

        if (imageDataURL === "data:,") {
          alert("Gagal mengambil foto. Coba lagi!");
          return;
        }

        document.getElementById("camera-image").value = imageDataURL;
        imagePreview.innerHTML = `<img src="${imageDataURL}" alt="Foto Kamera" class="preview-image">`;
        stopCamera();
      });
    // Initialize Map
    const initMap = () => {
      const map = L.map("map").setView([-6.2, 106.8], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const blueMarker = L.divIcon({
        className: "custom-marker",
        html: '<div style="color:#3b82f6;font-size:24px;">📍</div>',
        iconSize: [32, 32],
        popupAnchor: [0, -16],
      });

      let marker = null;
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (!marker) {
          marker = L.marker([lat, lng], { icon: blueMarker }).addTo(map);
        } else {
          marker.setLatLng([lat, lng]);
        }
        marker
          .bindPopup(`Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          .openPopup();
        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;
        document.getElementById(
          "coordinates-display"
        ).textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      });

      setTimeout(() => map.invalidateSize(), 100);
    };

    // Form Submission
    document
      .getElementById("add-story-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Anda harus login terlebih dahulu");

          const formData = new FormData();
          formData.append(
            "description",
            document.getElementById("description").value
          );

          // Handle image upload
          let imageAdded = false;

          // Check camera image first
          const cameraImage = document.getElementById("camera-image").value;
          if (cameraImage && cameraImage.startsWith("data:image")) {
            const blob = dataURLtoBlob(cameraImage);
            formData.append("photo", blob, "photo.jpg"); // Changed from "image" to "photo"
            imageAdded = true;
          }
          // Then check file upload
          else {
            const file = fileInput.files[0];
            if (file) {
              formData.append("photo", file); // Changed from "image" to "photo"
              imageAdded = true;
            }
          }

          if (!imageAdded) {
            throw new Error("Silakan tambahkan gambar");
          }

          const lat = document.getElementById("latitude").value;
          const lng = document.getElementById("longitude").value;
          if (!lat || !lng) throw new Error("Silakan pilih lokasi di peta");
          formData.append("lat", lat);
          formData.append("lon", lng);

          const result = await addStory(formData, token);
          alert("Cerita berhasil ditambahkan!");
          e.target.reset();
          resetImagePreview();
          document.getElementById("coordinates-display").textContent =
            "Belum dipilih";
          initUploadMode();
        } catch (error) {
          console.error("Error:", error);
          alert(error.message || "Gagal menambahkan cerita");
        }
      });

    // Initialize
    initUploadMode();
    initMap();
  }
}
