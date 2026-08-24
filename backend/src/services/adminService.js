const {
  Category,
  Salon,
  User,
  Appointment,
  Payment,
  Employee,
  Service,
  sequelize,
} = require("../models");
const bcrypt = require("bcryptjs");
const createNotification = require("../utils/createNotification");

// --- Category CRUD Matrix ---
exports.createCategory = async (data) => {
  const conflict = await Category.findOne({ where: { name: data.name } });
  if (conflict) {
    const error = new Error("A category with this name already exists.");
    error.statusCode = 409;
    throw error;
  }
  const category = await Category.create({
    name: data.name,
    description: data.description,
  });

  // 🔔 Notify Admin of newly created category
  await createNotification({
    recipientRole: "ADMIN",
    title: "🏷️ Service Category Added",
    message: `A new beauty service category '${category.name}' has been added to the platform catalog.`,
    type: "SYSTEM",
  });

  return category;
};

exports.updateCategory = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const error = new Error("Target category not found.");
    error.statusCode = 404;
    throw error;
  }
  if (data.name) {
    const conflict = await Category.findOne({ where: { name: data.name } });
    if (conflict && conflict.id !== parseInt(id)) {
      const error = new Error(
        "Category name update conflicts with an existing category.",
      );
      error.statusCode = 409;
      throw error;
    }
  }
  return await category.update(data);
};

exports.deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const error = new Error("Target category not found.");
    error.statusCode = 404;
    throw error;
  }
  const catName = category.name;
  await category.destroy();

  // 🔔 Notify Admin of deleted category
  await createNotification({
    recipientRole: "ADMIN",
    title: "🗑️ Service Category Removed",
    message: `Category '${catName}' was removed from the platform catalog.`,
    type: "SYSTEM",
  });

  return true;
};

exports.fetchCategories = async () => {
  return await Category.findAll();
};

// --- Salon & Structural Lifecycle Engine ---
exports.registerSalonProfile = async (salonData) => {
  const salon = await Salon.create({
    ...salonData,
    latitude: salonData.latitude || 0.0,
    longitude: salonData.longitude || 0.0,
    status: salonData.status || "ACTIVE",
  });

  // If ownerId was provided on creation, send comprehensive notification
  if (salon.ownerId) {
    const owner = await User.findByPk(salon.ownerId);
    await createNotification({
      recipientRole: "ADMIN",
      title: "New Salon Registered",
      message:
        `🏪 *Salon:* ${salon.name}\n` +
        `📍 *Location:* ${salon.address || "Main branch"}, ${salon.subCity ? `${salon.subCity}, ` : ""}${salon.city || "Addis Ababa"}\n` +
        `📞 *Contact:* ${salon.phone || owner?.phone || "N/A"}\n` +
        `👤 *Owner:* ${owner?.fullName || "Assigned Owner"}\n` +
        `📱 *Owner Phone:* \`${owner?.phone || "N/A"}\`\n` +
        `📧 *Owner Email:* ${owner?.email || "N/A"}\n` +
        `⏳ *Status:* ${salon.status || "ACTIVE"}`,
      type: "SALON_REGISTRATION",
    });
  }

  return salon;
};

exports.fetchSalons = async () => {
  return await Salon.findAll({
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "fullName", "phone", "email"],
      },
    ],
  });
};

exports.modifySalonStatus = async (id, targetStatus) => {
  const allowed = ["PENDING", "ACTIVE", "SUSPENDED"];
  if (!allowed.includes(targetStatus)) {
    const error = new Error("Invalid status update value provided.");
    error.statusCode = 400;
    throw error;
  }
  const salon = await Salon.findByPk(id, {
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "fullName", "phone", "email"],
      },
    ],
  });
  if (!salon) {
    const error = new Error("Target salon profile not found.");
    error.statusCode = 404;
    throw error;
  }
  salon.status = targetStatus;
  await salon.save();

  const isSuspended = targetStatus === "SUSPENDED";
  const isActive = targetStatus === "ACTIVE";

  // 🔔 1. Clear, structured confirmation to Admin
  const adminTitle = isSuspended
    ? "⛔ Salon Suspended"
    : isActive
    ? "✅ Salon Activated & Approved"
    : "📋 Salon Status: PENDING";

  const adminMsg = isSuspended
    ? `You have suspended *${salon.name}*.\n\n` +
      `🏪 *Salon:* ${salon.name}\n` +
      `👤 *Owner:* ${salon.owner?.fullName || "Owner"} (\`${salon.owner?.phone || "N/A"}\`)\n` +
      `📍 *Location:* ${salon.city || "Addis Ababa"}, ${salon.address || "Main branch"}\n` +
      `⚠️ *Action:* The salon is now suspended. Operations, discovery, and booking services are temporarily disabled.`
    : isActive
    ? `You have approved and activated *${salon.name}*.\n\n` +
      `🏪 *Salon:* ${salon.name}\n` +
      `👤 *Owner:* ${salon.owner?.fullName || "Owner"} (\`${salon.owner?.phone || "N/A"}\`)\n` +
      `📍 *Location:* ${salon.city || "Addis Ababa"}, ${salon.address || "Main branch"}\n` +
      `🎉 *Status:* ACTIVE. The salon is live and accessible to customers on Veloura.`
    : `Salon '${salon.name}' has been set to PENDING by administration.`;

  await createNotification({
    recipientRole: "ADMIN",
    title: adminTitle,
    message: adminMsg,
    type: "SALON_STATUS",
  });

  // 🔔 2. Clear, structured alert to Salon Owner in their Bot & Dashboard Bell
  if (salon.ownerId) {
    const ownerTitle = isSuspended
      ? "⛔ Salon Account Suspended"
      : isActive
      ? "✅ Salon Activated & Approved!"
      : "📋 Salon Status Updated";

    const ownerMsg = isSuspended
      ? `Your salon *${salon.name}* has been suspended by the platform administrator.\n\n` +
        `🏪 *Salon:* ${salon.name}\n` +
        `📝 *Status:* SUSPENDED\n` +
        `⚠️ *Notice:* Your salon is currently inaccessible on the platform. Bookings and salon operations are temporarily disabled.\n\n` +
        `_If you believe this is an error or need assistance, please contact platform support._`
      : isActive
      ? `Congratulations! Your salon *${salon.name}* is now active and approved on Veloura.\n\n` +
        `🏪 *Salon:* ${salon.name}\n` +
        `🎉 *Status:* ACTIVE\n` +
        `✨ *Notice:* Customers can now discover your salon, view your services, and book appointments online. Welcome aboard!`
      : `Your salon '${salon.name}' status has been updated to PENDING on Veloura.`;

    await createNotification({
      userId: salon.ownerId,
      recipientRole: "OWNER",
      title: ownerTitle,
      message: ownerMsg,
      type: "SALON_STATUS",
    });
  }

  return salon;
};

// --- Standalone Owner Registration Engine ---
exports.createOwnerAccount = async (ownerData) => {
  const checkConflict = await User.findOne({
    where: { phone: ownerData.phone },
  });
  if (checkConflict) {
    const error = new Error(
      "Conflict: An identity profile bound to this phone number identifier already exists.",
    );
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(ownerData.password, salt);

  const newUser = await User.create({
    fullName: ownerData.fullName,
    email: ownerData.email || null,
    phone: ownerData.phone,
    password: hash,
    role: "OWNER",
    isActive: true,
  });

  const response = newUser.toJSON();
  delete response.password;
  return response;
};

// --- Transactional Owner Account & Salon Assignment Matrix ---
exports.bindOwnerToSalon = async (salonId, ownerId) => {
  return await sequelize.transaction(async (t) => {
    const targetUser = await User.findByPk(ownerId, { transaction: t });
    if (!targetUser || targetUser.role !== "OWNER") {
      const error = new Error(
        "Target user profile is missing or is not registered with an OWNER role.",
      );
      error.statusCode = 400;
      throw error;
    }

    const ownerConflict = await Salon.findOne({
      where: { ownerId },
      transaction: t,
    });
    if (ownerConflict && ownerConflict.id !== parseInt(salonId)) {
      const error = new Error(
        "This Owner is already explicitly assigned to manage another salon profile.",
      );
      error.statusCode = 409;
      throw error;
    }

    const salon = await Salon.findByPk(salonId, { transaction: t });
    if (!salon) {
      const error = new Error("Target salon profile not found.");
      error.statusCode = 404;
      throw error;
    }

    if (salon.ownerId && salon.ownerId !== parseInt(ownerId)) {
      const error = new Error(
        "This salon profile is already explicitly assigned to another owner.",
      );
      error.statusCode = 409;
      throw error;
    }

    salon.ownerId = ownerId;
    await salon.save({ transaction: t });

    // 🔔 Single comprehensive notification to Admin with all salon & owner info
    await createNotification({
      recipientRole: "ADMIN",
      title: "🏢 New Salon Registered",
      message:
        `🏪 *Salon:* ${salon.name}\n` +
        `📍 *Location:* ${salon.address || "Main branch"}, ${salon.subCity ? `${salon.subCity}, ` : ""}${salon.city || "Addis Ababa"}\n` +
        `📞 *Contact:* ${salon.phone || targetUser.phone || "N/A"}\n` +
        `👤 *Owner:* ${targetUser.fullName}\n` +
        `📱 *Owner Phone:* \`${targetUser.phone}\`\n` +
        `📧 *Owner Email:* ${targetUser.email || "N/A"}\n` +
        `⏳ *Status:* ${salon.status || "ACTIVE"}`,
      type: "SALON_REGISTRATION",
    });

    // 🔔 Welcome Notification to Owner
    await createNotification({
      userId: targetUser.id,
      recipientRole: "OWNER",
      title: "🏢 Welcome to Veloura!",
      message: `Your salon profile '${salon.name}' has been created and linked to your account. You can now manage your services, specialists, and bookings.`,
      type: "SYSTEM",
    });

    return salon;
  });
};

// --- Hydrated Platform Monitoring Actions ---
exports.fetchAllBookings = async () => {
  return await Appointment.findAll({
    attributes: [
      "id",
      "appointmentDate",
      "appointmentTime",
      "bookingStatus",
      "paymentStatus",
      "bookedPrice",
      "createdAt",
    ],
    include: [
      { model: User, as: "customer", attributes: ["fullName", "phone"] },
      { model: Salon, as: "salon", attributes: ["name", "city"] },
      { model: Employee, as: "employee", attributes: ["name", "position"] },
      { model: Service, as: "service", attributes: ["name", "price"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// --- User Directory Engine ---
exports.fetchAllUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
};

// --- Live Database Reporting Aggregations ---
exports.compileSystemMetrics = async () => {
  const { Op } = require("sequelize");

  const totalUsers = await User.count();
  const totalSalons = await Salon.count();
  const totalBookings = await Appointment.count();

  const activeSalons = await Salon.count({ where: { status: "ACTIVE" } });
  const pendingSalons = await Salon.count({ where: { status: "PENDING" } });

  const completedAppointments = await Appointment.count({
    where: { bookingStatus: "COMPLETED" },
  });

  // Primary: sum from Payment table (PAID records)
  const paymentRevenueResult = await Payment.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("amount")), "totalRevenue"],
    ],
    where: { paymentStatus: "PAID" },
  });
  const paymentRevenue =
    paymentRevenueResult && paymentRevenueResult.getDataValue("totalRevenue")
      ? parseFloat(paymentRevenueResult.getDataValue("totalRevenue"))
      : 0.0;

  // Fallback: sum bookedPrice from Appointment where paymentStatus = 'PAID'
  // This covers systems where payments are tracked on the Appointment row directly
  const appointmentRevenueResult = await Appointment.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("bookedPrice")), "totalRevenue"],
    ],
    where: { paymentStatus: "PAID" },
  });
  const appointmentRevenue =
    appointmentRevenueResult &&
    appointmentRevenueResult.getDataValue("totalRevenue")
      ? parseFloat(appointmentRevenueResult.getDataValue("totalRevenue"))
      : 0.0;

  // Also count COMPLETED bookings revenue as additional fallback
  const completedRevenueResult = await Appointment.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("bookedPrice")), "totalRevenue"],
    ],
    where: {
      bookingStatus: "COMPLETED",
      paymentStatus: { [Op.in]: ["PAID", "UNPAID"] },
    },
  });
  const completedRevenue =
    completedRevenueResult &&
    completedRevenueResult.getDataValue("totalRevenue")
      ? parseFloat(completedRevenueResult.getDataValue("totalRevenue"))
      : 0.0;

  // Use whichever source reports the highest revenue
  const totalRevenue = Math.max(
    paymentRevenue,
    appointmentRevenue,
    completedRevenue
  );

  return {
    summary: { totalUsers, totalSalons, totalBookings },
    breakdown: {
      activeSalons,
      pendingSalons,
      completedBookings: completedAppointments,
      cancelledBookings: await Appointment.count({ where: { bookingStatus: "CANCELLED" } }),
      confirmedBookings: await Appointment.count({ where: { bookingStatus: "ACCEPTED" } }),
      revenueEtb: totalRevenue,
    },
  };
};

// --- Admin Profile Management Engine ---
exports.fetchAdminProfile = async (adminId) => {
  const admin = await User.findByPk(adminId, {
    attributes: { exclude: ["password"] },
  });
  if (!admin) {
    const error = new Error("Admin profile not found.");
    error.statusCode = 404;
    throw error;
  }
  return admin;
};

exports.modifyAdminProfile = async (adminId, updateData) => {
  const admin = await User.findByPk(adminId);
  if (!admin) {
    const error = new Error("Admin profile not found.");
    error.statusCode = 404;
    throw error;
  }

  // 1. Phone number update check
  if (updateData.phone && updateData.phone !== admin.phone) {
    const phoneConflict = await User.findOne({
      where: { phone: updateData.phone },
    });

    if (phoneConflict) {
      const error = new Error("Phone number is already taken by another user.");
      error.statusCode = 409;
      throw error;
    }

    admin.phone = updateData.phone;
  }

  // 2. Safe string updates
  if (updateData.fullName) admin.fullName = updateData.fullName;
  if (updateData.email !== undefined) admin.email = updateData.email || null;

  // 3. Profile image update
  if (updateData.profileImage) {
    admin.profileImage = `/uploads/salons/${updateData.profileImage.filename}`;
  }

  // 4. ONLY update password if a non-empty string was actually typed
  if (updateData.password && updateData.password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(updateData.password, salt);
  }

  await admin.save();

  const updatedAdmin = admin.toJSON();
  delete updatedAdmin.password;
  return updatedAdmin;
};
