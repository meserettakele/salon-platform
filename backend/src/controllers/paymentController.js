const paymentService = require("../services/paymentService");
const createNotification = require("../utils/createNotification");

// ================= CUSTOMER CREATE PAYMENT =================

exports.createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.user.id, req.body);

    // Get appointment details with assigned employee and salon
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
