const express = require("express");
const router = express.Router();

const {
  viewEmployeeBookings,
  acceptEmployeeBooking,
  rejectEmployeeBooking,
  completeEmployeeBooking,
} = require("../controllers/employeeBookingController");

const {
  getEmployeeProfile,
  updateEmployeeProfile,
} = require("../controllers/employeeController");

console.log({
  viewEmployeeBookings,
  acceptEmployeeBooking,
  rejectEmployeeBooking,
  completeEmployeeBooking,
  getEmployeeProfile,
  updateEmployeeProfile,
});

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= EMPLOYEE PROTECTED AREA =================

router.use(protect, authorize("EMPLOYEE"));

// Booking Management
router.get("/bookings", viewEmployeeBookings);
router.patch("/bookings/:id/accept", acceptEmployeeBooking);
router.patch("/bookings/:id/reject", rejectEmployeeBooking);
router.patch("/bookings/:id/complete", completeEmployeeBooking);

// Profile Management
router.get("/profile", getEmployeeProfile);
router.put("/profile", updateEmployeeProfile);
router.patch("/profile", updateEmployeeProfile);

module.exports = router;
