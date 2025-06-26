// src/scripts/presenter/add-story-presenter.js
import { redirectIfNotAuthenticated, getAuthToken } from "../utils/auth.js";
import AddStoryModel from "../model/add-story-model.js";
import AddStoryView from "../view/add-story-view.js";
import NotificationHelper from "../utils/notification.js";

class AddStoryPresenter {
  constructor() {
    this.model = new AddStoryModel();
    this.view = new AddStoryView();
    this.currentDeviceId = null;
    this.notificationHelper = new NotificationHelper();

    window.addEventListener("beforeunload", this._handlePageUnload.bind(this));
    document.addEventListener(
      "visibilitychange",
      this._handleVisibilityChange.bind(this)
    );
  }

  async render() {
    redirectIfNotAuthenticated();
    return this.view.render();
  }

  async afterRender() {
    this.view.getElements();

    this.view.bindUploadButtonClick(this._onUploadButtonClick.bind(this));
    this.view.bindCameraButtonClick(this._onCameraButtonClick.bind(this));
    this.view.bindCancelCameraButtonClick(
      this._onCancelCameraButtonClick.bind(this)
    );
    this.view.bindCameraSelectChange(this._onCameraSelectChange.bind(this));
    this.view.bindSwitchCameraButtonClick(
      this._onSwitchCameraButtonClick.bind(this)
    );
    this.view.bindCaptureButtonClick(this._onCaptureButtonClick.bind(this));
    this.view.bindFileInputChange(this._onFileInputChange.bind(this));
    this.view.bindFormSubmit(this._onFormSubmit.bind(this));
    // REMOVED: this.view.bindTestNotificationButtonClick(this._onTestNotificationClick.bind(this));

    this.view.initMap(this._onMapClick.bind(this));
    this.view.showUploadMode();

    if (window.feather) feather.replace();
  }

  _handlePageUnload() {
    this.view.stopCamera();
    console.log("Kamera dimatikan: Halaman akan di-unload.");
  }

  _handleVisibilityChange() {
    if (document.hidden) {
      this.view.stopCamera();
      console.log("Kamera dimatikan: Tab tidak aktif.");
    }
  }

  async _initializeCamera() {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "camera",
      });
      if (permissionStatus.state === "denied") {
        throw new Error(
          "Izin kamera ditolak. Harap izinkan akses kamera di pengaturan browser Anda."
        );
      }

      const videoDevices = await this.view.getAvailableCameras();
      if (videoDevices.length === 0) {
        throw new Error("Tidak ada kamera yang ditemukan.");
      }

      this.view.populateCameraSelect(videoDevices, this.currentDeviceId);

      if (
        !this.currentDeviceId ||
        !videoDevices.some((d) => d.deviceId === this.currentDeviceId)
      ) {
        this.currentDeviceId = videoDevices[0].deviceId;
      }

      const success = await this.view.startCameraStream(this.currentDeviceId);
      if (!success) {
        throw new Error("Gagal memulai streaming kamera.");
      }
      this.view.hideCameraPermissionError();
    } catch (error) {
      console.error("Error initializing camera:", error);
      this.view.showCameraPermissionError();
      alert(`Error Kamera: ${error.message}`);
      this.view.showUploadMode();
    }
  }

  _onUploadButtonClick() {
    this.view.showUploadMode();
    this.model.clearCurrentImageBlob();
  }

  async _onCameraButtonClick() {
    this.view.showCameraMode();
    this.model.clearCurrentImageBlob();
    await this._initializeCamera();
  }

  _onCancelCameraButtonClick() {
    this.view.showUploadMode();
    this.model.clearCurrentImageBlob();
  }

  async _onCameraSelectChange(e) {
    this.currentDeviceId = e.target.value;
    await this.view.startCameraStream(this.currentDeviceId);
  }

  async _onSwitchCameraButtonClick() {
    const options = Array.from(this.view.cameraSelect.options);
    const currentIndex = options.findIndex(
      (opt) => opt.value === this.currentDeviceId
    );
    const nextIndex = (currentIndex + 1) % options.length;
    this.currentDeviceId = options[nextIndex].value;
    this.view.cameraSelect.value = this.currentDeviceId;
    await this.view.startCameraStream(this.currentDeviceId);
  }

  _onCaptureButtonClick() {
    const imageDataURL = this.view.captureImage();
    if (imageDataURL) {
      const blob = this.model.convertDataURLtoBlob(imageDataURL);
      this.model.setCurrentImageBlob(blob);
    }
  }

  _onFileInputChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.view.displayImagePreview(event.target.result);
      const blob = this.model.convertDataURLtoBlob(event.target.result);
      this.model.setCurrentImageBlob(blob);
    };
    reader.readAsDataURL(file);
  }

  _onMapClick(lat, lng) {
    // Koordinat sudah diupdate di View; jika ada logika Presenter yang perlu tahu, bisa ditambahkan di sini.
  }

  async _onFormSubmit(e) {
    e.preventDefault();
    this.view.setSubmitButtonLoading(true);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Anda harus login terlebih dahulu");

      const description = this.view.getDescription();
      const latitude = this.view.getLatitude();
      const longitude = this.view.getLongitude();

      if (!description.trim()) {
        throw new Error("Deskripsi tidak boleh kosong.");
      }
      if (!this.model.currentImageBlob) {
        throw new Error("Silakan tambahkan gambar.");
      }
      if (
        latitude === null ||
        longitude === null ||
        latitude === "" ||
        longitude === ""
      ) {
        throw new Error("Silakan pilih lokasi di peta.");
      }

      const result = await this.model.submitStory(
        description,
        latitude,
        longitude,
        token
      );

      this.view.showSubmitResult(result);

      if (!result.error && Notification.permission === "granted") {
        new Notification("Cerita Berhasil Dibuat!", {
          body: `Anda telah menambahkan cerita baru dengan deskripsi: ${description.substring(
            0,
            50
          )}...`,
          icon: "/images/icon-icon-x192.png",
          tag: `story-${result.storyId || Date.now()}`,
          renotify: true,
          data: {
            url:
              window.location.origin +
              `/Story-app-with-vite/#/story/${result.storyId || ""}`,
          },
        });
        console.log("Notifikasi lokal cerita berhasil dibuat ditampilkan.");
      }
    } catch (error) {
      console.error("Error submitting story:", error);
      alert(error.message || "Gagal menambahkan cerita");
    } finally {
      this.view.setSubmitButtonLoading(false);
    }
  }

  // REMOVED: _onTestNotificationClick method and its functionality

  cleanup() {
    this.view.stopCamera();
    window.removeEventListener(
      "beforeunload",
      this._handlePageUnload.bind(this)
    );
    document.removeEventListener(
      "visibilitychange",
      this._handleVisibilityChange.bind(this)
    );
    if (typeof this.view.cleanup === "function") {
      this.view.cleanup();
    }
    console.log(
      "Cleanup AddStoryPresenter: Kamera dan event listener dimatikan."
    );
  }
}

export default AddStoryPresenter;
