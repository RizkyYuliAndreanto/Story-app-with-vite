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
  "/": HomePage, 
  "/about": AboutPage, 
  "/addstory": AddStory,
  "/login": LoginPage, 
  "/register": RegisterPage, 
  "/not-found": NotFoundPage, 
  "/bookmark": BookmarkPage, 
  "/stories/:id": DetailStoryPage, 
};

export default routes;
