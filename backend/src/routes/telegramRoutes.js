// src/routes/telegramRoutes.js
const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegramController");
const { protect } = require("../middleware/authMiddleware");

// All Telegram user routes require standard authentication
router.use(protect);

router.get("/link-token", telegramController.generateLinkToken);
router.get("/status", telegramController.getTelegramStatus);
router.post("/unlink", telegramController.unlinkTelegram);
router.post("/toggle-notifications", telegramController.toggleNotifications);

module.exports = router;
