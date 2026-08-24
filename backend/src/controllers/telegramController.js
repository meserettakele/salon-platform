// src/controllers/telegramController.js
const crypto = require("crypto");
const { User } = require("../models");

/**
 * Generate a One-Time Connection Token for deep linking with Telegram Bot
 */
exports.generateLinkToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Generate random 12-char alphanumeric token
    const token = crypto.randomBytes(6).toString("hex");
    user.telegramAuthToken = token;
    await user.save();

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "VelouraBeautyBot";
    const telegramLink = `https://t.me/${botUsername}?start=${token}`;

    return res.status(200).json({
      success: true,
      data: {
        token,
        botUsername,
        telegramLink,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Telegram Connection Status for logged-in user
 */
exports.getTelegramStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["id", "telegramChatId", "telegramUsername", "telegramNotifyEnabled"],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        isConnected: Boolean(user.telegramChatId),
        telegramUsername: user.telegramUsername || null,
        telegramNotifyEnabled: user.telegramNotifyEnabled ?? true,
        botUsername: process.env.TELEGRAM_BOT_USERNAME || "VelouraBeautyBot",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unlink Telegram Account
 */
exports.unlinkTelegram = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.telegramChatId = null;
    user.telegramUsername = null;
    user.telegramAuthToken = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Telegram account unlinked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Telegram Notifications ON/OFF
 */
exports.toggleNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.telegramNotifyEnabled = Boolean(enabled);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Telegram notifications ${enabled ? "enabled" : "disabled"}.`,
      data: { telegramNotifyEnabled: user.telegramNotifyEnabled },
    });
  } catch (error) {
    next(error);
  }
};
