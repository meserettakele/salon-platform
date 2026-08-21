const paymentService = require("../services/paymentService");
const createNotification = require("../utils/createNotification");

// ================= CUSTOMER CREATE PAYMENT =================

exports.createPayment = async (req, res) => {
  try {
    const result = await paymentService.createPayment(req.user.id, req.body);

    // ── CHAPA: return checkout_url, let frontend redirect ──
    if (result.isChapa) {
      return res.status(200).json({
        success: true,
        message: "Chapa payment initialized. Redirect to checkout.",
        data: {
          checkout_url: result.checkout_url,
          tx_ref: result.tx_ref,
        },
      });
    }

    // ── NON-CHAPA: payment recorded as PAID immediately ──
    const payment = result.payment;
    const appointment =
      await paymentService.getAppointmentForPaymentNotification(
        payment.appointmentId || req.body.appointmentId,
      );

    // 🔔 CUSTOMER NOTIFICATION
    await createNotification({
      userId: req.user.id,
      title: "Payment Successful",
      message: "Your payment has been received. Your appointment is ready.",
      type: "PAYMENT_SUCCESSFUL",
      bookingId: payment.appointmentId || req.body.appointmentId,
    });

    // 🔔 EMPLOYEE NOTIFICATION
    if (appointment?.employee?.userId) {
      await createNotification({
        userId: appointment.employee.userId,
        title: "Payment Received",
        message:
          "Customer payment has been received for an appointment assigned to you.",
        type: "PAYMENT_RECEIVED",
        bookingId: payment.appointmentId || req.body.appointmentId,
      });
    }

    // 🔔 SALON OWNER NOTIFICATION
    if (appointment?.salon?.ownerId) {
      await createNotification({
        userId: appointment.salon.ownerId,
        title: "Payment Received",
        message:
          "Customer payment has been received for an appointment at your salon.",
        type: "PAYMENT_RECEIVED",
        bookingId: payment.appointmentId || req.body.appointmentId,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Payment created successfully.",
      data: payment,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= CHAPA VERIFY (called on return redirect) =================

exports.verifyChapaPayment = async (req, res) => {
  const { tx_ref, status } = req.query;

  const frontendBase =
    process.env.CHAPA_RETURN_URL || "http://localhost:5173/customer/payment/success";

  // If Chapa says the payment was cancelled/failed before we even check
  if (status && status !== "success") {
    return res.redirect(`${frontendBase}?status=failed&tx_ref=${tx_ref || ""}`);
  }

  if (!tx_ref) {
    return res.redirect(`${frontendBase}?status=failed&reason=missing_tx_ref`);
  }

  try {
    const { payment } = await paymentService.verifyChapaPayment(tx_ref);

    // Fire notifications after successful Chapa verification
    const appointment =
      await paymentService.getAppointmentForPaymentNotification(
        payment.appointmentId,
      );

    // 🔔 CUSTOMER NOTIFICATION
    if (appointment?.customerId) {
      await createNotification({
        userId: appointment.customerId,
        title: "Payment Successful ✅",
        message:
          "Your Chapa payment was verified and confirmed. Your appointment is ready!",
        type: "PAYMENT_SUCCESSFUL",
        bookingId: payment.appointmentId,
      }).catch(() => {});
    }

    // 🔔 EMPLOYEE NOTIFICATION
    if (appointment?.employee?.userId) {
      await createNotification({
        userId: appointment.employee.userId,
        title: "Payment Received",
        message: "Customer payment via Chapa confirmed for your appointment.",
        type: "PAYMENT_RECEIVED",
        bookingId: payment.appointmentId,
      }).catch(() => {});
    }

    // 🔔 SALON OWNER NOTIFICATION
    if (appointment?.salon?.ownerId) {
      await createNotification({
        userId: appointment.salon.ownerId,
        title: "Payment Received",
        message: "Customer paid via Chapa for an appointment at your salon.",
        type: "PAYMENT_RECEIVED",
        bookingId: payment.appointmentId,
      }).catch(() => {});
    }

    return res.redirect(`${frontendBase}?status=success&tx_ref=${tx_ref}`);
  } catch (err) {
    console.error("Chapa verification error:", err.message);
    return res.redirect(`${frontendBase}?status=failed&tx_ref=${tx_ref || ""}`);
  }
};
// ================= CUSTOMER VIEW PAYMENT =================

exports.getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByAppointment(
      req.user.id,
      req.params.appointmentId,
    );

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully.",
      data: payment,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= UPDATE PAYMENT STATUS =================

exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await paymentService.updatePaymentStatus(
      req.params.id,
      req.body.status,
    );

    if (req.body.status === "PAID" || req.body.status === "COMPLETED") {
      // 🔔 TRIGGER NOTIFICATION: PAYMENT SUCCESSFUL (if updated asynchronously)
      await createNotification({
        userId: payment.userId || payment.customerId,
        title: "Payment Successful",
        message: "Your payment has been received. Your appointment is ready.",
        type: "PAYMENT_SUCCESSFUL",
        bookingId: payment.appointmentId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      data: payment,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= OWNER VIEW PAYMENTS =================

exports.viewPayments = async (req, res) => {
  try {
    const payments = await paymentService.getSalonPayments(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Salon payment history fetched successfully.",
      data: payments,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.confirmOwnerPayment = async (req, res) => {
  try {
    const payment = await paymentService.confirmPaymentByOwner(
      req.user.id,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully.",
      data: payment,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
