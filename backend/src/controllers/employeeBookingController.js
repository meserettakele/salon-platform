const employeeBookingService = require("../services/employeeBookingService");
const createNotification = require("../utils/createNotification");

// =====================================================
// EMPLOYEE VIEW BOOKINGS
// =====================================================

exports.viewEmployeeBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const bookings = await employeeBookingService.getEmployeeBookings(
      req.user.id,
      status,
    );

    return res.status(200).json({
      success: true,
      message: "Employee bookings fetched successfully.",
      data: bookings,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// EMPLOYEE ACCEPT BOOKING
// =====================================================

exports.acceptEmployeeBooking = async (req, res) => {
  try {
    const appointment = await employeeBookingService.acceptBooking(
      req.user.id,
      req.params.id,
    );

    const customerId = appointment.customerId;

    if (customerId) {
      await createNotification({
        userId: customerId,
        title: "Booking Accepted",
        message: "Your appointment has been accepted.",
        type: "BOOKING_ACCEPTED",
        bookingId: appointment.id,
      });

      await createNotification({
        userId: customerId,
        title: "Payment Required",
        message:
          "Your appointment is accepted. Complete payment to confirm your appointment.",
        type: "PAYMENT_REQUIRED",
        bookingId: appointment.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully.",
      data: appointment,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// EMPLOYEE REJECT BOOKING
// =====================================================

exports.rejectEmployeeBooking = async (req, res) => {
  try {
    const { reason } = req.body || {};

    const appointment = await employeeBookingService.rejectBooking(
      req.user.id,
      req.params.id,
      reason,
    );

    const customerId = appointment.customerId;

    if (customerId) {
      await createNotification({
        userId: customerId,
        title: "Booking Rejected",
        message: reason || "Your booking request was rejected by the employee.",
        type: "BOOKING_REJECTED",
        bookingId: appointment.id,
        rejectionReason: reason || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully.",
      data: appointment,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// EMPLOYEE COMPLETE APPOINTMENT
// =====================================================

exports.completeEmployeeBooking = async (req, res) => {
  try {
    const appointment = await employeeBookingService.completeAppointment(
      req.user.id,
      req.params.id,
    );

    const customerId = appointment.customerId;

    if (customerId) {
      await createNotification({
        userId: customerId,
        title: "Appointment Completed",
        message: "Your appointment has been completed.",
        type: "APPOINTMENT_COMPLETED",
        bookingId: appointment.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment completed successfully.",
      data: appointment,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
