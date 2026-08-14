const customerService = require("../services/customerService");
const createNotification = require("../utils/createNotification");
const { Salon, Employee } = require("../models");

// =========================================================================
// ===================== OWNER ROLE CUSTOMER OPERATIONS ====================
// =========================================================================

exports.viewCustomers = async (req, res) => {
  try {
    const customers = await customerService.getSalonCustomers(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Customer records retrieved successfully.",
      data: customers,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.viewCustomerHistory = async (req, res) => {
  try {
    const history = await customerService.getCustomerHistory(
      req.user.id,
      req.params.customerId,
    );
    return res.status(200).json({
      success: true,
      message: "Customer booking history fetched successfully.",
      data: history,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

// =========================================================================
// =================== CUSTOMER ROLE PROFILE & DISCOVERY ===================
// =========================================================================

exports.getProfile = async (req, res) => {
  try {
    const profile = await customerService.getCustomerProfile(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Profile fetched.",
      data: profile,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await customerService.updateCustomerProfile(
      req.user.id,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const imagePath = `/uploads/customers/${req.file.filename}`;

    const profile = await customerService.updateCustomerProfileImage(
      req.user.id,
      imagePath,
    );

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      data: profile,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new passwords are required.",
      });
    }

    await customerService.changeCustomerPassword(
      req.user.id,
      oldPassword,
      newPassword,
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.getSalons = async (req, res) => {
  try {
    const { categoryId, city, location, search } = req.query;

    const salons = await customerService.browseAndSearchSalons({
      categoryId,
      city,
      location,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Salons retrieved successfully.",
      data: salons,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.getSalonDetails = async (req, res) => {
  try {
    const salonDetails = await customerService.getDetailedSalonCatalog(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message: "Salon catalog fetched.",
      data: salonDetails,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

// =========================================================================
// ==================== EMPLOYEES BY SERVICES =============================
// =========================================================================

exports.getEmployeesByServices = async (req, res) => {
  try {
    const salonId = req.params.id;
    const serviceIds = req.query.serviceIds
      ? req.query.serviceIds.split(",").map(Number)
      : [];

    const employees = await customerService.getEmployeesByServices(
      salonId,
      serviceIds,
    );

    return res.status(200).json({
      success: true,
      message: "Employees grouped by services retrieved successfully.",
      data: employees,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

// =========================================================================
// ==================== CUSTOMER ROLE BOOKING ACTIONS =====================
// =========================================================================

exports.bookAppointment = async (req, res) => {
  try {
    const booking = await customerService.createBookingRequest(
      req.user.id,
      req.body,
    );

    // 🔔 TRIGGER NOTIFICATION: BOOKING SUBMITTED (To Customer)
    await createNotification({
      userId: req.user.id,
      title: "Booking Submitted",
      message: "Your booking request has been sent to the salon.",
      type: "BOOKING_SUBMITTED",
      bookingId: booking?.id || (Array.isArray(booking) ? booking[0]?.id : null),
    });

    // 🔔 TRIGGER NOTIFICATION TO SALON OWNER & ASSIGNED EMPLOYEES
    try {
      const createdBookings = Array.isArray(booking) ? booking : [booking];
      
      for (const b of createdBookings) {
        if (!b) continue;
        const sId = b.salonId || req.body.salonId;
        if (sId) {
          const salon = await Salon.findByPk(sId);
          if (salon && salon.ownerId) {
            await createNotification({
              userId: salon.ownerId,
              title: "New Booking Request",
              message: `New booking request #${b.id || ""} received for your salon.`,
              type: "BOOKING_CREATED",
              bookingId: b.id,
            });
          }
        }

        if (b.employeeId) {
          const emp = await Employee.findByPk(b.employeeId);
          if (emp && emp.userId) {
            await createNotification({
              userId: emp.userId,
              title: "New Appointment Assigned",
              message: `You have been assigned to appointment #${b.id || ""}.`,
              type: "BOOKING_ASSIGNED",
              bookingId: b.id,
            });
          }
        }
      }
    } catch (notifErr) {
      console.error("Failed to dispatch owner/employee notifications:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully.",
      data: booking,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.viewBookings = async (req, res) => {
  try {
    const { type } = req.query;

    const bookings = await customerService.getCustomerBookings(
      req.user.id,
      type,
    );

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully.",
      data: bookings,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await customerService.cancelBookingRequest(
      req.user.id,
      req.params.id,
    );

    // 🔔 TRIGGER NOTIFICATION: BOOKING CANCELLED BY CUSTOMER
    await createNotification({
      userId: req.user.id,
      title: "Booking Cancelled",
      message: "Your booking request has been cancelled.",
      type: "BOOKING_CANCELLED",
      bookingId: req.params.id,
    });

    return res
      .status(200)
      .json({ success: true, message: "Booking cancelled successfully." });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await customerService.getAllCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    console.log("AVAILABLE SLOT CONTROLLER HIT:", req.query);

    const { appointmentDate, services } = req.query;

    let parsedServices = [];

    try {
      parsedServices = services ? JSON.parse(services) : [];
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid services availability data.",
      });
    }

    const slots = await customerService.getAvailableSlots({
      appointmentDate,
      services: parsedServices,
    });

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};
