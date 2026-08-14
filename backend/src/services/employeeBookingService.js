const {
  Appointment,
  User,
  Service,
  Employee,
  Salon,
  Payment,
} = require("../models");

// =====================================================
// GET EMPLOYEE PROFILE
// =====================================================

const getEmployeeByUserId = async (userId) => {
  const employee = await Employee.findOne({
    where: { userId },
  });

  if (!employee) {
    const error = new Error("Employee profile is not linked to this account.");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

// =====================================================
// GET EMPLOYEE BOOKINGS
// =====================================================

exports.getEmployeeBookings = async (userId, statusFilter) => {
  const employee = await getEmployeeByUserId(userId);

  const whereClause = {
    employeeId: employee.id,
    salonId: employee.salonId,
  };

  if (statusFilter) {
    const allowedStatuses = [
      "PENDING",
      "ACCEPTED",
      "CONFIRMED",
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
        model: Salon,
        as: "salon",
        attributes: ["id", "name", "address", "phone"],
      },
      {
        model: Payment,
        as: "payment",
        attributes: ["id", "paymentStatus", "amount", "paymentMethod"],
        required: false,
      },
    ],

    order: [
      ["appointmentDate", "ASC"],
      ["appointmentTime", "ASC"],
    ],
  });
};

// =====================================================
// FIND EMPLOYEE'S APPOINTMENT
// =====================================================

const getEmployeeAppointment = async (userId, appointmentId) => {
  const employee = await getEmployeeByUserId(userId);

  const appointment = await Appointment.findOne({
    where: {
      id: appointmentId,
      employeeId: employee.id,
      salonId: employee.salonId,
    },
  });

  if (!appointment) {
    const error = new Error(
      "Appointment not found or it is not assigned to you.",
    );
    error.statusCode = 404;
    throw error;
  }

  return appointment;
};

// =====================================================
// ACCEPT BOOKING
// =====================================================

exports.acceptBooking = async (userId, appointmentId) => {
  const appointment = await getEmployeeAppointment(userId, appointmentId);

  if (appointment.bookingStatus !== "PENDING") {
    const error = new Error("Only pending appointments can be accepted.");
    error.statusCode = 400;
    throw error;
  }

  appointment.bookingStatus = "ACCEPTED";
  appointment.acceptedAt = new Date();

  await appointment.save();

  return appointment;
};

// =====================================================
// REJECT BOOKING
// =====================================================

exports.rejectBooking = async (userId, appointmentId, reason) => {
  const appointment = await getEmployeeAppointment(userId, appointmentId);

  if (appointment.bookingStatus !== "PENDING") {
    const error = new Error("Only pending appointments can be rejected.");
    error.statusCode = 400;
    throw error;
  }

  appointment.bookingStatus = "REJECTED";
  appointment.cancelledAt = new Date();

  // Only set this if your Appointment model
  // contains a rejectionReason column.
  if (
    reason &&
    Object.prototype.hasOwnProperty.call(
      appointment.dataValues,
      "rejectionReason",
    )
  ) {
    appointment.rejectionReason = reason;
  }

  await appointment.save();

  return appointment;
};

// =====================================================
// COMPLETE APPOINTMENT
// =====================================================

exports.completeAppointment = async (userId, appointmentId) => {
  const appointment = await getEmployeeAppointment(userId, appointmentId);

  if (
    appointment.bookingStatus !== "ACCEPTED" &&
    appointment.bookingStatus !== "CONFIRMED"
  ) {
    const error = new Error("Only accepted appointments can be completed.");
    error.statusCode = 400;
    throw error;
  }

  appointment.bookingStatus = "COMPLETED";
  appointment.completedAt = new Date();

  await appointment.save();

  return appointment;
};
