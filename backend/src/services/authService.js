const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { User, Salon, Employee } = require("../models");
const { generateToken } = require("../utils/jwtHelper");

exports.registerUser = async (userData) => {
  const { fullName, email, phone, password, role } = userData;

  if (!fullName || !phone || !password) {
    const error = new Error(
      "Full name, phone number, and password are required fields.",
    );
    error.statusCode = 400;
    throw error;
  }

  // Handle unique constraints safely using native Sequelize Op operators
  const searchConditions = [{ phone }];
  if (email) searchConditions.push({ email });

  const existingUser = await User.findOne({
    where: {
      [Op.or]: searchConditions,
    },
  });

  if (existingUser) {
    const error = new Error(
      "A user account with this phone number or email address already exists.",
    );
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    fullName,
    email: email || null,
    phone,
    password: hashedPassword,
    role: role || "CUSTOMER",
    isActive: true,
  });

  const userResponse = newUser.toJSON();
  delete userResponse.password;

  const token = generateToken({
    id: userResponse.id,
    role: userResponse.role,
  });

  return {
    token,
    user: userResponse,
  };
};

// =========================================================
// LOGIN
// =========================================================

exports.loginUser = async (credentials) => {
  const { phone, password } = credentials;

  if (!phone || !password) {
    const error = new Error(
      "Please provide both phone number and password parameters.",
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({
    where: { phone },
  });

  if (!user || !user.isActive) {
    const error = new Error(
      "Invalid credentials or account has been suspended.",
    );
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  // =======================================================
  // OWNER LOGIN
  // =======================================================

  let managedSalonId = null;

  if (user.role === "OWNER") {
    const associatedSalon = await Salon.findOne({
      where: {
        ownerId: user.id,
      },
      attributes: ["id"],
    });

    if (associatedSalon) {
      managedSalonId = associatedSalon.id;
    }
  }

  // =======================================================
  // EMPLOYEE LOGIN
  // =======================================================

  let employeeId = null;
  let employeeSalonId = null;

  if (user.role === "EMPLOYEE") {
    const employee = await Employee.findOne({
      where: {
        userId: user.id,
      },
      attributes: ["id", "salonId"],
    });

    if (!employee) {
      const error = new Error(
        "Employee account is not linked to an employee profile.",
      );
      error.statusCode = 403;
      throw error;
    }

    employeeId = employee.id;
    employeeSalonId = employee.salonId;
  }

  // =======================================================
  // USER RESPONSE
  // =======================================================

  const userResponse = user.toJSON();

  delete userResponse.password;

  // =======================================================
  // JWT PAYLOAD
  // =======================================================

  const token = generateToken({
    id: userResponse.id,
    role: userResponse.role,

    // OWNER
    ...(managedSalonId && {
      salonId: managedSalonId,
    }),

    // EMPLOYEE
    ...(employeeId && {
      employeeId,
    }),

    ...(employeeSalonId && {
      employeeSalonId,
    }),
  });

  // =======================================================
  // LOGIN RESPONSE
  // =======================================================

  return {
    token,
    user: userResponse,

    // Existing OWNER response
    salonId: managedSalonId,

    // New EMPLOYEE response
    employeeId,
    employeeSalonId,
  };
};

// =========================================================
// FORGOT PASSWORD
// =========================================================

exports.requestPasswordReset = async (identifier) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ phone: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Generate a random 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Code expires in 15 minutes
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  user.resetPasswordToken = resetCode;
  user.resetPasswordExpires = resetPasswordExpires;

  await user.save();

  return {
    message: "Password reset code generated successfully.",
    resetCode,
  };
};

// =========================================================
// RESET PASSWORD
// =========================================================

exports.resetPassword = async ({ identifier, resetCode, newPassword }) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ phone: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (
    user.resetPasswordToken !== resetCode ||
    !user.resetPasswordExpires ||
    user.resetPasswordExpires <= new Date()
  ) {
    const error = new Error("Invalid or expired reset code.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message: "Password reset successfully.",
  };
};
