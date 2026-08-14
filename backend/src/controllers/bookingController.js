const bookingService = require("../services/bookingService");
const createNotification = require("../utils/createNotification");

// Owner views bookings
exports.viewBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const bookings = await bookingService.getBookingRequests(
      req.user.id,
      status,
    );

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: bookings,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// Owner accepts booking
exports.acceptBooking = async (req, res) => {
  try {
    // Pass status matching your database convention ('accepted' or 'ACCEPTED')
    const appointment = await bookingService.updateBookingStatus(
      req.user.id,
      req.params.id,
      "ACCEPTED",
    );

    const targetCustomerId = appointment?.customerId || appointment?.userId;

    if (targetCustomerId) {
      // 🔔 TRIGGER NOTIFICATION 1: BOOKING ACCEPTED
      await createNotification({
        userId: targetCustomerId,
        title: "Booking Accepted",
        message: "Your appointment has been accepted.",
        type: "BOOKING_ACCEPTED",
        bookingId: appointment.id,
      });

      // 🔔 TRIGGER NOTIFICATION 2: PAYMENT REQUIRED
      await createNotification({
        userId: targetCustomerId,
        title: "Payment Required",
        message:
          "Your appointment is accepted. Complete payment to confirm your appointment.",
        type: "PAYMENT_REQUIRED",
        bookingId: appointment.id,
      });
    } else {
      console.warn(
        "⚠️ Could not trigger notification: customerId is undefined in acceptBooking",
      );
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

// Owner rejects booking
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const appointment = await bookingService.updateBookingStatus(
      req.user.id,
      req.params.id,
      "REJECTED",
    );

    const targetCustomerId = appointment?.customerId || appointment?.userId;

    if (targetCustomerId) {
      // 🔔 TRIGGER NOTIFICATION: BOOKING REJECTED
      await createNotification({
        userId: targetCustomerId,
        title: "Booking Rejected",
        message: reason || "Your booking request was rejected by the salon.",
        type: "BOOKING_REJECTED",
        bookingId: appointment.id,
        rejectionReason: reason || null,
      });
    } else {
      console.warn(
        "⚠️ Could not trigger notification: customerId is undefined in rejectBooking",
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully.",
      data: appointment,
    });
  } catch (err) {
    console.error("REJECT BOOKING ERROR:", err);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// Owner completes appointment
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await bookingService.updateBookingStatus(
      req.user.id,
      req.params.id,
      "COMPLETED",
    );

    const targetCustomerId = appointment?.customerId || appointment?.userId;

    if (targetCustomerId) {
      // 🔔 TRIGGER NOTIFICATION: APPOINTMENT COMPLETED
      await createNotification({
        userId: targetCustomerId,
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
