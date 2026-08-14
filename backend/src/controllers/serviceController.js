const serviceService = require("../services/serviceService");

// ADD SERVICE
exports.addService = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // req.body contains: { name, categoryId, price, duration, description, employeeIds }
    const newService = await serviceService.createService(ownerId, req.body);

    return res.status(201).json({
      success: true,
      message: "Service created successfully.",
      data: newService,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SERVICE
// controllers/serviceController.js

exports.updateService = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const serviceId = req.params.id;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID parameter missing.",
      });
    }

    const updatedService = await serviceService.updateService(
      ownerId,
      serviceId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      data: updatedService,
    });
  } catch (error) {
    console.error("UPDATE CONTROLLER ERROR:", error);

    // Always return a JSON response so Response tab is never empty
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save service updates.",
    });
  }
};
exports.viewServices = async (req, res) => {
  try {
    const services = await serviceService.getServices(req.user.id);

    res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await serviceService.deleteService(req.user.id, req.params.id);

    res.json({
      success: true,
      message: "Service deleted.",
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const service = await serviceService.uploadServiceImage(
      req.user.id,
      req.params.id,
      req.file,
    );

    res.json({
      success: true,
      data: service,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
// Add this inside controllers/serviceController.js
exports.getCategories = async (req, res) => {
  try {
    const categories = await serviceService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
