// src/pages/not-found/not-found-page.js
import NotFoundView from "../../view/not-found-view";

class NotFoundPage {
  constructor() {
    this._view = new NotFoundView();
  }

  async render() {
    return this._view.getTemplate();
  }

  async afterRender() {
    // Logic after render if needed
    console.log("Not Found Page rendered");
  }
}

export default NotFoundPage;
