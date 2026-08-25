import API from "./api";

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
    return Array.isArray(response) ? response : response?.data || [];
  },

  /**
   * Fetches single salon catalog (services, business hours, staff, reviews)
   */
  getSalonById: async (id) => {
    const response = await API.get(`/customer/salons/${id}`);
    return response?.data || response;
  },

  /**
   * Fetches category list for filtering
   */
  getCategories: async () => {
    const response = await API.get("/customer/categories");
    return Array.isArray(response) ? response : response?.data || [];
  },

  /**
   * Submits a new booking request
   */
  createBooking: async (bookingData) => {
    return await API.post("/customer/bookings", bookingData);
  },

  /**
   * Fetches customer appointments ('current' or 'history')
   */
  getUserBookings: async (type = "current") => {
    const response = await API.get("/customer/bookings", {
      params: { type },
    });
    return Array.isArray(response) ? response : response?.data || [];
  },

  /**
   * Cancels an appointment request
   */
  cancelBooking: async (bookingId) => {
    return await API.put(`/customer/bookings/${bookingId}/cancel`);
  },
};

export default salonService;
