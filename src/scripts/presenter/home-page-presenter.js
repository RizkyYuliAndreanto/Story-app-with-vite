// src/scripts/presenter/home-page-presenter.js
import { redirectIfNotAuthenticated, getAuthToken } from "../utils/auth.js";
import HomePageModel from "../model/home-page-model.js";
import HomePageView from "../view/home-page-view.js";

class HomePagePresenter {
  constructor() {
    this.model = new HomePageModel();
    this.view = new HomePageView();
  }

  async render() {
    if (!redirectIfNotAuthenticated()) return ""; 

    return this.view.render();
  }

  async afterRender() {
    try {
      this.view.showLoading();

      const token = getAuthToken();
      if (!token) {
        throw new Error("Anda perlu login terlebih dahulu"); 
      }

      const stories = await this.model.getStories(token); 
      this.view.renderStories(stories); 

      
      this.view.initMap(); 
      this.view.renderStoryLocations(stories); 
    } catch (error) {
      console.error("Error in HomePagePresenter:", error); 
      this.view.showError(error.message); 
    }
  }
}

export default HomePagePresenter;
