import axios from "axios";

// Base API Configuration matching Express app.js
const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Interceptor to attach JWT Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const salonService = {
  /**
   * Fetches list of salons with optional filters
   * Cleans up params like categoryId = "All" to prevent Sequelize query errors
   */
  getAllSalons: async (params = {}) => {
    const cleanParams = { ...params };

    // Strip out categoryId if it equals "All" or empty string
    if (cleanParams.categoryId === "All" || !cleanParams.categoryId) {
      delete cleanParams.categoryId;
    }

    const response = await API.get("/customer/salons", { params: cleanParams });
    return response.data?.data || [];
  },

  /**
   * Fetches single salon catalog (services, business hours, staff, reviews)
   */
  getSalonById: async (id) => {
    const response = await API.get(`/customer/salons/${id}`);
    return response.data?.data;
  },

  /**
   * Fetches category list for filtering
   */
  getCategories: async () => {
    const response = await API.get("/customer/categories");
    return response.data?.data || [];
  },

  /**
   * Submits a new booking request
   */
  createBooking: async (bookingData) => {
    const response = await API.post("/customer/bookings", bookingData);
    return response.data;
  },

  /**
   * Fetches customer appointments ('current' or 'history')
   */
  getUserBookings: async (type = "current") => {
    const response = await API.get("/customer/bookings", {
      params: { type },
    });
    return response.data?.data || [];
  },

  /**
   * Cancels an appointment request
   */
  cancelBooking: async (bookingId) => {
    const response = await API.put(`/customer/bookings/${bookingId}/cancel`);
    return response.data;
  },
};

export default salonService;
