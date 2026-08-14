const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error during user registration.",
      data: null,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error during authentication.",
      data: null,
    });
  }
};

// =========================================================
// FORGOT PASSWORD
// =========================================================

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    const result = await authService.requestPasswordReset(identifier);

    return res.status(200).json({
      success: true,
      message: "Password reset code generated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error during password reset request.",
      data: null,
    });
  }
};

// =========================================================
// RESET PASSWORD
// =========================================================

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error during password reset.",
      data: null,
    });
  }
};
