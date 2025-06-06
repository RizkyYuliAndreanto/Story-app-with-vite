// src/scripts/presenter/add-story-presenter.js
import { redirectIfNotAuthenticated, getAuthToken } from "../utils/auth.js";
import AddStoryModel from "../model/add-story-model.js";
import AddStoryView from "../view/add-story-view.js";

class AddStoryPresenter {
  constructor() {
    this.model = new AddStoryModel();
    this.view = new AddStoryView();
    this.currentDeviceId = null;
  }

  async render() {
    // Memastikan pengguna terautentikasi sebelum merender
    redirectIfNotAuthenticated();
    return this.view.render();
  }

  async afterRender() {
    // Mendapatkan semua elemen DOM yang diperlukan oleh View
    this.view.getElements();

    // Mengikat semua event listener dari View ke method Presenter
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

    // Menginisialisasi peta dan menampilkan mode upload default
    this.view.initMap(this._onMapClick.bind(this));
    this.view.showUploadMode();

    // Menambahkan event listener global untuk mengontrol kamera
    window.addEventListener("beforeunload", this._handlePageUnload.bind(this));
    document.addEventListener(
      "visibilitychange",
      this._handleVisibilityChange.bind(this)
    );
  }

  // Handler untuk event beforeunload (saat pengguna meninggalkan halaman)
  _handlePageUnload() {
    this.view.stopCamera();
    console.log("Kamera dimatikan: Halaman akan di-unload.");
  }

  // Handler untuk event visibilitychange (saat tab beralih fokus)
  _handleVisibilityChange() {
    if (document.hidden) {
      // Jika dokumen tidak terlihat
      this.view.stopCamera();
      console.log("Kamera dimatikan: Tab tidak aktif.");
    }
  }

  // Menginisialisasi kamera, termasuk permintaan izin dan penemuan perangkat
  async _initializeCamera() {
    try {
      // Memeriksa status izin kamera
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

      // Memilih kamera default jika belum ada yang dipilih atau perangkat tidak lagi tersedia
      if (
        !this.currentDeviceId ||
        !videoDevices.some((d) => d.deviceId === this.currentDeviceId)
      ) {
        this.currentDeviceId = videoDevices[0].deviceId;
      }

      // Memulai streaming kamera
      const success = await this.view.startCameraStream(this.currentDeviceId);
      if (!success) {
        throw new Error("Gagal memulai streaming kamera.");
      }
      this.view.hideCameraPermissionError(); // Sembunyikan pesan error jika berhasil
    } catch (error) {
      console.error("Error initializing camera:", error);
      this.view.showCameraPermissionError(); // Tampilkan pesan error izin kamera
      alert(`Error Kamera: ${error.message}`);
      this.view.showUploadMode(); // Kembali ke mode upload jika ada masalah kamera
    }
  }

  // Handler untuk klik tombol 'Upload File'
  _onUploadButtonClick() {
    this.view.showUploadMode();
    this.model.clearCurrentImageBlob(); // Bersihkan Blob gambar saat ini
  }

  // Handler untuk klik tombol 'Kamera'
  async _onCameraButtonClick() {
    this.view.showCameraMode();
    this.model.clearCurrentImageBlob();
    await this._initializeCamera(); // Inisialisasi kamera saat mode kamera dipilih
  }

  // Handler untuk klik tombol 'Batal' di mode kamera
  _onCancelCameraButtonClick() {
    this.view.showUploadMode();
    this.model.clearCurrentImageBlob();
  }

  // Handler untuk perubahan pilihan kamera
  async _onCameraSelectChange(e) {
    this.currentDeviceId = e.target.value;
    await this.view.startCameraStream(this.currentDeviceId);
  }

  // Handler untuk klik tombol 'Ganti Kamera'
  async _onSwitchCameraButtonClick() {
    const options = Array.from(this.view.cameraSelect.options);
    const currentIndex = options.findIndex(
      (opt) => opt.value === this.currentDeviceId
    );
    const nextIndex = (currentIndex + 1) % options.length;
    this.currentDeviceId = options[nextIndex].value;
    this.view.cameraSelect.value = this.currentDeviceId; // Perbarui elemen select di View
    await this.view.startCameraStream(this.currentDeviceId);
  }

  // Handler untuk klik tombol 'Ambil Foto'
  _onCaptureButtonClick() {
    const imageDataURL = this.view.captureImage();
    if (imageDataURL) {
      const blob = this.model.convertDataURLtoBlob(imageDataURL);
      this.model.setCurrentImageBlob(blob); // Simpan Blob ke Model
    }
  }

  // Handler untuk perubahan input file
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
      this.model.setCurrentImageBlob(blob); // Simpan Blob ke Model
    };
    reader.readAsDataURL(file);
  }

  // Handler untuk klik pada peta (jika ada logika khusus yang diperlukan)
  _onMapClick(lat, lng) {
    // Koordinat sudah diupdate di View; jika ada logika Presenter yang perlu tahu, bisa ditambahkan di sini.
  }

  // Handler untuk submit form
  async _onFormSubmit(e) {
    e.preventDefault();
    this.view.setSubmitButtonLoading(true); // Tampilkan loading

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Anda harus login terlebih dahulu");

      const description = this.view.getDescription();
      const latitude = this.view.getLatitude();
      const longitude = this.view.getLongitude();

      // Validasi input
      if (!description.trim()) {
        throw new Error("Deskripsi tidak boleh kosong.");
      }

      // Memanggil Model untuk mengirim cerita
      await this.model.submitStory(description, latitude, longitude, token);

      alert("Cerita berhasil ditambahkan!");
      this.view.resetFormAndDisplay(); // Reset form dan tampilan setelah berhasil
    } catch (error) {
      console.error("Error submitting story:", error);
      alert(error.message || "Gagal menambahkan cerita");
    } finally {
      this.view.setSubmitButtonLoading(false); // Sembunyikan loading
    }
  }

  // Metode pembersihan saat presenter tidak lagi aktif (untuk router)
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
    console.log(
      "Cleanup AddStoryPresenter: Kamera dan event listener dimatikan."
    );
  }
}

export default AddStoryPresenter;
