const express = require("express");
const router = express.Router();

const {
  getOwnSalon,
  updateOwnSalon,
  updateOwnBusinessHours,
  getProfile,
  updateProfile,
  updatePassword,
  getCategories,
} = require("../controllers/ownerController");
const {
  uploadLogo,
  uploadGallery,
  deleteGalleryImage,
} = require("../controllers/imageController");
const {
  addEmployee,
  viewEmployees,
  updateEmployee,
  deleteEmployee,
  uploadPhoto: uploadEmployeePhoto,
  assignServices,
} = require("../controllers/employeeController");
const {
  addService,
  viewServices,
  updateService,
  deleteService,
  uploadPhoto: uploadServicePhoto,
} = require("../controllers/serviceController");
const {
  viewBookings,
  acceptBooking,
  rejectBooking,
  completeAppointment,
} = require("../controllers/bookingController");
const {
  viewCustomers,
  viewCustomerHistory,
} = require("../controllers/customerController"); // Cleanly separate controller import

const {
  validateUpdateSalon,
  validateBusinessHours,
} = require("../validators/ownerValidator");
const {
  validateCreateEmployee,
  validateUpdateEmployee,
  validateAssignServices,
} = require("../validators/employeeValidator");
const {
  validateCreateService,
  validateUpdateService,
} = require("../validators/serviceValidator");
const {
  viewPayments,
  confirmOwnerPayment,
} = require("../controllers/paymentController");
const {
  getTransactions,
} = require("../controllers/ownerTransactionController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect, authorize("OWNER"));

// Profile & Business Hours Operations
router.get("/salon", getOwnSalon);
router.put("/salon", validateUpdateSalon, updateOwnSalon);
router.put("/business-hours", validateBusinessHours, updateOwnBusinessHours);

// User Profile & Password Operations
// Owner Profile & Password Operations
router.get("/profile", getProfile);
router.put("/profile", upload.single("profileImage"), updateProfile);
router.put("/profile/password", updatePassword);

// Image Management Operations
router.put("/salon/logo", upload.single("logo"), uploadLogo);
router.post("/salon/gallery", upload.single("gallery"), uploadGallery);
router.delete("/salon/gallery", deleteGalleryImage);

// Employee Management Operations (Phase 5.3)
router.post("/employees", validateCreateEmployee, addEmployee);
router.get("/employees", viewEmployees);
router.put("/employees/:id", validateUpdateEmployee, updateEmployee);
router.delete("/employees/:id", deleteEmployee);
router.put("/employees/:id/photo", upload.single("photo"), uploadEmployeePhoto);
router.post("/employees/:id/services", validateAssignServices, assignServices);
router.put("/employees/:id/services", validateAssignServices, assignServices);

// Service Management Operations (Phase 5.4)
router.post("/services", validateCreateService, addService);
router.get("/services", viewServices);
router.put("/services/:id", validateUpdateService, updateService);
router.delete("/services/:id", deleteService);
router.put("/services/:id/photo", upload.single("photo"), uploadServicePhoto);

// Booking Management Operations (Phase 5.5)
router.get("/bookings", viewBookings);
router.patch("/bookings/:id/accept", acceptBooking);
router.patch("/bookings/:id/reject", rejectBooking);
router.patch("/bookings/:id/complete", completeAppointment);
// Payment Management
router.get("/payments", viewPayments);
router.patch("/payments/:id/confirm", confirmOwnerPayment);

// Customer Management Operations (Phase 5.6)
router.get("/customers", viewCustomers);
router.get("/customers/:customerId/history", viewCustomerHistory);
router.get("/categories", getCategories);
router.get("/transactions", getTransactions);

module.exports = router;
