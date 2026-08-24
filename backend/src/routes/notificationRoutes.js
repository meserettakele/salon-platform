// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createAdminNotification,
  submitContactMessage,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public contact submission endpoint (open to all website visitors & prospective owners)
router.post("/contact", submitContactMessage);

// Protected endpoints for authenticated users
router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

// Admin-only creation endpoint
router.post("/admin/create", protect, authorize("ADMIN"), createAdminNotification);

module.exports = router;

