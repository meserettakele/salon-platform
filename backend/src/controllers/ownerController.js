const ownerService = require("../services/ownerService");
const { User } = require("../models");
const bcrypt = require("bcrypt");
exports.getOwnSalon = async (req, res) => {
  try {
    const salon = await ownerService.getSalonByOwnerId(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Owner salon profile data fetched successfully.",
      data: salon,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateOwnSalon = async (req, res) => {
  try {
    const updatedSalon = await ownerService.updateSalonProfile(
      req.user.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Owner salon profile characteristics updated safely.",
      data: updatedSalon,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateOwnBusinessHours = async (req, res) => {
  try {
    const updatedSalon = await ownerService.updateSalonBusinessHours(
      req.user.id,
      req.body.businessHours,
    );

    return res.status(200).json({
      success: true,
      message: "Relational business hours matrix synchronized successfully.",
      data: updatedSalon,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================================
// OWNER PROFILE
// =========================================================

exports.getProfile = async (req, res) => {
  try {
    const profile = await ownerService.getOwnerProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Owner profile fetched successfully.",
      data: profile,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await ownerService.updateOwnerProfile(
      req.user.id,
      req.body,
      req.file,
    );

    return res.status(200).json({
      success: true,
      message: "Owner profile updated successfully.",
      data: profile,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new passwords are required.",
      });
    }

    await ownerService.changeOwnerPassword(
      req.user.id,
      oldPassword,
      newPassword,
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await ownerService.getCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (err) {
    console.error("CRITICAL ERROR IN GET CATEGORIES:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch categories",
      errorDetails: err.toString(),
    });
  }
};
