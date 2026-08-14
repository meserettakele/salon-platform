const { Op } = require("sequelize");
const {
  Salon,
  Appointment,
  Payment,
  User,
  Service,
  Employee,
} = require("../models");

// =========================================
// Get Owner Salon
// =========================================

const getSalonByOwner = async (ownerId) => {
  const salon = await Salon.findOne({
    where: { ownerId },
  });

  if (!salon) {
    const error = new Error("Salon not found.");
    error.statusCode = 404;
    throw error;
  }

  return salon;
};

// =========================================
// Get Transactions
// =========================================

exports.getTransactions = async (ownerId) => {
  const salon = await getSalonByOwner(ownerId);

  const appointments = await Appointment.findAll({
    where: {
      salonId: salon.id,
    },

    include: [
      {
        model: Payment,
        as: "payment",
        attributes: [
          "id",
          "amount",
          "paymentMethod",
          "paymentStatus",
          "transactionId",
          "createdAt",
        ],
      },

      {
        model: User,
        as: "customer",
        attributes: ["id", "fullName", "email", "phone"],
      },

      {
        model: Service,
        as: "service",
        attributes: ["id", "name"],
      },

      {
        model: Employee,
        as: "employee",
        attributes: ["id", "name", "phone", "position"],
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  // =========================================
  // Date ranges
  // =========================================

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // =========================================
  // Calculate Summary
  // =========================================

  let totalRevenue = 0;
  let todayRevenue = 0;
  let monthlyRevenue = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  let totalPaidCount = 0;

  appointments.forEach((appointment) => {
    const payment = appointment.payment;

    if (!payment) {
      return;
    }

    const amount = Number(payment.amount) || 0;
    const paymentDate = new Date(payment.createdAt);

    if (payment.paymentStatus === "PAID") {
      totalRevenue += amount;
      totalPaidCount += 1;

      if (paymentDate >= startOfToday && paymentDate < startOfTomorrow) {
        todayRevenue += amount;
      }

      if (paymentDate >= startOfMonth) {
        monthlyRevenue += amount;
      }
    }

    if (
      payment.paymentStatus === "PENDING" &&
      appointment.paymentStatus === "PENDING"
    ) {
      pendingCount += 1;
      pendingAmount += amount;
    }
  });

  const summary = {
    totalRevenue,
    todayRevenue,
    monthlyRevenue,
    pendingCount,
    pendingAmount,
    totalPaidCount,
  };

  return {
    summary,
    transactions: appointments,
  };
};
