const { Employee, Salon, Service, User } = require("../models");

const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// =========================================================
// HELPER: GET OWNER'S SALON
// =========================================================

const getSalonByOwner = async (ownerId) => {
  const salon = await Salon.findOne({
    where: {
      ownerId,
    },
  });

  if (!salon) {
    const error = new Error(
      "No registered salon assigned to this owner account.",
    );

    error.statusCode = 404;
    throw error;
  }

  return salon;
};

// =========================================================
// CREATE EMPLOYEE
// =========================================================

exports.createEmployee = async (ownerId, employeeData) => {
  const salon = await getSalonByOwner(ownerId);

  const {
    fullName,
    name,
    email,
    phone,
    password,
    position,
    specialization,
    experienceYears,
    image,
    isAvailable,
  } = employeeData;

  // Employee name comes from either fullName or name.
  const employeeName = name || fullName;

  if (!employeeName) {
    const error = new Error("Employee name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!phone) {
    const error = new Error("Employee phone number is required.");
    error.statusCode = 400;
    throw error;
  }

  // =======================================================
  // CHECK WHETHER PHONE IS ALREADY USED
  // =======================================================

  const existingUser = await User.findOne({
    where: {
      phone,
    },
  });

  if (existingUser) {
    const error = new Error(
      `The phone number "${phone}" is already registered to user "${existingUser.fullName}". Please use a different phone number for this employee.`,
    );

    error.statusCode = 409;
    throw error;
  }

  // =======================================================
  // CREATE EMPLOYEE USER ACCOUNT
  // =======================================================

  // Owner can provide a password.
  // If no password is supplied, use a temporary default.
  const employeePassword = password || "Employee@123";

  const hashedPassword = await bcrypt.hash(employeePassword, 10);

  // Generate fallback email if not supplied to satisfy User email requirement
  const employeeEmail =
    email || `${phone.replace(/[^0-9]/g, "")}@employee.salon`;

  const employeeUser = await User.create({
    fullName: employeeName,
    email: employeeEmail,
    phone,
    password: hashedPassword,
    role: "EMPLOYEE",
    isActive: true,
  });

  // =======================================================
  // CREATE EMPLOYEE PROFILE
  // =======================================================

  try {
    const employee = await Employee.create({
      salonId: salon.id,
      userId: employeeUser.id,

      name: employeeName,
      phone,

      position: position || "Specialist",
      specialization: specialization || null,
      experienceYears: experienceYears || 0,
      image: image || null,
      isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
    });

    return {
      employee,
      account: {
        id: employeeUser.id,
        fullName: employeeUser.fullName,
        email: employeeUser.email,
        phone: employeeUser.phone,
        role: employeeUser.role,

        // Return this only when account is initially created
        temporaryPassword: password ? undefined : employeePassword,
      },
    };
  } catch (error) {
    // If Employee creation fails, remove the User account
    // so we don't leave an unlinked EMPLOYEE account.
    await employeeUser.destroy();

    throw error;
  }
};

// =========================================================
// GET EMPLOYEES
// =========================================================

exports.getEmployees = async (ownerId) => {
  const salon = await getSalonByOwner(ownerId);

  return await Employee.findAll({
    where: {
      salonId: salon.id,
    },

    include: [
      {
        model: Service,
        as: "services",
        through: {
          attributes: [],
        },
      },

      {
        model: User,
        as: "userAccount",
        attributes: ["id", "fullName", "email", "phone", "role", "isActive"],
        required: false,
      },
    ],
  });
};

// =========================================================
// UPDATE EMPLOYEE
// =========================================================

exports.updateEmployee = async (ownerId, employeeId, updateData) => {
  const salon = await getSalonByOwner(ownerId);

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      salonId: salon.id,
    },

    include: [
      {
        model: User,
        as: "userAccount",
        required: false,
      },
    ],
  });

  if (!employee) {
    const error = new Error(
      "Employee not found or does not belong to your salon.",
    );

    error.statusCode = 404;
    throw error;
  }

  const { name, fullName, phone, email, password, ...employeeFields } =
    updateData;

  const newEmployeeName = name || fullName;

  // =======================================================
  // UPDATE EMPLOYEE USER ACCOUNT
  // =======================================================

  if (employee.userAccount) {
    const userUpdateData = {};

    if (newEmployeeName) {
      userUpdateData.fullName = newEmployeeName;
    }

    if (phone && phone !== employee.userAccount.phone) {
      const phoneOwner = await User.findOne({
        where: {
          phone,
        },
      });

      if (phoneOwner && phoneOwner.id !== employee.userAccount.id) {
        const error = new Error(
          "Another user account already uses this phone number.",
        );

        error.statusCode = 409;
        throw error;
      }

      userUpdateData.phone = phone;
    }

    if (email !== undefined) {
      userUpdateData.email = email || null;
    }

    // Only change password when a new password was supplied.
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await employee.userAccount.update(userUpdateData);
    }
  } else {
    // If no user account is linked yet, auto-provision one now
    const targetPhone = phone || employee.phone;
    const empName = newEmployeeName || employee.name;
    const empPass = password || "Employee@123";
    const hashedPass = await bcrypt.hash(empPass, 10);
    const empEmail =
      email || `${targetPhone.replace(/[^0-9]/g, "")}@employee.salon`;

    let userAcc = await User.findOne({ where: { phone: targetPhone } });
    if (userAcc) {
      userAcc.role = "EMPLOYEE";
      userAcc.password = hashedPass;
      userAcc.fullName = empName;
      await userAcc.save();
    } else {
      userAcc = await User.create({
        fullName: empName,
        email: empEmail,
        phone: targetPhone,
        password: hashedPass,
        role: "EMPLOYEE",
        isActive: true,
      });
    }
    employee.userId = userAcc.id;
  }

  // =======================================================
  // UPDATE EMPLOYEE PROFILE
  // =======================================================

  const employeeUpdateData = {
    ...employeeFields,
  };

  if (newEmployeeName) {
    employeeUpdateData.name = newEmployeeName;
  }

  if (phone) {
    employeeUpdateData.phone = phone;
  }

  await employee.update(employeeUpdateData);

  return employee;
};

// =========================================================
// DELETE EMPLOYEE
// =========================================================

exports.deleteEmployee = async (ownerId, employeeId) => {
  const salon = await getSalonByOwner(ownerId);

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      salonId: salon.id,
    },
  });

  if (!employee) {
    const error = new Error(
      "Employee not found or does not belong to your salon.",
    );

    error.statusCode = 404;
    throw error;
  }

  // Delete employee image
  if (
    employee.image &&
    fs.existsSync(path.join(__dirname, "../../", employee.image))
  ) {
    fs.unlinkSync(path.join(__dirname, "../../", employee.image));
  }

  // Delete linked employee login account
  if (employee.userId) {
    const userAccount = await User.findByPk(employee.userId);

    if (userAccount) {
      await userAccount.destroy();
    }
  }

  await employee.destroy();

  return true;
};

// =========================================================
// UPLOAD EMPLOYEE PHOTO
// =========================================================

exports.uploadEmployeePhoto = async (ownerId, employeeId, file) => {
  if (!file) {
    const error = new Error("No image file payload provided.");

    error.statusCode = 400;
    throw error;
  }

  const salon = await getSalonByOwner(ownerId);

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      salonId: salon.id,
    },
  });

  if (!employee) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const error = new Error(
      "Employee not found or does not belong to your salon.",
    );

    error.statusCode = 404;
    throw error;
  }

  if (
    employee.image &&
    fs.existsSync(path.join(__dirname, "../../", employee.image))
  ) {
    fs.unlinkSync(path.join(__dirname, "../../", employee.image));
  }

  const relativePath = `uploads/salons/${file.filename}`;

  await employee.update({
    image: relativePath,
  });

  return employee;
};

// =========================================================
// ASSIGN SERVICES TO EMPLOYEE
// =========================================================

exports.assignServicesToEmployee = async (ownerId, employeeId, serviceIds) => {
  const salon = await getSalonByOwner(ownerId);

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      salonId: salon.id,
    },
  });

  if (!employee) {
    const error = new Error(
      "Employee not found or does not belong to your salon.",
    );

    error.statusCode = 404;
    throw error;
  }

  const validServices = await Service.findAll({
    where: {
      id: serviceIds,
      salonId: salon.id,
    },
  });

  if (validServices.length !== serviceIds.length) {
    const error = new Error(
      "One or more service IDs are invalid or do not belong to your salon.",
    );

    error.statusCode = 400;
    throw error;
  }

  await employee.setServices(validServices);

  return employee;
};
// =========================================================
// EMPLOYEE SELF PROFILE
// =========================================================

// Get logged-in employee's profile
exports.getEmployeeProfile = async (userId) => {
  const employee = await Employee.findOne({
    where: {
      userId,
    },
    include: [
      {
        model: User,
        as: "userAccount",
        attributes: ["id", "fullName", "email", "phone", "role", "isActive"],
      },
      {
        model: Salon,
        as: "salon",
        attributes: ["id", "name"],
      },
      {
        model: Service,
        as: "services",
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!employee) {
    const error = new Error("Employee profile is not linked to this account.");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

// Update logged-in employee's own profile
// Update logged-in employee's own profile
exports.updateEmployeeProfile = async (userId, updateData) => {
  const employee = await Employee.findOne({
    where: {
      userId,
    },
    include: [
      {
        model: User,
        as: "userAccount",
      },
    ],
  });

  if (!employee) {
    const error = new Error("Employee profile is not linked to this account.");
    error.statusCode = 404;
    throw error;
  }

  const {
    name,
    fullName,
    phone,
    email,
    password,
    position,
    specialization,
    experienceYears,
    isAvailable,
  } = updateData;

  const newName = name || fullName;

  // ==========================================
  // UPDATE USER ACCOUNT
  // ==========================================

  if (employee.userAccount) {
    const userUpdateData = {};

    if (newName) {
      userUpdateData.fullName = newName;
    }

    if (phone && phone !== employee.userAccount.phone) {
      const phoneOwner = await User.findOne({
        where: {
          phone,
        },
      });

      if (phoneOwner && phoneOwner.id !== employee.userAccount.id) {
        const error = new Error(
          "Another user account already uses this phone number.",
        );
        error.statusCode = 409;
        throw error;
      }

      userUpdateData.phone = phone;
    }

    if (email !== undefined) {
      userUpdateData.email = email || null;
    }

    // Hash and update password only when a non-empty password is provided
    if (typeof password === "string" && password.trim() !== "") {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await employee.userAccount.update(userUpdateData);
    }
  }

  // ==========================================
  // UPDATE EMPLOYEE PROFILE
  // ==========================================

  const employeeUpdateData = {};

  if (newName) {
    employeeUpdateData.name = newName;
  }

  if (phone) {
    employeeUpdateData.phone = phone;
  }

  if (position !== undefined) {
    employeeUpdateData.position = position;
  }

  if (specialization !== undefined) {
    employeeUpdateData.specialization = specialization;
  }

  if (experienceYears !== undefined) {
    employeeUpdateData.experienceYears = experienceYears;
  }

  if (isAvailable !== undefined) {
    employeeUpdateData.isAvailable = isAvailable;
  }

  if (Object.keys(employeeUpdateData).length > 0) {
    await employee.update(employeeUpdateData);
  }

  return await exports.getEmployeeProfile(userId);
};
