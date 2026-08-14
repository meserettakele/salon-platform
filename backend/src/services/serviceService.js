const { Service, Salon, Category, Employee } = require("../models");
const fs = require("fs");
const path = require("path");

const getSalonByOwner = async (ownerId) => {
  const salon = await Salon.findOne({
    where: { ownerId },
  });

  if (!salon) {
    throw {
      statusCode: 404,
      message: "Salon not found.",
    };
  }

  return salon;
};

// CREATE SERVICE
exports.createService = async (ownerId, data) => {
  const salon = await getSalonByOwner(ownerId);
  const category = await Category.findByPk(data.categoryId);

  if (!category) {
    throw {
      statusCode: 404,
      message: "Category not found.",
    };
  }

  // 1. Create the base service
  const service = await Service.create({
    ...data,
    salonId: salon.id,
  });

  // 2. Link assigned employees (e.g., data.employeeIds = [1, 2])
  if (
    data.employeeIds &&
    Array.isArray(data.employeeIds) &&
    data.employeeIds.length > 0
  ) {
    await service.setEmployees(data.employeeIds);
  }

  return service;
};

// GET ALL SERVICES FOR OWNER
exports.getServices = async (ownerId) => {
  const salon = await getSalonByOwner(ownerId);

  return await Service.findAll({
    where: {
      salonId: salon.id,
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: Employee,
        as: "employees", // Ensure this alias matches your models/index.js (or remove "as" if not aliased)
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// UPDATE SERVICE
exports.updateService = async (ownerId, serviceId, data) => {
  const cleanId = Number(serviceId);

  if (!cleanId || isNaN(cleanId)) {
    throw new Error("Invalid service ID provided.");
  }

  // 1. Fetch service record
  const service = await Service.findByPk(cleanId);

  if (!service) {
    throw new Error("Service not found.");
  }

  // 2. Build explicit update object with ONLY direct columns
  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = String(data.name);
  if (data.description !== undefined)
    updatePayload.description = String(data.description);
  if (data.price !== undefined) updatePayload.price = Number(data.price);
  if (data.duration !== undefined)
    updatePayload.duration = Number(data.duration);
  if (data.categoryId !== undefined)
    updatePayload.categoryId = Number(data.categoryId);
  if (data.image || data.imageUrl)
    updatePayload.image = String(data.image || data.imageUrl);

  // 3. Save updates to database
  await service.update(updatePayload);

  // 4. Handle employee association safely inside try/catch so it never crashes the server
  const employeeIds = data.employeeIds || data.assignedEmployeeIds;
  if (
    Array.isArray(employeeIds) &&
    typeof service.setEmployees === "function"
  ) {
    try {
      const cleanEmployeeIds = employeeIds
        .map((item) => (typeof item === "object" ? item.id : Number(item)))
        .filter((id) => !isNaN(id) && id > 0);

      await service.setEmployees(cleanEmployeeIds);
    } catch (associationError) {
      console.warn("Skipped syncing employees:", associationError.message);
    }
  }

  return service;
};

// DELETE SERVICE
exports.deleteService = async (ownerId, serviceId) => {
  const salon = await getSalonByOwner(ownerId);

  const service = await Service.findOne({
    where: {
      id: serviceId,
      salonId: salon.id,
    },
  });

  if (!service) {
    throw {
      statusCode: 404,
      message: "Service not found.",
    };
  }

  await service.destroy();
  return true;
};

// IMAGE UPLOAD
exports.uploadServiceImage = async (ownerId, serviceId, file) => {
  const salon = await getSalonByOwner(ownerId);

  const service = await Service.findOne({
    where: {
      id: serviceId,
      salonId: salon.id,
    },
  });

  if (!service) {
    throw {
      statusCode: 404,
      message: "Service not found.",
    };
  }

  const imagePath = `uploads/salons/${file.filename}`;

  await service.update({
    image: imagePath,
  });

  return service;
};

// GET CATEGORIES
exports.getCategories = async () => {
  return await Category.findAll({
    attributes: ["id", "name", "description"],
    order: [["name", "ASC"]],
  });
};

// GET SERVICES BY SALON ID
exports.getServicesBySalon = async (salonId) => {
  return await Service.findAll({
    where: { salonId },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: Employee,
        as: "employees",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};
