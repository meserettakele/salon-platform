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
    const { Employee, Service } = require("../models");
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const service = appointment.serviceId ? await Service.findByPk(appointment.serviceId) : null;
    const srvName = service?.name || "Service";

    // 1. 🔔 Notify Customer
    if (targetCustomerId) {
      // 🔔 TRIGGER UNIFIED NOTIFICATION: BOOKING ACCEPTED & PAYMENT REQUIRED
      await createNotification({
        userId: targetCustomerId,
        title: "Booking Accepted - Payment Required",
        message:
          "Your appointment is accepted. Complete payment to confirm your appointment.",
        type: "BOOKING_ACCEPTED",
        bookingId: appointment.id,
      });

      try {
        const { notifyBookingAccepted } = require("../services/telegramService");
        notifyBookingAccepted(appointment.id);
      } catch (tgErr) {
        console.warn("Telegram notifyBookingAccepted skip:", tgErr.message);
      }
    }

    // 2. 🔔 Notify Assigned Employee in their dashboard bell
    if (employee?.userId) {
      await createNotification({
        userId: employee.userId,
        title: "Booking Accepted by Owner",
        message: `Owner accepted booking #${appointment.id} for ${srvName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} assigned to you.`,
        type: "BOOKING_ACCEPTED",
        bookingId: appointment.id,
      }).catch((err) => console.warn("Failed to notify employee on owner accept:", err.message));
    }

    // 3. 🔔 In-app bell record for Owner themselves
    await createNotification({
      userId: req.user.id,
      title: "Booking Accepted",
      message: `You accepted booking #${appointment.id} for ${srvName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
      type: "BOOKING_ACCEPTED",
      bookingId: appointment.id,
    }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));

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
    const displayReason = reason?.trim() || "Declined by salon";

    const appointment = await bookingService.updateBookingStatus(
      req.user.id,
      req.params.id,
      "REJECTED",
      displayReason,
    );

    const targetCustomerId = appointment?.customerId || appointment?.userId;
    const { Employee, Service } = require("../models");
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const service = appointment.serviceId ? await Service.findByPk(appointment.serviceId) : null;
    const srvName = service?.name || "Service";

    // 1. 🔔 Notify Customer
    if (targetCustomerId) {
      // 🔔 TRIGGER NOTIFICATION: BOOKING REJECTED
      await createNotification({
        userId: targetCustomerId,
        title: "Booking Rejected",
        message: `Your booking request was rejected by the salon. Reason: ${displayReason}`,
        type: "BOOKING_REJECTED",
        bookingId: appointment.id,
        rejectionReason: displayReason,
      });
    }

    // 2. 🔔 Notify Assigned Employee in their dashboard bell
    if (employee?.userId) {
      await createNotification({
        userId: employee.userId,
        title: "Booking Rejected by Owner",
        message: `Owner rejected booking #${appointment.id} for ${srvName} on ${appointment.appointmentDate}. Reason: ${displayReason}`,
        type: "BOOKING_REJECTED",
        bookingId: appointment.id,
        rejectionReason: displayReason,
      }).catch((err) => console.warn("Failed to notify employee on owner reject:", err.message));
    }

    // 3. 🔔 In-app bell record for Owner themselves
    await createNotification({
      userId: req.user.id,
      title: "Booking Rejected",
      message: `You rejected booking #${appointment.id} for ${srvName}. Reason: ${displayReason}`,
      type: "BOOKING_REJECTED",
      bookingId: appointment.id,
      rejectionReason: displayReason,
    }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));

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
    const { Employee, Service } = require("../models");
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const service = appointment.serviceId ? await Service.findByPk(appointment.serviceId) : null;
    const srvName = service?.name || "Service";

    // 1. 🔔 Notify Customer
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

    // 2. 🔔 Notify Assigned Employee in their dashboard bell
    if (employee?.userId) {
      await createNotification({
        userId: employee.userId,
        title: "Appointment Completed by Owner",
        message: `Owner marked appointment #${appointment.id} for ${srvName} as completed.`,
        type: "APPOINTMENT_COMPLETED",
        bookingId: appointment.id,
      }).catch((err) => console.warn("Failed to notify employee on owner completion:", err.message));
    }

    // 3. 🔔 In-app bell record for Owner themselves
    await createNotification({
      userId: req.user.id,
      title: "Appointment Completed",
      message: `You marked appointment #${appointment.id} for ${srvName} as completed.`,
      type: "APPOINTMENT_COMPLETED",
      bookingId: appointment.id,
    }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));

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
