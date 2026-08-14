// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createAdminNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Unified endpoints for all roles
router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

// Admin-only creation endpoint
router.post("/admin/create", authorize("ADMIN"), createAdminNotification);

module.exports = router;
