const employeeService = require("../services/employeeService");

exports.addEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(
      req.user.id,
      req.body,
    );
    return res.status(201).json({
      success: true,
      message: "Employee added successfully.",
      data: employee,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.viewEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getEmployees(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Employees retrieved successfully.",
      data: employees,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await employeeService.updateEmployee(
      req.user.id,
      req.params.id,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Employee details updated successfully.",
      data: employee,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await employeeService.deleteEmployee(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Employee successfully removed from system.",
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const employee = await employeeService.uploadEmployeePhoto(
      req.user.id,
      req.params.id,
      req.file,
    );
    return res.status(200).json({
      success: true,
      message: "Employee profile photo updated successfully.",
      data: employee,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.assignServices = async (req, res) => {
  try {
    const employee = await employeeService.assignServicesToEmployee(
      req.user.id,
      req.params.id,
      req.body.serviceIds,
    );
    return res.status(200).json({
      success: true,
      message: "Services assigned to employee successfully.",
      data: employee,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
// =====================================================
// EMPLOYEE SELF PROFILE
// =====================================================

exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Employee profile retrieved successfully.",
      data: employee,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateEmployeeProfile = async (req, res) => {
  try {
    const employee = await employeeService.updateEmployeeProfile(
      req.user.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Employee profile updated successfully.",
      data: employee,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
