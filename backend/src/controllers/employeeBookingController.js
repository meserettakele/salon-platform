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
    const { Salon, Employee, Service } = require("../models");
    const salon = appointment.salonId ? await Salon.findByPk(appointment.salonId) : null;
    const service = appointment.serviceId ? await Service.findByPk(appointment.serviceId) : null;
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const staffName = employee?.name || req.user.fullName || "Specialist";
    const srvName = service?.name || "Service";

    // 1. 🔔 Notify Customer (In-app + Telegram)
    if (customerId) {
      await createNotification({
        userId: customerId,
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

    // 2. 🔔 Notify Salon Owner in their dashboard bell
    if (salon?.ownerId) {
      await createNotification({
        userId: salon.ownerId,
        title: "Staff Accepted Booking",
        message: `Specialist ${staffName} accepted booking #${appointment.id} for ${srvName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
        type: "BOOKING_ACCEPTED",
        bookingId: appointment.id,
      }).catch((err) => console.warn("Failed to notify owner on staff accept:", err.message));
    }

    // 3. 🔔 In-app bell record for Employee themselves
    await createNotification({
      userId: req.user.id,
      title: "Booking Accepted",
      message: `You accepted booking #${appointment.id} for ${srvName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
      type: "BOOKING_ACCEPTED",
      bookingId: appointment.id,
    }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));

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
    const displayReason = reason?.trim() || "Declined by specialist";

    const appointment = await employeeBookingService.rejectBooking(
      req.user.id,
      req.params.id,
      displayReason,
    );

    const customerId = appointment.customerId;
    const { Salon, Employee, Service } = require("../models");
    const salon = appointment.salonId ? await Salon.findByPk(appointment.salonId) : null;
    const service = appointment.serviceId ? await Service.findByPk(appointment.serviceId) : null;
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const staffName = employee?.name || req.user.fullName || "Specialist";
    const srvName = service?.name || "Service";

    // 1. 🔔 Notify Customer (In-app + Telegram)
    if (customerId) {
      await createNotification({
        userId: customerId,
        title: "Booking Rejected",
        message: `Your booking request was rejected by the specialist. Reason: ${displayReason}`,
        type: "BOOKING_REJECTED",
        bookingId: appointment.id,
        rejectionReason: displayReason,
      });
    }

    // 2. 🔔 Notify Salon Owner in their dashboard bell
    if (salon?.ownerId) {
      await createNotification({
        userId: salon.ownerId,
        title: "Staff Rejected Booking",
        message: `Specialist ${staffName} rejected booking #${appointment.id} for ${srvName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}. Reason: ${displayReason}`,
        type: "BOOKING_REJECTED",
        bookingId: appointment.id,
        rejectionReason: displayReason,
      }).catch((err) => console.warn("Failed to notify owner on staff reject:", err.message));
    }

    // 3. 🔔 In-app bell record for Employee themselves
    await createNotification({
      userId: req.user.id,
      title: "Booking Rejected",
      message: `You rejected booking #${appointment.id} for ${srvName}. Reason: ${displayReason}`,
      type: "BOOKING_REJECTED",
      bookingId: appointment.id,
      rejectionReason: displayReason,
    }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));

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
    const { Salon, Employee, Service } = require("../models");
    const salon = appointment.salonId ? await Salon.findByPk(appointment.salonId) : null;
    const service = appointment.serviceId ? await Service.findByPk(appointment.serviceId) : null;
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const staffName = employee?.name || req.user.fullName || "Specialist";
    const srvName = service?.name || "Service";

    // 1. 🔔 Notify Customer (In-app + Telegram)
    if (customerId) {
      await createNotification({
        userId: customerId,
        title: "Appointment Completed",
        message: "Your appointment has been completed.",
        type: "APPOINTMENT_COMPLETED",
        bookingId: appointment.id,
      });
    }

    // 2. 🔔 Notify Salon Owner in their dashboard bell
    if (salon?.ownerId) {
      await createNotification({
        userId: salon.ownerId,
        title: "Appointment Completed by Staff",
        message: `Specialist ${staffName} completed appointment #${appointment.id} for ${srvName}.`,
        type: "APPOINTMENT_COMPLETED",
        bookingId: appointment.id,
      }).catch((err) => console.warn("Failed to notify owner on staff completion:", err.message));
    }

    // 3. 🔔 In-app bell record for Employee themselves
    await createNotification({
      userId: req.user.id,
      title: "Appointment Completed",
      message: `You marked appointment #${appointment.id} for ${srvName} as completed.`,
      type: "APPOINTMENT_COMPLETED",
      bookingId: appointment.id,
    }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));

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
