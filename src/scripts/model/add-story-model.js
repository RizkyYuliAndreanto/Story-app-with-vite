// src/scripts/model/add-story-model.js
import { addStory, dataURLtoBlob } from "../data/api.js";

class AddStoryModel {
  constructor() {
    this.currentImageBlob = null; 
  }

  
  convertDataURLtoBlob(dataURL) {
    return dataURLtoBlob(dataURL);
  }

  
  async submitStory(description, latitude, longitude, token) {
    const formData = new FormData();
    formData.append("description", description);

    
    if (this.currentImageBlob) {
      formData.append("photo", this.currentImageBlob, "photo.jpg");
    } else {
      throw new Error("Silakan tambahkan gambar");
    }

    
    if (!latitude || !longitude) {
      throw new Error("Silakan pilih lokasi di peta");
    }
    formData.append("lat", latitude);
    formData.append("lon", longitude);

    const result = await addStory(formData, token);
    return result;
  }

 
  setCurrentImageBlob(blob) {
    this.currentImageBlob = blob;
  }


  clearCurrentImageBlob() {
    this.currentImageBlob = null;
  }
}

export default AddStoryModel;
