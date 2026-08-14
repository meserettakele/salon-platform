// src/services/employeeBookingService.js

import api from "./api";

// =====================================================
// GET EMPLOYEE BOOKINGS
// =====================================================

export const getEmployeeBookings = async (status = "") => {
  const params = status ? { status } : {};
  const res = await api.get("/employee/bookings", { params });
  return res?.data !== undefined ? res.data : res;
};

// =====================================================
// ACCEPT BOOKING
// =====================================================

export const acceptEmployeeBooking = async (bookingId) => {
  const res = await api.patch(`/employee/bookings/${bookingId}/accept`);
  return res?.data !== undefined ? res.data : res;
};

// =====================================================
// REJECT BOOKING
// =====================================================

export const rejectEmployeeBooking = async (bookingId, reason) => {
  const res = await api.patch(`/employee/bookings/${bookingId}/reject`, {
    reason,
  });
  return res?.data !== undefined ? res.data : res;
};

// =====================================================
// COMPLETE APPOINTMENT
// =====================================================

export const completeEmployeeBooking = async (bookingId) => {
  const res = await api.patch(`/employee/bookings/${bookingId}/complete`);
  return res?.data !== undefined ? res.data : res;
};

export default {
  getEmployeeBookings,
  acceptEmployeeBooking,
  rejectEmployeeBooking,
  completeEmployeeBooking,
};
