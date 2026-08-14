// src/services/authService.js
import API from "./api";

export const authService = {
  login: (phone, password) => API.post("/auth/login", { phone, password }),
  register: (userData) => API.post("/auth/register", userData),
};
