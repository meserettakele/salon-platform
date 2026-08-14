const adminService = require("../services/adminService");

exports.addCategory = async (req, res) => {
  try {
    const data = await adminService.createCategory(req.body);
    return res
      .status(201)
      .json({ success: true, message: "Category created successfully.", data });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const data = await adminService.updateCategory(req.params.id, req.body);
    return res
      .status(200)
      .json({ success: true, message: "Category updated successfully.", data });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.removeCategory = async (req, res) => {
  try {
    await adminService.deleteCategory(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
      data: {},
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const data = await adminService.fetchCategories();
    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully.",
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.addNewSalon = async (req, res) => {
  try {
    const data = await adminService.registerSalonProfile(req.body);
    return res.status(201).json({
      success: true,
      message: "Salon structural shell registered successfully.",
      data,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.getAllSalons = async (req, res) => {
  try {
    const data = await adminService.fetchSalons();
    return res
      .status(200)
      .json({ success: true, message: "Salons retrieved successfully.", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSalonStatus = async (req, res) => {
  try {
    const data = await adminService.modifySalonStatus(
      req.params.id,
      req.body.status,
    );
    return res.status(200).json({
      success: true,
      message: "Salon availability state updated successfully.",
      data,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.addNewOwner = async (req, res) => {
  try {
    const data = await adminService.createOwnerAccount(req.body);
    return res.status(201).json({
      success: true,
      message:
        "Owner account generated successfully within administrative registry.",
      data,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.assignOwnerToSalon = async (req, res) => {
  try {
    const { salonId, ownerId } = req.body;
    const data = await adminService.bindOwnerToSalon(salonId, ownerId);
    return res.status(200).json({
      success: true,
      message: "Salon owner assignment completed successfully.",
      data,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.listAllBookings = async (req, res) => {
  try {
    const data = await adminService.fetchAllBookings();
    return res.status(200).json({
      success: true,
      message: "Global system bookings log retrieved.",
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const data = await adminService.fetchAllUsers();
    return res.status(200).json({
      success: true,
      message: "User directory retrieved successfully.",
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPlatformReports = async (req, res) => {
  try {
    const data = await adminService.compileSystemMetrics();
    return res.status(200).json({
      success: true,
      message: "Platform metric dashboard data retrieved.",
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- NEW PROFILE CONTROLLERS ---

exports.getAdminProfile = async (req, res) => {
  try {
    const data = await adminService.fetchAdminProfile(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Admin profile retrieved successfully.",
      data,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
exports.updateAdminProfile = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const data = await adminService.modifyAdminProfile(req.user.id, {
      fullName,
      phone,
      email,
      password,
      profileImage: req.file,
    });

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
      data,
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
