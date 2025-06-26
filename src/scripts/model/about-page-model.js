// src/scripts/model/about-page-model.js
import { getAuthUser } from "../utils/auth.js"; //

class AboutPageModel {
  getUserData() {
    return getAuthUser(); //
  }
}

export default AboutPageModel;
