const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayment,
  updatePaymentStatus,
  viewPayments,
  verifyChapaPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= CHAPA RETURN REDIRECT (no auth — browser redirect from Chapa) =================
// Chapa redirects the customer here after payment. We verify and then redirect to frontend.
router.get("/chapa/verify", verifyChapaPayment);

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

router.patch(
  "/:id/status",
  protect,
  authorize("OWNER", "ADMIN"),
  updatePaymentStatus,
);

module.exports = router;

