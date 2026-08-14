// Change "Catagory" to "Category" here:
const { Salon, BusinessHour, Category, User } = require("../models");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
/**
 * Resolves and retrieves the salon entity associated with the authenticated owner.
 * Hydrates standard attributes and pulls associated data blocks from the business_hours table.
 */
exports.getSalonByOwnerId = async (ownerId) => {
  const salon = await Salon.findOne({
    where: { ownerId },
    include: [
      {
        model: BusinessHour,
        as: "businessHours",
        attributes: ["id", "day", "openingTime", "closingTime", "isClosed"],
      },
    ],
  });

  if (!salon) {
    const error = new Error(
      "Operational Profile Error: No registered salon is currently assigned to this Owner account.",
    );
    error.statusCode = 404;
    throw error;
  }

  return salon;
};

/**
 * Safely updates text and coordinate-independent parameters of an active salon.
 */
exports.updateSalonProfile = async (ownerId, updateData) => {
  console.log("RECEIVED SALON DATA:", JSON.stringify(updateData, null, 2));
  const salon = await this.getSalonByOwnerId(ownerId);

  // Filter incoming values to guarantee absolute immutability of system rules
  const protectedFields = [
    "id",
    "ownerId",
    "status",
    "latitude",
    "longitude",
    "country",
    "createdAt",
    "updatedAt",
  ];
  protectedFields.forEach((field) => delete updateData[field]);

  // Map logoUrl payload key to logo column name
  if (updateData.logoUrl !== undefined) {
    updateData.logo = updateData.logoUrl;
    delete updateData.logoUrl;
  }

  // Synchronize Many-to-Many associations safely
  if (updateData.categories && Array.isArray(updateData.categories)) {
    await salon.setCategories(updateData.categories);
    delete updateData.categories;
  }

  await salon.update(updateData);
  return salon;
};

/**
 * Executes high-performance single-row upsert operations to synchronize schedule configurations.
 */
exports.updateSalonBusinessHours = async (ownerId, scheduleArray) => {
  const salon = await this.getSalonByOwnerId(ownerId);
  const hoursToUpdate = Array.isArray(scheduleArray) ? scheduleArray : [];

  return await sequelize.transaction(async (t) => {
    for (const item of hoursToUpdate) {
      const rawDay = item.day || item.dayOfWeek || item.dayLabel || "";
      if (!rawDay) continue;

      // Normalize to title case: "MONDAY" → "Monday", "monday" → "Monday"
      const normalized =
        rawDay.trim().charAt(0).toUpperCase() +
        rawDay.trim().slice(1).toLowerCase();
      const targetDay = normalized;

      // Extract opening and closing times safely
      const openTimeVal = item.openingTime || item.openTime || "08:30";
      const closeTimeVal = item.closingTime || item.closeTime || "18:00";

      // CRITICAL FIX: Explicitly evaluate if the day is closed
      // If isOpen is true, isClosed MUST be false.
      let isClosedVal = false;
      if (item.isOpen !== undefined) {
        isClosedVal = !item.isOpen;
      } else if (item.isClosed !== undefined) {
        isClosedVal = Boolean(item.isClosed);
      }

      const record = await BusinessHour.findOne({
        where: { salonId: salon.id, day: targetDay },
        transaction: t,
      });

      const updateData = {
        openingTime: isClosedVal ? null : openTimeVal,
        closingTime: isClosedVal ? null : closeTimeVal,
        isClosed: isClosedVal,
      };

      if (record) {
        await record.update(updateData, { transaction: t });
      } else {
        await BusinessHour.create(
          {
            salonId: salon.id,
            day: targetDay,
            ...updateData,
          },
          { transaction: t },
        );
      }
    }

    return await Salon.findByPk(salon.id, {
      include: [
        {
          model: BusinessHour,
          as: "businessHours",
          attributes: ["id", "day", "openingTime", "closingTime", "isClosed"],
        },
      ],
      transaction: t,
    });
  });
};

exports.getCategories = async () => {
  try {
    const categories = await Category.findAll({
      // Try fetching all attributes first to rule out missing column errors
      order: [["id", "ASC"]],
    });
    return categories;
  } catch (error) {
    console.error("Sequelize Query Error inside getCategories:", error);
    throw error;
  }
};
// =========================================================
// OWNER PROFILE
// =========================================================

exports.getOwnerProfile = async (ownerId) => {
  const user = await User.findOne({
    where: {
      id: ownerId,
      role: "OWNER",
    },
    attributes: [
      "id",
      "fullName",
      "email",
      "phone",
      "profileImage",
      "createdAt",
    ],
    include: [
      {
        model: Salon,
        as: "salon",
        attributes: ["id", "name", "address"],
        required: false,
      },
    ],
  });

  if (!user) {
    const error = new Error("Owner profile not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.updateOwnerProfile = async (ownerId, updateData, file) => {
  const user = await User.findOne({
    where: {
      id: ownerId,
      role: "OWNER",
    },
  });

  if (!user) {
    const error = new Error("Owner profile not found.");
    error.statusCode = 404;
    throw error;
  }

  const allowedUpdates = {};

  if (updateData.fullName !== undefined) {
    allowedUpdates.fullName = updateData.fullName;
  }

  if (updateData.phone !== undefined) {
    allowedUpdates.phone = updateData.phone;
  }

  if (file) {
    if (
      user.profileImage &&
      !user.profileImage.startsWith("http://") &&
      !user.profileImage.startsWith("https://")
    ) {
      const oldImagePath = path.join(__dirname, "../../", user.profileImage);

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    allowedUpdates.profileImage = `uploads/salons/${file.filename}`;
  }

  await user.update(allowedUpdates);

  return await exports.getOwnerProfile(ownerId);
};

exports.changeOwnerPassword = async (ownerId, oldPassword, newPassword) => {
  const user = await User.findOne({
    where: {
      id: ownerId,
      role: "OWNER",
    },
  });

  if (!user) {
    const error = new Error("Owner profile not found.");
    error.statusCode = 404;
    throw error;
  }

  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 401;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  return true;
};
