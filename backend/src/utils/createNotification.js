// src/utils/createNotification.js
const Notification = require("../models/Notification");

/**
 * Creates a notification record.
 * @param {Object} params
 * @param {number}  [params.userId]        - The ID of the target user (nullable if recipientRole is set)
 * @param {string}  [params.recipientRole] - Role-targeted notification (e.g. "ADMIN")
 * @param {string}   params.title          - Notification Title
 * @param {string}   params.message        - Notification Body Text
 * @param {string}  [params.type]          - Event type (e.g. 'BOOKING_SUBMITTED', 'BOOKING_ACCEPTED')
 * @param {number}  [params.bookingId]     - Optional associated appointment ID
 */
const createNotification = async ({
  userId = null,
  recipientRole = null,
  title,
  message,
  type = null,
  bookingId = null,
  // eslint-disable-next-line no-unused-vars
  rejectionReason = null, // accepted for API compatibility; callers already embed it in message
}) => {
  try {
    await Notification.create({
      userId,
      recipientRole,
      title,
      message,
      type,
      bookingId,
      isRead: false,
    });
  } catch (error) {
    console.error("❌ Failed to create notification:", error.message || error);
  }
};

module.exports = createNotification;
