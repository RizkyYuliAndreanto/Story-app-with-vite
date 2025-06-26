// src/pages/auth/login-page-model.js
import { loginUser } from "../data/api.js";
import { setAuthData } from "../utils/auth.js";

class LoginPageModel {
  async login(email, password) {
    try {
      const result = await loginUser({ email, password });
      if (!result.loginResult?.token) {
        throw new Error(result.message || "Autentikasi gagal");
      }
      setAuthData(result.loginResult.token, {
        id: result.loginResult.userId,
        name: result.loginResult.name,
        email: email,
      });
      return true; 
    } catch (error) {
      console.error("Login model error:", error);
      throw error; 
    }
  }
}

export default LoginPageModel;
