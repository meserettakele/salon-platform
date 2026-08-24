// src/utils/createNotification.js
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendTelegramMessage } = require("../services/telegramService");

/**
 * Creates a database notification record and dispatches real-time Telegram push alerts.
 * @param {Object} params
 * @param {number}  [params.userId]        - The ID of the target user (nullable if recipientRole is set)
 * @param {string}  [params.recipientRole] - Role-targeted notification (e.g. "ADMIN", "OWNER", "EMPLOYEE", "CUSTOMER")
 * @param {string}   params.title          - Notification Title
 * @param {string}   params.message        - Notification Body Text
 * @param {string}  [params.type]          - Event type (e.g. 'BOOKING_SUBMITTED', 'PAYMENT_RECEIVED', etc.)
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
  rejectionReason = null,
}) => {
  try {
    // 1. Create database notification record (for web dashboard bell)
    const notification = await Notification.create({
      userId,
      recipientRole,
      title,
      message,
      type,
      bookingId,
      isRead: false,
    });

    // 2. Fetch associated booking details if bookingId is provided
    let appointmentDetails = null;
    if (bookingId) {
      try {
        const { Appointment, Salon, Service, Employee, Payment, User } = require("../models");
        appointmentDetails = await Appointment.findByPk(bookingId, {
          include: [
            { model: Salon, as: "salon", attributes: ["name", "phone", "address"], required: false },
            { model: Service, as: "service", attributes: ["name", "duration", "price"], required: false },
            { model: Employee, as: "employee", attributes: ["name"], required: false },
            { model: User, as: "customer", attributes: ["fullName", "phone"], required: false },
            { model: Payment, as: "payment", required: false },
          ],
        });
      } catch (fetchErr) {
        console.warn("Could not load appointment details for notification:", fetchErr.message);
      }
    }

    // Skip duplicate Telegram messages on booking creation or redundant payment-required push
    if (
      type === "BOOKING_CREATED" ||
      type === "BOOKING_SUBMITTED" ||
      type === "BOOKING_ASSIGNED" ||
      type === "NEW_BOOKING" ||
      type === "PAYMENT_REQUIRED"
    ) {
      return notification;
    }

    // 3. Helper to format role-specific Telegram messages
    const icon =
      type?.includes("BOOKING") ? "📅" :
      type?.includes("PAYMENT") ? "💳" :
      type?.includes("SALON") ? "🏢" :
      type?.includes("ACCOUNT") ? "👤" :
      type?.includes("CANCEL") || type?.includes("REJECT") ? "❌" :
      type?.includes("ACCEPT") || type?.includes("CONFIRM") ? "✅" : "🔔";

    const buildTelegramText = (role) => {
      if (!appointmentDetails) {
        if (type === "MESSAGE") {
          return (
            `📬 *NEW CONTACT INQUIRY RECEIVED* 📬\n\n` +
            `A new message was submitted via the website contact form:\n\n` +
            `${message}\n\n` +
            `_Veloura Platform Administration · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}_`
          );
        }

        const hasEmojiPrefix = /^[\p{Emoji}\u2000-\u3300]/u.test(title.trim());
        const header = hasEmojiPrefix ? `*${title.trim()}*` : `${icon} *${title.trim()}*`;
        return (
          `${header}\n\n` +
          `${message}\n\n` +
          `_Veloura Beauty Platform · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}_`
        );
      }

      const custName = appointmentDetails.customer?.fullName || "Valued Customer";
      const custPhone = appointmentDetails.customer?.phone || "N/A";
      const sName = appointmentDetails.salon?.name || "Veloura Salon";
      const srvName = appointmentDetails.service?.name || "Beauty Service";
      const srvDuration = appointmentDetails.duration || appointmentDetails.service?.duration || 30;
      const srvPrice =
        appointmentDetails.payment?.amount ||
        appointmentDetails.bookedPrice ||
        appointmentDetails.service?.price ||
        "0";
      const staffName = appointmentDetails.employee?.name || "Assigned Specialist";
      const apptDate = appointmentDetails.appointmentDate || "Scheduled Date";
      const apptTime = appointmentDetails.appointmentTime || "Scheduled Time";
      const txRef =
        appointmentDetails.payment?.txRef ||
        appointmentDetails.payment?.reference ||
        "Direct Payment";
      const displayReason =
        rejectionReason ||
        appointmentDetails.rejectionReason ||
        "Schedule conflict or slot unavailable";

      // 1. ================= EMPLOYEE (Specialist) Perspective =================
      if (role === "EMPLOYEE") {
        if (type === "BOOKING_ACCEPTED") {
          return (
            `✅ *APPOINTMENT ACCEPTED* ✅\n\n` +
            `An appointment assigned to you has been accepted.\n\n` +
            `🆔 *Booking ID:* #${appointmentDetails.id}\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💰 *Amount:* ETB ${srvPrice}\n\n` +
            `⏳ *Status:* Awaiting customer payment. We will notify you once payment is confirmed!`
          );
        }
        if (type === "BOOKING_REJECTED") {
          return (
            `❌ *APPOINTMENT REJECTED* ❌\n\n` +
            `The appointment assignment #${appointmentDetails.id} has been rejected.\n\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName}\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `📝 *Reason:* ${displayReason}\n\n` +
            `_This time slot is now open on your schedule._`
          );
        }
        if (type === "APPOINTMENT_COMPLETED") {
          return (
            `🌟 *APPOINTMENT COMPLETED* 🌟\n\n` +
            `Appointment #${appointmentDetails.id} has been marked as completed.\n\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💰 *Amount:* ETB ${srvPrice}\n\n` +
            `_Great job! The service was fulfilled successfully. ✨_`
          );
        }
        if (
          type === "BOOKING_CANCELLED_BY_CUSTOMER" ||
          type === "BOOKING_CANCELLED"
        ) {
          return (
            `❌ *APPOINTMENT CANCELLED BY CUSTOMER* ❌\n\n` +
            `Customer ${custName} (\`${custPhone}\`) has cancelled booking #${appointmentDetails.id}.\n\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💰 *Amount:* ETB ${srvPrice}\n\n` +
            `_This appointment slot is now free on your schedule._`
          );
        }
        if (type === "PAYMENT_RECEIVED" || type === "PAYMENT_SUCCESSFUL") {
          return (
            `💳 *PAYMENT RECEIVED FROM CUSTOMER!* 💳\n\n` +
            `Payment confirmed for appointment #${appointmentDetails.id}.\n\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💰 *Amount Paid:* ETB ${srvPrice}\n` +
            `🧾 *Reference:* \`${txRef}\`\n\n` +
            `✅ The appointment is confirmed and ready for you to fulfill!`
          );
        }
      }

      // 2. ================= OWNER Perspective =================
      if (role === "OWNER") {
        if (type === "BOOKING_ACCEPTED") {
          return (
            `✅ *BOOKING ACCEPTED* ✅\n\n` +
            `Booking #${appointmentDetails.id} has been accepted and is awaiting customer payment.\n\n` +
            `🏪 *Salon:* ${sName}\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💇 *Specialist:* ${staffName}\n` +
            `💰 *Amount:* ETB ${srvPrice}\n\n` +
            `⏳ *Status:* Pending customer payment.`
          );
        }
        if (type === "BOOKING_REJECTED") {
          return (
            `❌ *BOOKING REJECTED* ❌\n\n` +
            `Booking request #${appointmentDetails.id} was rejected.\n\n` +
            `🏪 *Salon:* ${sName}\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName}\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💇 *Specialist:* ${staffName}\n` +
            `📝 *Reason:* ${displayReason}`
          );
        }
        if (type === "APPOINTMENT_COMPLETED") {
          return (
            `🌟 *APPOINTMENT COMPLETED* 🌟\n\n` +
            `Appointment #${appointmentDetails.id} has been marked as completed.\n\n` +
            `🏪 *Salon:* ${sName}\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `💄 *Service:* ${srvName}\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💇 *Specialist:* ${staffName}\n` +
            `💰 *Amount:* ETB ${srvPrice}\n\n` +
            `_The service was fulfilled successfully._`
          );
        }
        if (
          type === "BOOKING_CANCELLED_BY_CUSTOMER" ||
          type === "BOOKING_CANCELLED"
        ) {
          return (
            `❌ *BOOKING CANCELLED BY CUSTOMER* ❌\n\n` +
            `A customer has cancelled their upcoming appointment.\n\n` +
            `🆔 *Booking ID:* #${appointmentDetails.id}\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `🏪 *Salon:* ${sName}\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💰 *Amount:* ETB ${srvPrice}\n` +
            `💇 *Specialist:* ${staffName}\n\n` +
            `_This appointment slot is now free on your schedule._`
          );
        }
        if (type === "PAYMENT_RECEIVED" || type === "PAYMENT_SUCCESSFUL") {
          return (
            `💳 *PAYMENT RECEIVED FROM CUSTOMER!* 💳\n\n` +
            `🆔 *Booking ID:* #${appointmentDetails.id}\n` +
            `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
            `🏪 *Salon:* ${sName}\n` +
            `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
            `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
            `💰 *Amount Paid:* ETB ${srvPrice}\n` +
            `🧾 *Reference:* \`${txRef}\`\n` +
            `💇 *Specialist:* ${staffName}\n\n` +
            `✅ *Payment Status:* PAID. The appointment is confirmed and ready to be completed!`
          );
        }
      }

      // 3. ================= CUSTOMER Perspective (Default) =================
      if (type === "BOOKING_ACCEPTED") {
        return (
          `✅ *BOOKING ACCEPTED — PAYMENT REQUIRED* ✅\n\n` +
          `Your booking at *${sName}* for *${srvName}* on \`${apptDate}\` at \`${apptTime}\` has been accepted!\n\n` +
          `💰 *Amount Due:* ETB ${srvPrice}\n` +
          `⏱️ *Duration:* ${srvDuration} mins\n` +
          `💇 *Specialist:* ${staffName}\n\n` +
          `💳 Please complete your payment to confirm your appointment.`
        );
      }
      if (type === "PAYMENT_RECEIVED" || type === "PAYMENT_SUCCESSFUL") {
        return (
          `💳 *PAYMENT SUCCESSFUL & CONFIRMED!* 💳\n\n` +
          `Your payment has been received and verified.\n\n` +
          `🆔 *Booking ID:* #${appointmentDetails.id}\n` +
          `🏪 *Salon:* ${sName}\n` +
          `💄 *Service:* ${srvName}\n` +
          `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
          `💰 *Amount Paid:* ETB ${srvPrice}\n` +
          `🧾 *Reference:* \`${txRef}\`\n` +
          `💇 *Specialist:* ${staffName}\n\n` +
          `_Thank you for choosing Veloura!_`
        );
      }
      if (
        type === "BOOKING_CANCELLED_BY_CUSTOMER" ||
        type === "BOOKING_CANCELLED"
      ) {
        return (
          `❌ *Booking Cancelled Successfully*\n\n` +
          `Your appointment at *${sName}* for *${srvName}* on *${apptDate}* at *${apptTime}* has been cancelled.\n\n` +
          `_We hope to see you again soon!_`
        );
      }
      if (type === "BOOKING_REJECTED") {
        return (
          `❌ *BOOKING REQUEST REJECTED* ❌\n\n` +
          `Your appointment request has been rejected by the salon.\n\n` +
          `🆔 *Booking ID:* #${appointmentDetails.id}\n` +
          `🏪 *Salon:* ${sName}\n` +
          `💄 *Service:* ${srvName}\n` +
          `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
          `📝 *Reason:* ${displayReason}\n\n` +
          `_You can choose another time slot or specialist on our platform._`
        );
      }
      if (type === "APPOINTMENT_COMPLETED") {
        return (
          `🌟 *SERVICE COMPLETED!* 🌟\n\n` +
          `Your appointment at *${sName}* for *${srvName}* has been successfully completed.\n\n` +
          `🆔 *Booking ID:* #${appointmentDetails.id}\n` +
          `📅 *Date & Time:* \`${apptDate}\` at \`${apptTime}\`\n` +
          `💇 *Specialist:* ${staffName}\n\n` +
          `Thank you for choosing Veloura! We hope you loved your service. ✨`
        );
      }

      // Default fallback
      return (
        `${icon} *${title}*\n\n` +
        `${message}\n\n` +
        `_Veloura Beauty Platform · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}_`
      );
    };

    // 4. Dispatch to specific User (if userId provided)
    if (userId) {
      const user = await User.findByPk(userId);
      const isTgEnabled = Boolean(
        user?.telegramChatId &&
        user.telegramNotifyEnabled !== false &&
        user.telegramNotifyEnabled !== 0
      );

      if (isTgEnabled) {
        let userOptions = {};
        const userRole = (user.role || "").toUpperCase();
        let telegramText = buildTelegramText(userRole);

        // Customise action buttons for Customer on Acceptance -> Pay Now & Cancel buttons
        if (
          userRole === "CUSTOMER" &&
          bookingId &&
          type === "BOOKING_ACCEPTED"
        ) {
          userOptions.reply_markup = {
            inline_keyboard: [
              [
                { text: "💳 Pay Now", callback_data: `pay_cust_booking:${bookingId}` },
                { text: "❌ Cancel Booking", callback_data: `cancel_cust_booking:${bookingId}` },
              ],
            ],
          };
        }

        // If user is Employee and receives assignment -> Accept / Reject buttons
        if (
          userRole === "EMPLOYEE" &&
          bookingId &&
          (type === "BOOKING_SUBMITTED" ||
            type === "APPOINTMENT_ASSIGNED" ||
            type === "BOOKING_ASSIGNED")
        ) {
          userOptions.reply_markup = {
            inline_keyboard: [
              [
                { text: "✅ Accept Booking", callback_data: `accept_emp_booking:${bookingId}` },
                { text: "❌ Reject", callback_data: `reject_emp_booking:${bookingId}` },
              ],
            ],
          };
        }

        // If user is Employee and payment was received -> Complete Appointment button!
        if (
          userRole === "EMPLOYEE" &&
          bookingId &&
          (type === "PAYMENT_RECEIVED" || type === "PAYMENT_SUCCESSFUL")
        ) {
          userOptions.reply_markup = {
            inline_keyboard: [
              [
                { text: "🌟 Complete Appointment", callback_data: `complete_emp_booking:${bookingId}` },
              ],
            ],
          };
        }

        // If user is Owner and booking is submitted / created -> Accept / Decline buttons
        if (
          userRole === "OWNER" &&
          bookingId &&
          (type === "BOOKING_SUBMITTED" ||
            type === "BOOKING_CREATED" ||
            type === "NEW_BOOKING")
        ) {
          userOptions.reply_markup = {
            inline_keyboard: [
              [
                { text: "✅ Accept Booking", callback_data: `accept_booking:${bookingId}` },
                { text: "❌ Decline", callback_data: `reject_booking:${bookingId}` },
              ],
            ],
          };
        }

        // If user is Owner and payment was received -> Complete Appointment button!
        if (
          userRole === "OWNER" &&
          bookingId &&
          (type === "PAYMENT_RECEIVED" || type === "PAYMENT_SUCCESSFUL")
        ) {
          userOptions.reply_markup = {
            inline_keyboard: [
              [
                { text: "🌟 Complete Appointment", callback_data: `complete_booking:${bookingId}` },
              ],
            ],
          };
        }

        await sendTelegramMessage(user.telegramChatId, telegramText, userOptions);
      }
    }

    // 5. Dispatch to Role Group (if recipientRole provided)
    if (recipientRole) {
      const users = await User.findAll({
        where: {
          role: recipientRole.toUpperCase(),
          telegramNotifyEnabled: true,
        },
      });

      for (const targetUser of users) {
        if (targetUser.telegramChatId) {
          const roleText = buildTelegramText(recipientRole.toUpperCase());
          sendTelegramMessage(targetUser.telegramChatId, roleText);
        }
      }
    }

    return notification;
  } catch (error) {
    console.error("❌ Failed to create/dispatch notification:", error.message || error);
  }
};

module.exports = createNotification;
