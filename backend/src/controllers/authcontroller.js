const authService = require("../services/authService");
const { getAuth } = require("firebase-admin/auth");
const firebaseApp = require("../config/firebaseAdmin");


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

// =========================================================
// GOOGLE LOGIN
// =========================================================

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!firebaseApp) {
      return res.status(503).json({
        success: false,
        message: "Google login is currently disabled on this server.",
        data: null,
      });
    }

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
        data: null,
      });
    }

    // Verify the Firebase ID token using Admin SDK (modular API)
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const result = await authService.googleLoginUser(decodedToken);

    return res.status(200).json({
      success: true,
      message: "Google authentication successful.",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error during Google authentication.",
      data: null,
    });
  }
};

