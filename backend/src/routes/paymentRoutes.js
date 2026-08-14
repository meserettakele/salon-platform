const express = require("express");
const router = express.Router();

const {
  createPayment,

  getPayment,

  updatePaymentStatus,

  viewPayments,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= CUSTOMER PAYMENT =================

router.post("/", protect, authorize("CUSTOMER"), createPayment);

router.get(
  "/appointment/:appointmentId",
  protect,
  authorize("CUSTOMER"),
  getPayment,
);

// ================= OWNER PAYMENT =================

router.get("/owner/history", protect, authorize("OWNER"), viewPayments);

// ================= PAYMENT STATUS UPDATE =================
// Later this can be connected to payment gateway/admin

router.patch(
  "/:id/status",
  protect,
  authorize("OWNER", "ADMIN"),
  updatePaymentStatus,
);

module.exports = router;
