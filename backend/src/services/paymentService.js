const {
  Payment,
  Appointment,
  Salon,
  User,
  Service,
  Employee,
} = require("../models");
const chapaService = require("./chapaService");

// ================= CUSTOMER CREATE PAYMENT =================

exports.createPayment = async (customerId, paymentData) => {
  const { appointmentId, paymentMethod, transactionId } = paymentData;

  // 1. Verify appointment exists & belongs to customer
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, customerId },
    include: [
      { model: User, as: "customer", attributes: ["id", "fullName", "email", "phone"] },
    ],
  });

  if (!appointment) {
    const error = new Error("Appointment not found or does not belong to this customer.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Ensure appointment is accepted
  if (appointment.bookingStatus !== "ACCEPTED") {
    const error = new Error("Payment can only be made for accepted appointments.");
    error.statusCode = 400;
    throw error;
  }

  // 3. Resolve amount
  const amountToPay =
    appointment.bookedPrice || appointment.totalAmount || appointment.price || 0;

  if (!amountToPay || amountToPay <= 0) {
    const error = new Error("Invalid appointment price.");
    error.statusCode = 400;
    throw error;
  }

  // 4. Check for existing payment
  let payment = await Payment.findOne({ where: { appointmentId } });

  if (payment && payment.paymentStatus === "PAID") {
    const error = new Error("This appointment has already been paid.");
    error.statusCode = 400;
    throw error;
  }

  // ============================================================
  // CHAPA FLOW — initialize checkout, keep payment as PENDING
  // The payment is only marked PAID after Chapa verification
  // ============================================================
  if (paymentMethod === "CHAPA") {
    const customer = appointment.customer;
    const nameParts = (customer?.fullName || "Customer User").split(" ");

    const { checkout_url, tx_ref } = await chapaService.initializePayment({
      amount: amountToPay,
      email: customer?.email || "customer@salon.com",
      firstName: nameParts[0] || "Customer",
      lastName: nameParts.slice(1).join(" ") || "User",
      phone: customer?.phone || "",
      description: `Booking #${appointmentId} payment`,
      returnUrl: process.env.CHAPA_RETURN_URL,
    });

    // Save / update payment record as PENDING with the tx_ref
    if (payment) {
      payment.paymentMethod = "CHAPA";
      payment.amount = amountToPay;
      payment.transactionId = tx_ref;
      payment.paymentStatus = "PENDING";
      await payment.save();
    } else {
      payment = await Payment.create({
        appointmentId,
        amount: amountToPay,
        paymentMethod: "CHAPA",
        transactionId: tx_ref,
        paymentStatus: "PENDING",
      });
    }

    // Return the checkout_url so the controller can send it to the frontend
    return { checkout_url, tx_ref, payment, isChapa: true };
  }

  // ============================================================
  // NON-CHAPA FLOW — cash/manual, mark PAID immediately (unchanged)
  // ============================================================
  if (payment) {
    payment.paymentMethod = paymentMethod;
    payment.amount = amountToPay;
    if (transactionId) payment.transactionId = transactionId;
    payment.paymentStatus = "PAID";
    await payment.save();
  } else {
    payment = await Payment.create({
      appointmentId,
      amount: amountToPay,
      paymentMethod,
      transactionId: transactionId || null,
      paymentStatus: "PAID",
    });
  }

  // Update appointment paymentStatus to PAID
  appointment.paymentStatus = "PAID";
  await appointment.save();

  return { payment, isChapa: false };
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

// ================= CHAPA VERIFICATION (called on return redirect) =================

exports.verifyChapaPayment = async (tx_ref) => {
  // 1. Find the pending payment by transaction ID (tx_ref)
  const payment = await Payment.findOne({
    where: { transactionId: tx_ref },
    include: [
      {
        model: Appointment,
        as: "appointment",
      },
    ],
  });

  if (!payment) {
    const error = new Error("Payment record not found for this transaction.");
    error.statusCode = 404;
    throw error;
  }

  // Already confirmed — idempotent check
  if (payment.paymentStatus === "PAID") {
    return { payment, alreadyPaid: true };
  }

  // 2. Verify with Chapa API
  // chapaData is response.data from Chapa — it has { status: "success", amount, tx_ref, ... }
  const chapaData = await chapaService.verifyPayment(tx_ref);

  // Accept if either the transaction status field says success
  const txStatus = (chapaData.status || "").toLowerCase();
  if (txStatus !== "success") {
    console.warn("[PaymentService] Chapa tx status was:", txStatus, "for tx_ref:", tx_ref);
    // Mark as FAILED
    payment.paymentStatus = "FAILED";
    await payment.save();
    if (payment.appointment) {
      payment.appointment.paymentStatus = "FAILED";
      await payment.appointment.save();
    }
    const error = new Error("Payment was not successful. Status: " + txStatus);
    error.statusCode = 400;
    throw error;
  }

  // 3. Mark payment and appointment as PAID
  payment.paymentStatus = "PAID";
  await payment.save();

  if (payment.appointment) {
    payment.appointment.paymentStatus = "PAID";
    await payment.appointment.save();
  }

  return { payment, alreadyPaid: false };
};
