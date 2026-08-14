import api from "./api";

export const bookingService = {
  // Discovery & Salon Catalog
  getSalons: async (search = "", categoryId = "") => {
    const params = {};

    if (search && search.trim() !== "") params.search = search.trim();
    if (categoryId) params.categoryId = categoryId;

    return await api.get("/customer/salons", { params });
  },

  getSalonDetails: async (salonId) => {
    return await api.get(`/customer/salons/${salonId}`);
  },

  getCategories: async () => {
    return await api.get("/customer/categories");
  },

  // ==================== Booking Actions ====================

  // Create one or multiple bookings
  createBooking: async (bookingData) => {
    return await api.post("/customer/bookings", bookingData);
  },

  // Alias for createBooking to prevent "is not a function" errors
  // if any component calls createBookingRequest
  createBookingRequest: async (bookingData) => {
    return await api.post("/customer/bookings", bookingData);
  },

  // Get employees grouped by selected services
  getEmployeesByServices: async (salonId, serviceIds) => {
    return await api.get(`/customer/salons/${salonId}/employees-by-services`, {
      params: {
        serviceIds: serviceIds.join(","),
      },
    });
  },

  // Get duration-aware available time slots
  getAvailableSlots: async ({ appointmentDate, services }) => {
    return await api.get("/customer/bookings/available-slots", {
      params: {
        appointmentDate,
        services: JSON.stringify(services),
      },
    });
  },

  getCustomerBookings: async (params = {}) => {
    return await api.get("/customer/bookings", { params });
  },

  cancelBooking: async (bookingId, reason = "") => {
    return await api.patch(`/customer/bookings/${bookingId}/cancel`, {
      reason,
    });
  },
};

// Export customerService alias in case any legacy imports use customerService
export const customerService = bookingService;

export default bookingService;
