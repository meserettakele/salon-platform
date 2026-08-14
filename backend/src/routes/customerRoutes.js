const express = require("express");
const router = express.Router();
const upload = require("../middleware/customerUploadMiddleware");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getSalons,
  getSalonDetails,
  getCategories,
  getEmployeesByServices,
  bookAppointment,
  viewBookings,
  cancelBooking,
  getAvailableSlots,
  uploadProfileImage,
} = require("../controllers/customerController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= DISCOVERY (PUBLIC) =================

// Customers can browse without login
router.get("/salons", getSalons);
router.get("/salons/:id", getSalonDetails);
router.get("/categories", getCategories);

// ================= CUSTOMER PROTECTED AREA =================

router.use(protect, authorize("CUSTOMER"));

// Profile Management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/profile/image", upload.single("profileImage"), uploadProfileImage);
router.put("/profile/password", updatePassword);

// Booking Management
router.get("/bookings/available-slots", getAvailableSlots);
router.post("/bookings", bookAppointment);
router.get("/bookings", viewBookings);
router.patch("/bookings/:id/cancel", cancelBooking);

// Employees grouped by service
router.get("/salons/:id/employees-by-services", getEmployeesByServices);

module.exports = router;
