// src/scripts/presenter/about-page-presenter.js
import { redirectIfNotAuthenticated } from "../utils/auth.js"; //
import AboutPageModel from "../model/about-page-model.js";
import AboutPageView from "../view/about-page-view.js";

class AboutPagePresenter {
  constructor() {
    this.model = new AboutPageModel();
    this.view = new AboutPageView();
  }

  async render() {
    
    if (!redirectIfNotAuthenticated()) {
      return ""; 
    }

    const user = this.model.getUserData(); 
    const userName = user?.name || "Pengguna";

    return this.view.render(userName); 
  }

  async afterRender() {
    this.view.getElements(); 
    this.view.replaceFeatherIcons(); 
  }
}

export default AboutPagePresenter;
