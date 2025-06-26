
import { registerUser } from "../data/api.js"; //

class RegisterPageModel {
  async register(userData) {
    try {
      const result = await registerUser(userData); //
      if (result.error) {
        throw new Error(result.message || "Registrasi gagal"); //
      }
      return true; // Indicate success
    } catch (error) {
      console.error("Register model error:", error);
      throw error;
    }
  }
}

export default RegisterPageModel;
