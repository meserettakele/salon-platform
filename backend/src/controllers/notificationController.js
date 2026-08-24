const { Op } = require("sequelize");
const { Notification } = require("../models");

// GET /api/v1/notifications (Or /api/v1/customer/notifications)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toUpperCase() : "CUSTOMER";

    // Build conditional query:
    // - ADMINs get notifications linked to their userId OR role 'ADMIN'
    // - OWNERs get notifications linked to their userId OR role 'OWNER'
    // - EMPLOYEEs get notifications linked to their userId OR role 'EMPLOYEE'
    // - CUSTOMERs get notifications specific to their userId OR role 'CUSTOMER'
    let whereClause;
    if (userRole === "ADMIN") {
      whereClause = { [Op.or]: [{ userId }, { recipientRole: "ADMIN" }] };
    } else if (userRole === "OWNER") {
      whereClause = { [Op.or]: [{ userId }, { recipientRole: "OWNER" }] };
    } else if (userRole === "EMPLOYEE") {
      whereClause = { [Op.or]: [{ userId }, { recipientRole: "EMPLOYEE" }] };
    } else {
      whereClause = { [Op.or]: [{ userId }, { recipientRole: "CUSTOMER" }] };
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: 60,
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// PATCH /api/v1/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toUpperCase() : "CUSTOMER";

    let whereClause;
    if (userRole === "ADMIN") {
      whereClause = { id, [Op.or]: [{ userId }, { recipientRole: "ADMIN" }] };
    } else if (userRole === "OWNER") {
      whereClause = { id, [Op.or]: [{ userId }, { recipientRole: "OWNER" }] };
    } else if (userRole === "EMPLOYEE") {
      whereClause = { id, [Op.or]: [{ userId }, { recipientRole: "EMPLOYEE" }] };
    } else {
      whereClause = { id, [Op.or]: [{ userId }, { recipientRole: "CUSTOMER" }] };
    }

    await Notification.update({ isRead: true }, { where: whereClause });

    return res
      .status(200)
      .json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
};

// PATCH /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toUpperCase() : "CUSTOMER";

    let whereClause;
    if (userRole === "ADMIN") {
      whereClause = { isRead: false, [Op.or]: [{ userId }, { recipientRole: "ADMIN" }] };
    } else if (userRole === "OWNER") {
      whereClause = { isRead: false, [Op.or]: [{ userId }, { recipientRole: "OWNER" }] };
    } else if (userRole === "EMPLOYEE") {
      whereClause = { isRead: false, [Op.or]: [{ userId }, { recipientRole: "EMPLOYEE" }] };
    } else {
      whereClause = { isRead: false, [Op.or]: [{ userId }, { recipientRole: "CUSTOMER" }] };
    }

    await Notification.update(
      { isRead: true },
      { where: whereClause },
    );

    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("Failed to update all notifications:", error);
    return res.status(500).json({ message: "Failed to update notifications." });
  }
};

const createNotification = require("../utils/createNotification");

// POST /api/v1/notifications/contact (Public Contact Inquiry Message Submission)
exports.submitContactMessage = async (req, res) => {
  try {
    const { fullName, email, phone, companyName, message } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full Name, email address, and phone number are required.",
      });
    }

    const title = `💬 Message from ${fullName}${companyName ? ` (${companyName})` : ""}`;
    const formattedMessage = `👤 *Sender:* ${fullName}\n📧 *Email:* \`${email}\`\n📱 *Phone:* \`${phone}\`${companyName ? `\n🏢 *Company:* ${companyName}` : ""}\n\n💬 *Message:*\n${message || "No message body provided."}`;

    const notification = await createNotification({
      title,
      message: formattedMessage,
      type: "MESSAGE",
      recipientRole: "ADMIN",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent to the Veloura administration.",
      notification,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit message to administration.",
    });
  }
};

// POST /api/v1/notifications/admin/send (Admin creates & sends custom notifications)
exports.createAdminNotification = async (req, res) => {
  try {
    const { title, message, targetUserId, targetRole, appointmentId } =
      req.body;

    const notification = await createNotification({
      title,
      message,
      userId: targetUserId || null,
      recipientRole: targetRole || null,
      bookingId: appointmentId || null,
      type: "SYSTEM",
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ message: "Failed to create notification." });
  }
};


