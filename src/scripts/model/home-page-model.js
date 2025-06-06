import { allStories } from "../data/api";

class HomePageModel {
  async getStories(token) {
    try {
      const response = await allStories(token);
      if (
        !response ||
        !response.listStory ||
        !Array.isArray(response.listStory)
      ) {
        throw new Error("Format data tidak valid: " + JSON.stringify(response));
      }
      return response.listStory;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }
  }
}

export default HomePageModel;
