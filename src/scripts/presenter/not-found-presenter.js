// src/presenter/not-found-presenter.js
import NotFoundView from "../view/not-found-view"; // Perhatikan 'view' singular

class NotFoundPresenter {
  constructor() {
    this._view = new NotFoundView();
  }

  async render() {
    return this._view.getTemplate();
  }

  async afterRender() {
    // Logika setelah render jika diperlukan
    console.log("Not Found Presenter afterRender");
  }
}

export default NotFoundPresenter;
