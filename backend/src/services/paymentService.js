const {
  Payment,
  Appointment,
  Salon,
  User,
  Service,
  Employee,
} = require("../models");

// ================= CUSTOMER CREATE PAYMENT =================

exports.createPayment = async (customerId, paymentData) => {
  const { appointmentId, paymentMethod, transactionId } = paymentData;

  // 1. Verify appointment exists & belongs to customer
  const appointment = await Appointment.findOne({
    where: {
      id: appointmentId,
      customerId,
    },
  });

  if (!appointment) {
    const error = new Error(
      "Appointment not found or does not belong to this customer.",
    );
    error.statusCode = 404;
    throw error;
  }

  // 2. Ensure appointment is accepted
  if (appointment.bookingStatus !== "ACCEPTED") {
    const error = new Error(
      "Payment can only be made for accepted appointments.",
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Resolve amount safely across possible column names
  const amountToPay =
    appointment.bookedPrice ||
    appointment.totalAmount ||
    appointment.price ||
    0;

  if (!amountToPay || amountToPay <= 0) {
    const error = new Error("Invalid appointment price.");
    error.statusCode = 400;
    throw error;
  }

  // 4. Check for existing payment
  let payment = await Payment.findOne({
    where: {
      appointmentId,
    },
  });

  if (payment) {
    // If already paid, reject duplicate payment
    if (payment.paymentStatus === "PAID") {
      const error = new Error("This appointment has already been paid.");
      error.statusCode = 400;
      throw error;
    }

    // If PENDING or FAILED, update existing record
    payment.paymentMethod = paymentMethod;
    payment.amount = amountToPay;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    // Payment has now been successfully submitted
    payment.paymentStatus = "PAID";

    await payment.save();

    // Update appointment paymentStatus to PAID
    appointment.paymentStatus = "PAID";
    await appointment.save();

    return payment;
  }

  // 5. Create new payment record
  payment = await Payment.create({
    appointmentId,
    amount: amountToPay,
    paymentMethod,
    transactionId: transactionId || null,
    paymentStatus: "PAID",
  });

  // 6. Update appointment paymentStatus to PAID
  appointment.paymentStatus = "PAID";
  await appointment.save();

  return payment;
};

// ================= CUSTOMER VIEW PAYMENT =================

exports.getPaymentByAppointment = async (customerId, appointmentId) => {
  const appointment = await Appointment.findOne({
    where: {
      id: appointmentId,
      customerId,
    },
  });

  if (!appointment) {
    const error = new Error("Appointment not found.");
    error.statusCode = 404;
    throw error;
  }

  return await Payment.findOne({
    where: {
      appointmentId,
    },
  });
};

// ================= UPDATE PAYMENT STATUS =================

exports.updatePaymentStatus = async (paymentId, status) => {
  const allowedStatus = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  if (!allowedStatus.includes(status)) {
    const error = new Error("Invalid payment status.");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    const error = new Error("Payment record not found.");
    error.statusCode = 404;
    throw error;
  }

  payment.paymentStatus = status;

  await payment.save();

  // ================= SYNC APPOINTMENT PAYMENT STATUS =================

  const appointment = await Appointment.findByPk(payment.appointmentId);

  if (appointment) {
    appointment.paymentStatus = status;
    await appointment.save();
  }

  return payment;
};

// ================= OWNER PAYMENT HISTORY =================

exports.getSalonPayments = async (ownerId) => {
  const salon = await Salon.findOne({
    where: {
      ownerId,
    },
  });

  if (!salon) {
    const error = new Error("No salon assigned to this owner.");
    error.statusCode = 404;
    throw error;
  }

  return await Payment.findAll({
    include: [
      {
        model: Appointment,
        as: "appointment",
        where: {
          salonId: salon.id,
        },
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["id", "fullName", "phone"],
          },
          {
            model: Service,
            as: "service",
            attributes: ["id", "name"],
          },
          {
            model: Employee,
            as: "employee",
            attributes: ["id", "name"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

exports.confirmPaymentByOwner = async (ownerId, paymentId) => {
  const payment = await Payment.findByPk(paymentId, {
    include: [
      {
        model: Appointment,
        as: "appointment",
      },
    ],
  });

  if (!payment) {
    const error = new Error("Payment not found.");
    error.statusCode = 404;
    throw error;
  }

  const salon = await Salon.findOne({
    where: {
      ownerId,
    },
  });

  if (!salon || payment.appointment.salonId !== salon.id) {
    const error = new Error("You are not allowed to confirm this payment.");
    error.statusCode = 403;
    throw error;
  }

  payment.paymentStatus = "PAID";
  await payment.save();

  payment.appointment.paymentStatus = "PAID";
  await payment.appointment.save();

  return payment;
};
exports.getAppointmentForPaymentNotification = async (appointmentId) => {
  return await Appointment.findByPk(appointmentId, {
    include: [
      {
        model: Employee,
        as: "employee",
        attributes: ["id", "userId"],
      },
      {
        model: Salon,
        as: "salon",
        attributes: ["id", "ownerId"],
      },
    ],
  });
};
