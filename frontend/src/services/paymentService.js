// src/services/paymentService.js
import api from "./api"; // or your configured axios instance

export const paymentService = {
  processPayment: async (bookingId, paymentData) => {
    try {
      const response = await api.post(`/payments/${bookingId}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Payment processing failed." };
    }
  },

  getPaymentDetails: async (bookingId) => {
    try {
      const response = await api.get(`/payments/${bookingId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch payment details." }
      );
    }
  },
  getOwnerTransactions: async () => {
    try {
      const response = await api.get("/owner/transactions");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch transactions.",
        }
      );
    }
  },
};

export default paymentService;
