const express = require("express");
const router = express.Router();

const {
  addCategory,
  editCategory,
  removeCategory,
  listCategories,
  addNewSalon,
  getAllSalons,
  updateSalonStatus,
  addNewOwner,
  assignOwnerToSalon,
  listAllBookings,
  getAllUsers,
  getPlatformReports,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");

const {
  validateCategoryInput,
  validateSalonCreate,
  validateOwnerCreate,
  validateAssignOwner,
} = require("../validators/adminValidator");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Force strict admin verification on all endpoints
router.use(protect, authorize("ADMIN"));

// Profile Management Routes
router.get("/profile", getAdminProfile);
router.patch("/profile", upload.single("profileImage"), updateAdminProfile);

// Category Asset Maps
router.post("/categories", validateCategoryInput, addCategory);
router.put("/categories/:id", validateCategoryInput, editCategory);
router.delete("/categories/:id", removeCategory);
router.get("/categories", listCategories);

// Salon Asset Maps
router.post("/salons", validateSalonCreate, addNewSalon);
router.get("/salons", getAllSalons);
router.patch("/salons/:id/status", updateSalonStatus);
router.post("/owners", validateOwnerCreate, addNewOwner);
router.post("/salons/assign-owner", validateAssignOwner, assignOwnerToSalon);

// Platform Monitoring & Directory Maps
router.get("/users", getAllUsers);
router.get("/bookings", listAllBookings);
router.get("/reports/statistics", getPlatformReports);

module.exports = router;
