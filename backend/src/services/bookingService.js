const {
  Appointment,
  User,
  Service,
  Employee,
  Salon,
  Payment,
} = require("../models");

// =====================================================
// GET OWNER SALON
// =====================================================

const getSalonByOwner = async (ownerId) => {
  const salon = await Salon.findOne({
    where: { ownerId },
  });

  if (!salon) {
    const error = new Error(
      "No registered salon assigned to this owner account.",
    );

    error.statusCode = 404;
    throw error;
  }

  return salon;
};

// =====================================================
// OWNER VIEW BOOKINGS
// =====================================================

exports.getBookingRequests = async (ownerId, statusFilter) => {
  const salon = await getSalonByOwner(ownerId);

  const whereClause = {
    salonId: salon.id,
  };

  if (statusFilter) {
    const allowedStatuses = [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
    ];

    const status = statusFilter.toUpperCase();

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid booking status filter.");

      error.statusCode = 400;
      throw error;
    }

    whereClause.bookingStatus = status;
  }

  return await Appointment.findAll({
    where: whereClause,

    include: [
      {
        model: User,
        as: "customer",
        attributes: ["id", "fullName", "email", "phone"],
      },

      {
        model: Service,
        as: "service",
        attributes: ["id", "name", "price", "duration"],
      },

      {
        model: Employee,
        as: "employee",
        attributes: ["id", "name", "position"],
      },
      {
        model: Payment,
        as: "payment",
        attributes: ["id", "paymentStatus", "amount", "paymentMethod"],
      },
    ],

    order: [
      ["appointmentDate", "ASC"],
      ["appointmentTime", "ASC"],
    ],
  });
};

// =====================================================
// OWNER ACCEPT / REJECT / COMPLETE BOOKING
exports.updateBookingStatus = async (
  ownerId,
  appointmentId,
  newStatus,
  reason = null,
) => {
  const allowedStatuses = ["ACCEPTED", "REJECTED", "COMPLETED"];

  if (!allowedStatuses.includes(newStatus)) {
    const error = new Error("Invalid booking status update.");

    error.statusCode = 400;
    throw error;
  }

  const salon = await getSalonByOwner(ownerId);

  const appointment = await Appointment.findOne({
    where: {
      id: appointmentId,
      salonId: salon.id,
    },
  });

  if (!appointment) {
    const error = new Error("Appointment not found or unauthorized access.");

    error.statusCode = 404;
    throw error;
  }

  // ACCEPT
  if (newStatus === "ACCEPTED" && appointment.bookingStatus !== "PENDING") {
    const error = new Error("Only pending appointments can be accepted.");

    error.statusCode = 400;
    throw error;
  }

  // REJECT
  if (newStatus === "REJECTED" && appointment.bookingStatus !== "PENDING") {
    const error = new Error("Only pending appointments can be rejected.");

    error.statusCode = 400;
    throw error;
  }

  // COMPLETE
  if (newStatus === "COMPLETED") {
    if (
      appointment.bookingStatus !== "ACCEPTED" &&
      appointment.bookingStatus !== "CONFIRMED"
    ) {
      const error = new Error("Only accepted appointments can be completed.");
      error.statusCode = 400;
      throw error;
    }
  }

  appointment.bookingStatus = newStatus;

  if (newStatus === "ACCEPTED") {
    appointment.acceptedAt = new Date();
  }

  if (newStatus === "COMPLETED") {
    appointment.completedAt = new Date();
  }

  if (newStatus === "REJECTED") {
    appointment.cancelledAt = new Date();
    if (reason) {
      appointment.rejectionReason = reason;
    }
  }

  await appointment.save();

  try {
    const { notifyBookingStatusChange } = require("./telegramService");
    notifyBookingStatusChange(appointment.id, newStatus).catch((e) =>
      console.warn("Telegram status notification error:", e.message),
    );
  } catch (tgErr) {
    console.warn("Telegram notification skip:", tgErr.message);
  }

  return appointment;
};
