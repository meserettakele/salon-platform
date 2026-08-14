const { Op } = require("sequelize");
const { Notification } = require("../models");

// GET /api/v1/notifications (Or /api/v1/customer/notifications)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toUpperCase() : "CUSTOMER";

    // Build conditional query:
    // - ADMINs get notifications linked to their userId OR role 'ADMIN'
    // - CUSTOMERs & OWNERs & EMPLOYEEs get notifications specific to their userId
    let whereClause;
    if (userRole === "ADMIN") {
      whereClause = { [Op.or]: [{ userId }, { recipientRole: "ADMIN" }] };
    } else if (userRole === "OWNER") {
      whereClause = { [Op.or]: [{ userId }, { recipientRole: "OWNER" }] };
    } else {
      whereClause = { userId };
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: 50,
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

    await Notification.update({ isRead: true }, { where: { id, userId } });

    return res
      .status(200)
      .json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notification." });
  }
};

// PATCH /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } },
    );

    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notifications." });
  }
};

// POST /api/v1/notifications/admin/send (Admin creates & sends custom notifications)
exports.createAdminNotification = async (req, res) => {
  try {
    const { title, message, targetUserId, targetRole, appointmentId } =
      req.body;

    const notification = await Notification.create({
      title,
      message,
      userId: targetUserId || null,
      recipientRole: targetRole || null,
      appointmentId: appointmentId || null,
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
