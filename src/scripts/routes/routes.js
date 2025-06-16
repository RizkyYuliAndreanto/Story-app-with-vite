// src/scripts/routes/routes.js
import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import AddStory from "../pages/add-story/AddStory";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/notFound/not-found";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import DetailStoryPage from "../pages/detail-story/detail-story-page";

const routes = {
  "/": HomePage, // Kelas
  "/about": AboutPage, // Kelas
  "/addstory": AddStory, // Kelas
  "/login": LoginPage, // Kelas (Login/Register tidak dilindungi, jadi bisa diakses)
  "/register": RegisterPage, // Kelas
  "/not-found": NotFoundPage, // Kelas
  "/bookmark": BookmarkPage, // Kelas
  "/stories/:id": DetailStoryPage, // Kelas - Pastikan format ini konsisten dengan getRoute
};

export default routes;
