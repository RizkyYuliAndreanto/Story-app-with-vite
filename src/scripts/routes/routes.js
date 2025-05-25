import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import AddStory from '../pages/add-story/AddStory';
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/addstory': new AddStory(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;
