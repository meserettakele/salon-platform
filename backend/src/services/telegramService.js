// src/services/telegramService.js
const TelegramBot = require("node-telegram-bot-api");
const { User, Appointment, Salon, Service, Employee, BusinessHour, Payment, Notification } = require("../models");

let bot = null;

/**
 * Initialize Telegram Bot with Polling
 */
const initTelegramBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN not provided in .env. Telegram Bot is disabled.");
    return;
  }

  // Prevent multiple initializations if called more than once
  if (bot) {
    return bot;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    console.log("🚀 Veloura Telegram Bot engine started successfully (@" + (process.env.TELEGRAM_BOT_USERNAME || "VelouraBeautyBot") + ")");

    // 📱 Register default command list for the native Telegram [ Menu ] button in the text input box
    const globalDefaultCommands = [
      { command: "menu", description: "📱 Open Interactive Menu & Filters" },
      { command: "mybookings", description: "📅 View My Appointments" },
      { command: "today", description: "🕒 Today's Schedule & Agenda" },
      { command: "profile", description: "👤 View Profile & Account Info" },
      { command: "status", description: "🔔 Notification Connection Status" },
      { command: "help", description: "📖 Guide & Command Manual" },
    ];

    bot.setMyCommands(globalDefaultCommands).catch((err) => {
      console.warn("[Telegram Bot] Warning setting global commands:", err.message);
    });

    bot.setChatMenuButton({ menu_button: { type: "commands" } }).catch(() => null);

    // Handle /start [token]
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = String(msg.chat.id);
      const startParam = match && match[1] ? match[1].trim() : null;
      const username = msg.from.username || msg.from.first_name || "User";

      console.log(`[Telegram Bot] /start received from ${username} (Chat ID: ${chatId}), token: ${startParam || "NONE"}`);

      try {
        if (startParam) {
          // Deep link connection token provided
          const user = await User.findOne({
            where: { telegramAuthToken: startParam },
          });

          if (user) {
            user.telegramChatId = chatId;
            user.telegramUsername = username;
            user.telegramAuthToken = null;
            user.telegramNotifyEnabled = true;
            await user.save();

            const roleEmoji = {
              CUSTOMER: "👩 Customer",
              OWNER: "🏢 Salon Owner",
              EMPLOYEE: "💇 Specialist",
              ADMIN: "🛡️ Administrator",
            }[user.role] || "User";

            console.log(`[Telegram Bot] ✅ User ${user.fullName} (${user.role}) successfully linked to Chat ID: ${chatId}`);

            // Set role-specific commands in user's native text-bar [ Menu ] button
            bot.setMyCommands(getRoleCommands(user.role), {
              scope: { type: "chat", chat_id: Number(chatId) },
            }).catch(() => null);

            await bot.sendMessage(
              chatId,
              `✨ *Welcome to Veloura Beauty, ${user.fullName || username}!* ✨\n\n` +
              `✅ *Account Linked Successfully*\n` +
              `👤 *Role:* ${roleEmoji}\n` +
              `📱 *Phone:* \`${user.phone}\`\n\n` +
              `You will now receive instant real-time alerts for bookings, appointment updates, and notifications directly here!\n\n` +
              `_Use the native [Menu] button on your typing bar or the buttons below:_`,
              {
                parse_mode: "Markdown",
                reply_markup: getRoleReplyKeyboard(user.role),
              }
            );

            return sendRoleMenu(chatId, user);
          }
        }

        // Check if already linked
        const existingUser = await User.findOne({
          where: { telegramChatId: chatId },
        });

        if (existingUser) {
          // Update chat commands
          bot.setMyCommands(getRoleCommands(existingUser.role), {
            scope: { type: "chat", chat_id: Number(chatId) },
          }).catch(() => null);

          await bot.sendMessage(
            chatId,
            `👋 *Welcome back, ${existingUser.fullName}!* (${existingUser.role})\n\n` +
            `Your Veloura account is active and connected. Use the native **[Menu]** button beside your typing bar or choose an option below:`,
            {
              parse_mode: "Markdown",
              reply_markup: getRoleReplyKeyboard(existingUser.role),
            }
          );

          return sendRoleMenu(chatId, existingUser);
        }

        // Not linked
        bot.sendMessage(
          chatId,
          `🌸 *Welcome to Veloura Beauty Network!* 🌸\n\n` +
          `To connect your Veloura account:\n` +
          `1. Log in to your Veloura account on the web platform.\n` +
          `2. Go to your **Profile Settings**.\n` +
          `3. Click **"🔗 Connect Telegram"** to link automatically.\n\n` +
          `Stay updated on all appointment bookings, approvals, and reminders!`,
          { parse_mode: "Markdown" }
        );
      } catch (err) {
        console.error("Telegram /start error:", err);
        bot.sendMessage(chatId, "⚠️ An error occurred while linking your account. Please try again from the website.");
      }
    });

    // Handle /menu
    bot.onText(/\/menu/i, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      if (!user) {
        return bot.sendMessage(chatId, "🌸 Please connect your Veloura account first using the website.");
      }
      await sendRoleMenu(chatId, user);
    });

    // Handle /profile
    bot.onText(/\/profile/i, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      if (!user) {
        return bot.sendMessage(chatId, "🌸 Please connect your Veloura account first using the website.");
      }
      await handleProfileView(chatId, user);
    });

    // Handle /today
    bot.onText(/\/today/i, async (msg) => {
      await handleTodayCommand(msg.chat.id);
    });

    // Handle /mybookings
    bot.onText(/\/mybookings/i, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      if (!user) {
        return bot.sendMessage(chatId, "🌸 Please connect your Veloura account first from the website.");
      }
      await handleBookingsFilter(chatId, user, "ALL");
    });

    // Handle /admin
    bot.onText(/\/admin/i, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      if (!user || user.role !== "ADMIN") {
        return bot.sendMessage(chatId, "⛔ *Access Restricted.* This command is for Veloura Administrators only.", { parse_mode: "Markdown" });
      }
      await handleAdminMetricsView(chatId);
    });

    // Handle /unlink
    bot.onText(/\/unlink/i, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      if (user) {
        user.telegramChatId = null;
        user.telegramUsername = null;
        await user.save();
        bot.sendMessage(chatId, "🔌 *Account Disconnected.* You will no longer receive notifications on Telegram.", {
          parse_mode: "Markdown",
          reply_markup: { remove_keyboard: true },
        });
      } else {
        bot.sendMessage(chatId, "No active Veloura account linked to this chat.");
      }
    });

    // Handle /help
    bot.onText(/\/help/i, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      await sendHelpMenu(chatId, user);
    });

    // Handle /status
    bot.onText(/\/status/i, async (msg) => {
      const user = await User.findOne({ where: { telegramChatId: String(msg.chat.id) } });
      if (user) {
        bot.sendMessage(
          msg.chat.id,
          `✅ *Connected:* ${user.fullName} (\`${user.phone}\`)\n` +
          `🎭 *Role:* ${user.role}\n` +
          `🔔 *Notifications:* ${user.telegramNotifyEnabled ? "Enabled" : "Disabled"}\n`,
          {
            parse_mode: "Markdown",
            reply_markup: getRoleReplyKeyboard(user.role),
          }
        );
      } else {
        bot.sendMessage(msg.chat.id, "❌ Not connected to any Veloura account.");
      }
    });

    // Catch text from persistent Reply Keyboard
    bot.on("message", async (msg) => {
      if (msg.text && msg.text.startsWith("/")) return;
      const text = (msg.text || "").trim();
      const chatId = String(msg.chat.id);
      const user = await User.findOne({ where: { telegramChatId: chatId } });
      if (!user) return;

      if (text === "📱 Main Menu" || text.toLowerCase() === "menu") {
        return sendRoleMenu(chatId, user);
      }
      if (text === "⏳ New Bookings" || text.includes("New Booking") || text.includes("Pending")) {
        return handleBookingsFilter(chatId, user, "PENDING");
      }
      if (text === "💳 Paid Bookings" || text.includes("Paid Booking") || text.includes("Confirmed")) {
        return handleBookingsFilter(chatId, user, "CONFIRMED");
      }
      if (text === "🚫 Cancelled Bookings" || text.includes("Cancelled")) {
        return handleBookingsFilter(chatId, user, "CANCELLED");
      }
      if (text === "🌟 Completed Bookings" || text.includes("Completed")) {
        return handleBookingsFilter(chatId, user, "COMPLETED");
      }
      if (text === "❌ Rejected Bookings" || text.includes("Rejected")) {
        return handleBookingsFilter(chatId, user, "REJECTED");
      }
      if (text === "📅 My Bookings" || text === "📅 Salon Bookings" || text === "📅 My Assignments" || text === "📋 System Bookings") {
        return handleBookingsFilter(chatId, user, "ALL");
      }
      if (text === "🕒 Today's Agenda" || text === "🕒 Today's Schedule") {
        return handleTodayCommand(chatId);
      }
      if (text === "👤 My Profile" || text === "👤 Owner Profile" || text === "👤 Specialist Profile" || text === "👤 Admin Profile") {
        return handleProfileView(chatId, user);
      }
      if (text === "🏢 My Salon") {
        return handleSalonDetailsView(chatId, user);
      }
      if (text === "👥 Staff & Specialists" || text === "👥 Staff Team") {
        return handleStaffListView(chatId, user);
      }
      if (text === "📊 Salon Stats" || text === "📊 Revenue & Stats") {
        return handleSalonStatsView(chatId, user);
      }
      if (text === "🌟 My Performance") {
        return handleSpecialistPerformanceView(chatId, user);
      }
      if (text === "📊 Platform Metrics") {
        return handleAdminMetricsView(chatId);
      }
      if (text === "🏢 All Salons") {
        return handleAdminSalonsView(chatId);
      }
      if (text === "❓ Help & Support" || text === "❓ Help") {
        return sendHelpMenu(chatId, user);
      }
    });

    // Handle Interactive Callback Query Buttons
    bot.on("callback_query", async (callbackQuery) => {
      const { id, data, message } = callbackQuery;
      const chatId = String(message.chat.id);

      try {
        const user = await User.findOne({ where: { telegramChatId: chatId } });

        if (data === "menu_main") {
          if (user) await sendRoleMenu(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data.startsWith("menu_filter:")) {
          const filter = data.split(":")[1] || "ALL";
          if (user) await handleBookingsFilter(chatId, user, filter);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_profile") {
          if (user) await handleProfileView(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_salon") {
          if (user) await handleSalonDetailsView(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_staff") {
          if (user) await handleStaffListView(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_stats") {
          if (user) await handleSalonStatsView(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_performance") {
          if (user) await handleSpecialistPerformanceView(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_adminsalons") {
          await handleAdminSalonsView(chatId);
          return bot.answerCallbackQuery(id);
        }

        if (data === "menu_adminmetrics") {
          await handleAdminMetricsView(chatId);
          return bot.answerCallbackQuery(id);
        }

        if (data === "cmd_mybookings") {
          if (user) await handleBookingsFilter(chatId, user, "ALL");
          return bot.answerCallbackQuery(id);
        }

        if (data === "cmd_today") {
          await handleTodayCommand(chatId);
          return bot.answerCallbackQuery(id);
        }

        if (data === "cmd_help") {
          await sendHelpMenu(chatId, user);
          return bot.answerCallbackQuery(id);
        }

        if (data === "cmd_status") {
          if (user) {
            bot.sendMessage(chatId, `✅ *Connected:* ${user.fullName} (${user.role})\n🔔 Notifications: ${user.telegramNotifyEnabled ? "ON" : "OFF"}`);
          }
          return bot.answerCallbackQuery(id);
        }

        // Accept Booking Action from Telegram (Owner)
        if (data.startsWith("accept_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon" },
              { model: Service, as: "service" },
              { model: Employee, as: "employee" },
              { model: User, as: "customer" },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          appointment.bookingStatus = "ACCEPTED";
          appointment.acceptedAt = new Date();
          await appointment.save();

          await bot.editMessageText(
            (message.text || "") + `\n\n*✅ ACCEPTED BY OWNER* (at ${new Date().toLocaleTimeString()})`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
            }
          ).catch((e) => console.warn("Telegram editMessageText error (accept_booking):", e.message));

          const salonName = appointment.salon?.name || "Salon";
          const serviceName = appointment.service?.name || "Service";

          // 1. 🔔 Notify Customer
          const targetCustomerId = appointment.customerId;
          if (targetCustomerId) {
            await Notification.create({
              userId: targetCustomerId,
              title: "Booking Accepted - Payment Required",
              message: `Your appointment at ${salonName} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been accepted. Complete payment to confirm your appointment.`,
              type: "BOOKING_ACCEPTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to create in-app notification:", err.message));

            await notifyBookingAccepted(appointment.id);
          }

          // 2. 🔔 Notify Assigned Employee in their dashboard bell
          if (appointment.employee?.userId) {
            await Notification.create({
              userId: appointment.employee.userId,
              title: "Booking Accepted by Owner",
              message: `Owner accepted booking #${appointment.id} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} assigned to you.`,
              type: "BOOKING_ACCEPTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));
          }

          // 3. 🔔 In-app bell record for Owner
          if (appointment.salon?.ownerId) {
            await Notification.create({
              userId: appointment.salon.ownerId,
              title: "Booking Accepted",
              message: `You accepted booking #${appointment.id} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
              type: "BOOKING_ACCEPTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));
          }

          return bot.answerCallbackQuery(id, { text: "Booking accepted successfully!", show_alert: false });
        }

        // Reject Booking Action from Telegram (Owner - Prompts Reason)
        // Reject Booking Action from Telegram (Owner - Prompts Reason)
        if (data.startsWith("reject_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId);

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          // Present reason choices to the owner (using short codes to strictly comply with 64-byte Telegram limit)
          await bot.editMessageText(
            (message.text || "") + "\n\n❓ *Please select a reason for declining:*",
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "📅 Fully Booked",
                      callback_data: `reject_reason:${appointmentId}:booked`,
                    },
                    {
                      text: "💇 Staff Unavailable",
                      callback_data: `reject_reason:${appointmentId}:staff`,
                    },
                  ],
                  [
                    {
                      text: "🕒 Time Conflict",
                      callback_data: `reject_reason:${appointmentId}:conflict`,
                    },
                    {
                      text: "🚪 Salon Closed",
                      callback_data: `reject_reason:${appointmentId}:closed`,
                    },
                  ],
                  [
                    {
                      text: "❌ Other Conflict",
                      callback_data: `reject_reason:${appointmentId}:other`,
                    },
                  ],
                ],
              },
            }
          ).catch((e) => console.warn("Telegram editMessageText error (reject_booking):", e.message));

          return bot.answerCallbackQuery(id);
        }

        // Owner Confirms Rejection with Selected Reason
        if (data.startsWith("reject_reason:")) {
          const parts = data.split(":");
          const appointmentId = Number(parts[1]);
          const reasonCode = parts[2] || "other";

          const REJECT_REASON_MAP = {
            booked: "Fully booked at this time",
            staff: "Specialist unavailable",
            offduty: "Specialist off-duty or unavailable",
            conflict: "Time slot conflict",
            closed: "Salon closed / maintenance",
            emergency: "Emergency / sudden conflict",
            other: "Schedule conflict, please pick another slot",
          };

          const reason = REJECT_REASON_MAP[reasonCode] || parts.slice(2).join(":") || "Declined by salon";

          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon" },
              { model: Service, as: "service" },
              { model: Employee, as: "employee" },
              { model: User, as: "customer" },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          appointment.bookingStatus = "REJECTED";
          appointment.cancelledAt = new Date();
          appointment.rejectionReason = reason;
          await appointment.save();

          await bot.editMessageText(
            (message.text ? message.text.split("❓")[0].trim() : "") +
              `\n\n*❌ REJECTED BY OWNER* (at ${new Date().toLocaleTimeString()})\n📝 *Reason:* ${reason}`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
            }
          ).catch((e) => console.warn("Telegram editMessageText error (reject_reason):", e.message));

          const salonName = appointment.salon?.name || "Salon";
          const serviceName = appointment.service?.name || "Service";

          // 1. 🔔 Notify Customer
          const targetCustomerId = appointment.customerId;
          if (targetCustomerId) {
            const createNotification = require("../utils/createNotification");
            await createNotification({
              userId: targetCustomerId,
              title: "Booking Rejected",
              message: `Your booking request for ${serviceName} at ${salonName} on ${appointment.appointmentDate} was rejected. Reason: ${reason}`,
              type: "BOOKING_REJECTED",
              bookingId: appointment.id,
              rejectionReason: reason,
            }).catch((err) => console.warn("Failed to create BOOKING_REJECTED notification:", err.message));
          }

          // 2. 🔔 Notify Assigned Employee in their dashboard bell
          if (appointment.employee?.userId) {
            await Notification.create({
              userId: appointment.employee.userId,
              title: "Booking Rejected by Owner",
              message: `Owner rejected booking #${appointment.id} for ${serviceName} on ${appointment.appointmentDate}. Reason: ${reason}`,
              type: "BOOKING_REJECTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));
          }

          // 3. 🔔 In-app bell record for Owner
          if (appointment.salon?.ownerId) {
            await Notification.create({
              userId: appointment.salon.ownerId,
              title: "Booking Rejected",
              message: `You rejected booking #${appointment.id} for ${serviceName}. Reason: ${reason}`,
              type: "BOOKING_REJECTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));
          }

          return bot.answerCallbackQuery(id, { text: `Booking rejected: ${reason}`, show_alert: false });
        }

        // Employee Accept Booking Action from Telegram
        if (data.startsWith("accept_emp_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon" },
              { model: Service, as: "service" },
              { model: Employee, as: "employee" },
              { model: User, as: "customer" },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          appointment.bookingStatus = "ACCEPTED";
          appointment.acceptedAt = new Date();
          await appointment.save();

          await bot.editMessageText(
            (message.text || "") + `\n\n*✅ ACCEPTED BY SPECIALIST* (at ${new Date().toLocaleTimeString()})`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
            }
          ).catch((e) => console.warn("Telegram editMessageText error (accept_emp_booking):", e.message));

          const salonName = appointment.salon?.name || "Salon";
          const serviceName = appointment.service?.name || "Service";
          const staffName = appointment.employee?.name || "Specialist";

          // 1. 🔔 Notify Customer
          const targetCustomerId = appointment.customerId;
          if (targetCustomerId) {
            await Notification.create({
              userId: targetCustomerId,
              title: "Booking Accepted - Payment Required",
              message: `Your appointment at ${salonName} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been accepted by the specialist. Complete payment to confirm your appointment.`,
              type: "BOOKING_ACCEPTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to create in-app notification:", err.message));

            await notifyBookingAccepted(appointment.id);
          }

          // 2. 🔔 Notify Salon Owner in their dashboard bell
          if (appointment.salon?.ownerId) {
            await Notification.create({
              userId: appointment.salon.ownerId,
              title: "Staff Accepted Booking",
              message: `Specialist ${staffName} accepted booking #${appointment.id} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
              type: "BOOKING_ACCEPTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));
          }

          // 3. 🔔 In-app bell record for Employee
          if (appointment.employee?.userId) {
            await Notification.create({
              userId: appointment.employee.userId,
              title: "Booking Accepted",
              message: `You accepted booking #${appointment.id} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
              type: "BOOKING_ACCEPTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));
          }

          return bot.answerCallbackQuery(id, { text: "Booking accepted successfully!", show_alert: false });
        }

        // Employee Reject Booking Action from Telegram (Prompts Reason)
        if (data.startsWith("reject_emp_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId);

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          // Present reason choices to specialist (using short codes to strictly comply with 64-byte Telegram limit)
          await bot.editMessageText(
            (message.text || "") + "\n\n❓ *Please select a reason for declining:*",
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "📅 Fully Booked",
                      callback_data: `reject_emp_reason:${appointmentId}:booked`,
                    },
                    {
                      text: "🕒 Off-Duty",
                      callback_data: `reject_emp_reason:${appointmentId}:offduty`,
                    },
                  ],
                  [
                    {
                      text: "⚠️ Schedule Conflict",
                      callback_data: `reject_emp_reason:${appointmentId}:conflict`,
                    },
                    {
                      text: "❌ Other Reason",
                      callback_data: `reject_emp_reason:${appointmentId}:other`,
                    },
                  ],
                ],
              },
            }
          ).catch((e) => console.warn("Telegram editMessageText error (reject_emp_booking):", e.message));

          return bot.answerCallbackQuery(id);
        }

        // Employee Confirms Rejection with Reason
        if (data.startsWith("reject_emp_reason:")) {
          const parts = data.split(":");
          const appointmentId = Number(parts[1]);
          const reasonCode = parts[2] || "other";

          const REJECT_REASON_MAP = {
            booked: "Fully booked / busy at this time",
            offduty: "Specialist off-duty or unavailable",
            staff: "Specialist unavailable",
            conflict: "Schedule conflict / emergency",
            closed: "Salon closed / maintenance",
            emergency: "Emergency / sudden conflict",
            other: "Unavailable, please pick another specialist",
          };

          const reason = REJECT_REASON_MAP[reasonCode] || parts.slice(2).join(":") || "Declined by specialist";

          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon" },
              { model: Service, as: "service" },
              { model: Employee, as: "employee" },
              { model: User, as: "customer" },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          appointment.bookingStatus = "REJECTED";
          appointment.cancelledAt = new Date();
          appointment.rejectionReason = reason;
          await appointment.save();

          await bot.editMessageText(
            (message.text ? message.text.split("❓")[0].trim() : "") +
              `\n\n*❌ REJECTED BY SPECIALIST* (at ${new Date().toLocaleTimeString()})\n📝 *Reason:* ${reason}`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
            }
          ).catch((e) => console.warn("Telegram editMessageText error (reject_emp_reason):", e.message));

          const salonName = appointment.salon?.name || "Salon";
          const serviceName = appointment.service?.name || "Service";
          const staffName = appointment.employee?.name || "Specialist";

          // 1. 🔔 Notify Customer
          const targetCustomerId = appointment.customerId;
          if (targetCustomerId) {
            const createNotification = require("../utils/createNotification");
            await createNotification({
              userId: targetCustomerId,
              title: "Booking Rejected",
              message: `Your booking request for ${serviceName} at ${salonName} on ${appointment.appointmentDate} was rejected. Reason: ${reason}`,
              type: "BOOKING_REJECTED",
              bookingId: appointment.id,
              rejectionReason: reason,
            }).catch((err) => console.warn("Failed to create BOOKING_REJECTED notification:", err.message));
          }

          // 2. 🔔 Notify Salon Owner in their dashboard bell
          if (appointment.salon?.ownerId) {
            await Notification.create({
              userId: appointment.salon.ownerId,
              title: "Staff Rejected Booking",
              message: `Specialist ${staffName} rejected booking #${appointment.id} for ${serviceName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}. Reason: ${reason}`,
              type: "BOOKING_REJECTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));
          }

          // 3. 🔔 In-app bell record for Employee
          if (appointment.employee?.userId) {
            await Notification.create({
              userId: appointment.employee.userId,
              title: "Booking Rejected",
              message: `You rejected booking #${appointment.id} for ${serviceName}. Reason: ${reason}`,
              type: "BOOKING_REJECTED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));
          }

          return bot.answerCallbackQuery(id, { text: `Booking rejected: ${reason}`, show_alert: false });
        }

        // Complete Booking Action from Telegram (Owner or Employee)
        if (data.startsWith("complete_booking:") || data.startsWith("complete_emp_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon" },
              { model: Service, as: "service" },
              { model: Employee, as: "employee" },
              { model: User, as: "customer" },
              { model: Payment, as: "payment" },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          appointment.bookingStatus = "COMPLETED";
          appointment.completedAt = new Date();
          await appointment.save();

          const isOwner = data.startsWith("complete_booking:");
          const completionTag = isOwner ? "*🌟 COMPLETED BY OWNER*" : "*🌟 COMPLETED BY SPECIALIST*";

          await bot.editMessageText(
            (message.text || "") + `\n\n${completionTag} (at ${new Date().toLocaleTimeString()})`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
            }
          ).catch((e) => console.warn("Telegram editMessageText error (complete_booking):", e.message));

          const salonName = appointment.salon?.name || "Salon";
          const serviceName = appointment.service?.name || "Service";
          const staffName = appointment.employee?.name || "Specialist";

          // 1. 🔔 Notify Customer
          const targetCustomerId = appointment.customerId;
          if (targetCustomerId) {
            const createNotification = require("../utils/createNotification");
            await createNotification({
              userId: targetCustomerId,
              title: "Appointment Completed",
              message: `Your appointment at ${salonName} for ${serviceName} has been completed. Thank you for choosing Veloura! ✨`,
              type: "APPOINTMENT_COMPLETED",
              bookingId: appointment.id,
            }).catch((err) => console.warn("Failed to create APPOINTMENT_COMPLETED notification:", err.message));
          }

          // 2. 🔔 Notify Salon Owner in their dashboard bell
          if (appointment.salon?.ownerId) {
            const ownerTitle = isOwner ? "Appointment Completed" : "Appointment Completed by Staff";
            const ownerMsg = isOwner
              ? `You marked appointment #${appointment.id} for ${serviceName} as completed.`
              : `Specialist ${staffName} completed appointment #${appointment.id} for ${serviceName}.`;

            await Notification.create({
              userId: appointment.salon.ownerId,
              title: ownerTitle,
              message: ownerMsg,
              type: "APPOINTMENT_COMPLETED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify owner in-app:", err.message));
          }

          // 3. 🔔 Notify Assigned Specialist in their dashboard bell
          if (appointment.employee?.userId) {
            const staffTitle = isOwner ? "Appointment Completed by Owner" : "Appointment Completed";
            const staffMsg = isOwner
              ? `Owner marked appointment #${appointment.id} for ${serviceName} as completed.`
              : `You marked appointment #${appointment.id} for ${serviceName} as completed.`;

            await Notification.create({
              userId: appointment.employee.userId,
              title: staffTitle,
              message: staffMsg,
              type: "APPOINTMENT_COMPLETED",
              bookingId: appointment.id,
              isRead: false,
            }).catch((err) => console.warn("Failed to notify employee in-app:", err.message));
          }

          return bot.answerCallbackQuery(id, { text: "Appointment marked as completed!", show_alert: false });
        }

        // Customer Cancels Booking Action from Telegram
        if (data.startsWith("cancel_cust_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon" },
              { model: Service, as: "service" },
              { model: Employee, as: "employee" },
              { model: User, as: "customer" },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          if (appointment.bookingStatus === "CANCELLED" || appointment.bookingStatus === "REJECTED") {
            return bot.answerCallbackQuery(id, { text: "This booking is already cancelled.", show_alert: true });
          }

          if (appointment.bookingStatus === "COMPLETED") {
            return bot.answerCallbackQuery(id, { text: "Completed appointments cannot be cancelled.", show_alert: true });
          }

          appointment.bookingStatus = "CANCELLED";
          appointment.cancelledAt = new Date();
          await appointment.save();

          await bot.editMessageText(
            (message.text || "") + `\n\n*❌ BOOKING CANCELLED BY YOU* (at ${new Date().toLocaleTimeString()})`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              parse_mode: "Markdown",
            }
          ).catch((e) => console.warn("Telegram editMessageText error (cancel_cust_booking):", e.message));

          const createNotification = require("../utils/createNotification");

          // 1. In-App Notification for customer's bell
          await createNotification({
            userId: appointment.customerId,
            title: "Booking Cancelled",
            message: `You have successfully cancelled your booking #${appointment.id}.`,
            type: "BOOKING_CANCELLED",
            bookingId: appointment.id,
          }).catch((err) => console.warn("Failed to create customer cancel notification:", err.message));

          // 2. Notify Salon Owner & Specialist via Telegram with rich details
          const salon = appointment.salon;
          const employee = appointment.employee;
          const customer = appointment.customer;

          if (salon?.ownerId) {
            await createNotification({
              userId: salon.ownerId,
              title: "Booking Cancelled by Customer",
              message: `Customer ${customer?.fullName || "A client"} has cancelled booking #${appointment.id}.`,
              type: "BOOKING_CANCELLED_BY_CUSTOMER",
              bookingId: appointment.id,
            }).catch((err) => console.warn("Failed to notify salon owner of cancellation:", err.message));
          }

          if (employee?.userId) {
            await createNotification({
              userId: employee.userId,
              title: "Booking Cancelled by Customer",
              message: `Customer ${customer?.fullName || "A client"} has cancelled booking #${appointment.id}.`,
              type: "BOOKING_CANCELLED_BY_CUSTOMER",
              bookingId: appointment.id,
            }).catch((err) => console.warn("Failed to notify specialist of cancellation:", err.message));
          }

          return bot.answerCallbackQuery(id, { text: "Your booking has been cancelled.", show_alert: false });
        }

        // Customer Clicks Pay on Telegram
        if (data.startsWith("pay_cust_booking:")) {
          const appointmentId = Number(data.split(":")[1]);
          const appointment = await Appointment.findByPk(appointmentId, {
            include: [
              { model: Salon, as: "salon", required: false },
              { model: Service, as: "service", required: false },
              { model: Payment, as: "payment", required: false },
            ],
          });

          if (!appointment) {
            return bot.answerCallbackQuery(id, { text: "Appointment not found.", show_alert: true });
          }

          if (appointment.paymentStatus === "PAID") {
            return bot.answerCallbackQuery(id, { text: "This appointment is already paid!", show_alert: true });
          }

          const srvPrice = appointment.bookedPrice || appointment.service?.price || "0";
          const srvName = appointment.service?.name || "Service";
          const salonName = appointment.salon?.name || "Salon";

          await bot.sendMessage(
            chatId,
            `💳 *Payment for Booking #${appointment.id}*\n\n` +
            `🏪 *Salon:* ${salonName}\n` +
            `💄 *Service:* ${srvName}\n` +
            `💰 *Amount Due:* ETB ${srvPrice}\n\n` +
            `Please visit the Veloura website to complete your payment via Chapa / Telebirr. Once confirmed, you will receive your receipt right here! ✨`,
            { parse_mode: "Markdown" }
          ).catch((e) => console.warn("Telegram sendMessage error (pay_cust_booking):", e.message));

          return bot.answerCallbackQuery(id, { text: "Opening payment instructions...", show_alert: false });
        }

        bot.answerCallbackQuery(id);
      } catch (err) {
        console.error("Callback query error:", err);
        bot.answerCallbackQuery(id, { text: "Error processing action.", show_alert: true });
      }
    });

    bot.on("polling_error", (error) => {
      // Non-fatal polling error logger
      if (error.code !== "EFATAL" && error.code !== "ETELEGRAM") {
        // console.warn("Telegram poll notice:", error.message);
      }
    });
  } catch (err) {
    console.error("Failed to start Telegram Bot:", err);
  }

  return bot;
};

/**
 * Role-Based Commands List for Native Telegram Menu Button
 */
const getRoleCommands = (role) => {
  const normalizedRole = (role || "").toUpperCase();
  if (normalizedRole === "OWNER") {
    return [
      { command: "menu", description: "🏢 Open Salon Owner Menu" },
      { command: "mybookings", description: "📅 View Salon Bookings" },
      { command: "today", description: "🕒 Today's Salon Schedule" },
      { command: "profile", description: "👤 Owner & Salon Profile" },
      { command: "status", description: "🔔 Connection Status" },
      { command: "help", description: "📖 Guide & Instructions" },
    ];
  }
  if (normalizedRole === "EMPLOYEE") {
    return [
      { command: "menu", description: "💇 Open Specialist Menu" },
      { command: "mybookings", description: "📅 View My Assigned Bookings" },
      { command: "today", description: "🕒 Today's Clients Schedule" },
      { command: "profile", description: "👤 Specialist Profile" },
      { command: "status", description: "🔔 Connection Status" },
      { command: "help", description: "📖 Guide & Instructions" },
    ];
  }
  if (normalizedRole === "ADMIN") {
    return [
      { command: "menu", description: "🛡️ Open Admin Dashboard Menu" },
      { command: "admin", description: "📊 Live Platform System Metrics" },
      { command: "mybookings", description: "📋 Global System Bookings" },
      { command: "profile", description: "👤 Admin Profile Info" },
      { command: "status", description: "🔔 Connection Status" },
      { command: "help", description: "📖 Guide & Instructions" },
    ];
  }
  // CUSTOMER (Default)
  return [
    { command: "menu", description: "🌸 Open Customer Menu & Filters" },
    { command: "mybookings", description: "📅 View My Bookings" },
    { command: "today", description: "🕒 Today's Agenda" },
    { command: "profile", description: "👤 My Profile & Account" },
    { command: "status", description: "🔔 Connection Status" },
    { command: "help", description: "📖 Guide & Instructions" },
  ];
};

/**
 * Role-Based Persistent Reply Keyboard
 */
/**
 * Role-Based Persistent Reply Keyboard
 */
const getRoleReplyKeyboard = (role) => {
  const normalizedRole = (role || "").toUpperCase();
  if (normalizedRole === "OWNER") {
    return {
      keyboard: [
        [{ text: "⏳ New Bookings" }, { text: "💳 Paid Bookings" }],
        [{ text: "🚫 Cancelled Bookings" }, { text: "📅 Salon Bookings" }],
        [{ text: "🏢 My Salon" }, { text: "👥 Staff & Specialists" }],
        [{ text: "📊 Salon Stats" }, { text: "📱 Main Menu" }],
      ],
      resize_keyboard: true,
      persistent: true,
    };
  }
  if (normalizedRole === "EMPLOYEE") {
    return {
      keyboard: [
        [{ text: "⏳ New Bookings" }, { text: "💳 Paid Bookings" }],
        [{ text: "🚫 Cancelled Bookings" }, { text: "📅 My Assignments" }],
        [{ text: "🌟 My Performance" }, { text: "👤 Specialist Profile" }],
        [{ text: "📱 Main Menu" }, { text: "❓ Help" }],
      ],
      resize_keyboard: true,
      persistent: true,
    };
  }
  if (normalizedRole === "ADMIN") {
    return {
      keyboard: [
        [{ text: "📊 Platform Metrics" }, { text: "🏢 All Salons" }],
        [{ text: "📋 System Bookings" }, { text: "👤 Admin Profile" }],
        [{ text: "📱 Main Menu" }, { text: "❓ Help" }],
      ],
      resize_keyboard: true,
      persistent: true,
    };
  }
  // CUSTOMER (Default)
  return {
    keyboard: [
      [{ text: "📅 My Bookings" }, { text: "🕒 Today's Agenda" }],
      [{ text: "👤 My Profile" }, { text: "📱 Main Menu" }],
      [{ text: "❓ Help & Support" }],
    ],
    resize_keyboard: true,
    persistent: true,
  };
};

/**
 * Send Role-Specific Interactive Main Menu
 */
const sendRoleMenu = async (chatId, user) => {
  if (!bot || !user) return;
  const role = (user.role || "").toUpperCase();

  if (role === "CUSTOMER") {
    const countPending = await Appointment.count({ where: { customerId: user.id, bookingStatus: "PENDING" } });
    const countAccepted = await Appointment.count({ where: { customerId: user.id, bookingStatus: "ACCEPTED" } });
    const countCompleted = await Appointment.count({ where: { customerId: user.id, bookingStatus: "COMPLETED" } });
    const countRejected = await Appointment.count({ where: { customerId: user.id, bookingStatus: "REJECTED" } });
    const countCancelled = await Appointment.count({ where: { customerId: user.id, bookingStatus: "CANCELLED" } });

    const menuText =
      `🌸 *VELOURA CUSTOMER MENU* 🌸\n\n` +
      `👋 Hello, *${user.fullName}*!\n` +
      `Manage your appointments, view your profile, and track your bookings in real-time:\n\n` +
      `• ⏳ Pending: *${countPending}*\n` +
      `• ✅ Accepted (Payment Required): *${countAccepted}*\n` +
      `• 🌟 Completed: *${countCompleted}*\n` +
      `• ❌ Rejected: *${countRejected}* · 🚫 Cancelled: *${countCancelled}*`;

    return bot.sendMessage(chatId, menuText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: `⏳ Pending (${countPending})`, callback_data: "menu_filter:PENDING" },
            { text: `✅ Accepted / Pay (${countAccepted})`, callback_data: "menu_filter:ACCEPTED" },
          ],
          [
            { text: `🌟 Completed (${countCompleted})`, callback_data: "menu_filter:COMPLETED" },
            { text: `❌ Rejected (${countRejected})`, callback_data: "menu_filter:REJECTED" },
          ],
          [
            { text: `🚫 Cancelled (${countCancelled})`, callback_data: "menu_filter:CANCELLED" },
            { text: `📋 All Bookings`, callback_data: "menu_filter:ALL" },
          ],
          [
            { text: "🕒 Today's Agenda", callback_data: "cmd_today" },
            { text: "👤 My Profile", callback_data: "menu_profile" },
          ],
        ],
      },
    });
  }

  if (role === "OWNER") {
    const salon = await Salon.findOne({ where: { ownerId: user.id } });
    const salonId = salon ? salon.id : null;
    const countPending = salonId ? await Appointment.count({ where: { salonId, bookingStatus: "PENDING" } }) : 0;
    const countAccepted = salonId ? await Appointment.count({ where: { salonId, bookingStatus: "ACCEPTED" } }) : 0;
    const countConfirmed = salonId ? await Appointment.count({ where: { salonId, bookingStatus: "CONFIRMED" } }) : 0;
    const countCompleted = salonId ? await Appointment.count({ where: { salonId, bookingStatus: "COMPLETED" } }) : 0;
    const countRejected = salonId ? await Appointment.count({ where: { salonId, bookingStatus: "REJECTED" } }) : 0;
    const countCancelled = salonId ? await Appointment.count({ where: { salonId, bookingStatus: "CANCELLED" } }) : 0;

    const menuText =
      `🏢 *SALON OWNER MENU* 🏢\n\n` +
      `🏪 *Salon:* ${salon ? salon.name : "Unassigned"}\n` +
      `👤 *Owner:* ${user.fullName}\n` +
      `📍 *Status:* ${salon?.status || "ACTIVE"}\n\n` +
      `• ⏳ New Pending Requests: *${countPending}*\n` +
      `• 💳 Paid & Confirmed: *${countConfirmed}*\n` +
      `• ✅ Accepted (Awaiting Payment): *${countAccepted}*\n` +
      `• 🌟 Completed Appointments: *${countCompleted}*\n` +
      `• 🚫 Cancelled by Clients: *${countCancelled}*`;

    return bot.sendMessage(chatId, menuText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: `⏳ New Bookings (${countPending})`, callback_data: "menu_filter:PENDING" },
            { text: `💳 Paid Bookings (${countConfirmed})`, callback_data: "menu_filter:CONFIRMED" },
          ],
          [
            { text: `✅ Accepted (${countAccepted})`, callback_data: "menu_filter:ACCEPTED" },
            { text: `🌟 Completed (${countCompleted})`, callback_data: "menu_filter:COMPLETED" },
          ],
          [
            { text: `🚫 Cancelled (${countCancelled})`, callback_data: "menu_filter:CANCELLED" },
            { text: `❌ Rejected (${countRejected})`, callback_data: "menu_filter:REJECTED" },
          ],
          [
            { text: "📋 All Salon Bookings", callback_data: "menu_filter:ALL" },
            { text: "🕒 Today's Schedule", callback_data: "cmd_today" },
          ],
          [
            { text: "🏢 My Salon Info", callback_data: "menu_salon" },
            { text: "👥 Staff Team", callback_data: "menu_staff" },
          ],
          [
            { text: "📊 Revenue & Stats", callback_data: "menu_stats" },
            { text: "👤 Owner Profile", callback_data: "menu_profile" },
          ],
        ],
      },
    });
  }

  if (role === "EMPLOYEE") {
    const emp = await Employee.findOne({ where: { userId: user.id }, include: [{ model: Salon, as: "salon" }] });
    const empId = emp ? emp.id : null;
    const countPending = empId ? await Appointment.count({ where: { employeeId: empId, bookingStatus: "PENDING" } }) : 0;
    const countAccepted = empId ? await Appointment.count({ where: { employeeId: empId, bookingStatus: "ACCEPTED" } }) : 0;
    const countConfirmed = empId ? await Appointment.count({ where: { employeeId: empId, bookingStatus: "CONFIRMED" } }) : 0;
    const countCompleted = empId ? await Appointment.count({ where: { employeeId: empId, bookingStatus: "COMPLETED" } }) : 0;
    const countCancelled = empId ? await Appointment.count({ where: { employeeId: empId, bookingStatus: "CANCELLED" } }) : 0;

    const menuText =
      `💇 *SPECIALIST DASHBOARD* 💇\n\n` +
      `👤 *Specialist:* ${user.fullName} (${emp?.title || "Specialist"})\n` +
      `🏪 *Salon:* ${emp?.salon?.name || "Veloura Salon"}\n\n` +
      `• ⏳ New Pending Requests: *${countPending}*\n` +
      `• 💳 Paid & Confirmed: *${countConfirmed}*\n` +
      `• ✅ Accepted: *${countAccepted}*\n` +
      `• 🌟 Completed Services: *${countCompleted}*\n` +
      `• 🚫 Cancelled: *${countCancelled}*`;

    return bot.sendMessage(chatId, menuText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: `⏳ New Bookings (${countPending})`, callback_data: "menu_filter:PENDING" },
            { text: `💳 Paid Bookings (${countConfirmed})`, callback_data: "menu_filter:CONFIRMED" },
          ],
          [
            { text: `✅ Accepted (${countAccepted})`, callback_data: "menu_filter:ACCEPTED" },
            { text: `🌟 Completed (${countCompleted})`, callback_data: "menu_filter:COMPLETED" },
          ],
          [
            { text: `🚫 Cancelled (${countCancelled})`, callback_data: "menu_filter:CANCELLED" },
            { text: "📋 All Assignments", callback_data: "menu_filter:ALL" },
          ],
          [
            { text: "🕒 Today's Schedule", callback_data: "cmd_today" },
            { text: "🌟 My Performance", callback_data: "menu_performance" },
          ],
          [
            { text: "👤 Specialist Profile", callback_data: "menu_profile" },
          ],
        ],
      },
    });
  }

  if (role === "ADMIN") {
    const totalSalons = await Salon.count();
    const activeSalons = await Salon.count({ where: { status: "ACTIVE" } });
    const totalBookings = await Appointment.count();

    const menuText =
      `🛡️ *ADMINISTRATIVE CONTROL MENU* 🛡️\n\n` +
      `Veloura Platform Management Center\n` +
      `🏢 Salons: *${totalSalons}* (*${activeSalons}* Active)\n` +
      `📅 Bookings: *${totalBookings}* Total`;

    return bot.sendMessage(chatId, menuText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📊 Platform Metrics", callback_data: "menu_adminmetrics" },
            { text: "🏢 All Salons", callback_data: "menu_adminsalons" },
          ],
          [
            { text: "📋 System Bookings", callback_data: "menu_filter:ALL" },
            { text: "👤 Admin Profile", callback_data: "menu_profile" },
          ],
        ],
      },
    });
  }
};

/**
 * Handle Filtering Bookings by Status
 */
const handleBookingsFilter = async (chatId, user, statusFilter = "ALL") => {
  if (!bot || !user) return;
  const role = (user.role || "").toUpperCase();

  let whereCondition = {};
  if (statusFilter !== "ALL") {
    whereCondition.bookingStatus = statusFilter;
  }

  if (role === "CUSTOMER") {
    whereCondition.customerId = user.id;
  } else if (role === "OWNER") {
    const salon = await Salon.findOne({ where: { ownerId: user.id } });
    if (salon) whereCondition.salonId = salon.id;
    else return bot.sendMessage(chatId, "No salon assigned to your owner account.");
  } else if (role === "EMPLOYEE") {
    const employee = await Employee.findOne({ where: { userId: user.id } });
    if (employee) whereCondition.employeeId = employee.id;
    else return bot.sendMessage(chatId, "No specialist profile found for your account.");
  }

  const bookings = await Appointment.findAll({
    where: whereCondition,
    limit: 6,
    order: [["appointmentDate", "DESC"], ["appointmentTime", "DESC"]],
    include: [
      { model: Salon, as: "salon", attributes: ["name", "address", "city"] },
      { model: Service, as: "service", attributes: ["name", "price", "duration"] },
      { model: Employee, as: "employee", attributes: ["name"] },
      { model: User, as: "customer", attributes: ["fullName", "phone"] },
      { model: Payment, as: "payment", attributes: ["amount", "paymentStatus", "transactionId"], required: false },
    ],
  });

  const statusTitle = {
    PENDING: "⏳ New Pending Bookings",
    ACCEPTED: "✅ Accepted Bookings (Awaiting Payment)",
    CONFIRMED: "💳 Paid & Confirmed Bookings",
    COMPLETED: "🌟 Completed Appointments",
    REJECTED: "❌ Rejected Bookings",
    CANCELLED: "🚫 Cancelled Bookings",
    ALL: "📋 All Recent Bookings",
  }[statusFilter] || "Bookings";

  if (bookings.length === 0) {
    return bot.sendMessage(
      chatId,
      `📁 *${statusTitle}*\n\nNo bookings found in this category.`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
        },
      }
    );
  }

  // 1. ================= PENDING BOOKINGS for OWNER / EMPLOYEE =================
  // Display as individual actionable cards with Accept & Reject buttons!
  if (statusFilter === "PENDING" && (role === "OWNER" || role === "EMPLOYEE")) {
    await bot.sendMessage(
      chatId,
      `⏳ *NEW BOOKING REQUESTS (${bookings.length} Found):*\n\nReview and take action directly below:`
    );

    for (const b of bookings) {
      const srvName = b.service?.name || "Service";
      const srvPrice = b.bookedPrice || b.service?.price || "0";
      const srvDuration = b.duration || b.service?.duration || 30;
      const custName = b.customer?.fullName || "Client";
      const custPhone = b.customer?.phone || "N/A";
      const staffName = b.employee?.name || "Assigned Specialist";

      const bookingCard =
        `✨ *NEW BOOKING REQUEST #${b.id}* ✨\n\n` +
        `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
        `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
        `💰 *Price:* ETB ${srvPrice}\n` +
        `📅 *Date & Time:* \`${b.appointmentDate}\` at \`${b.appointmentTime}\`\n` +
        `💇 *Specialist:* ${staffName}\n` +
        `💳 *Payment:* UNPAID (Payment collected upon acceptance)`;

      const inlineButtons = role === "OWNER" ? [
        [
          { text: "✅ Accept Booking", callback_data: `accept_booking:${b.id}` },
          { text: "❌ Decline", callback_data: `reject_booking:${b.id}` },
        ],
      ] : [
        [
          { text: "✅ Accept Booking", callback_data: `accept_emp_booking:${b.id}` },
          { text: "❌ Reject", callback_data: `reject_emp_booking:${b.id}` },
        ],
      ];

      await bot.sendMessage(chatId, bookingCard, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: inlineButtons },
      });
    }

    return bot.sendMessage(chatId, `_Tap below to return to the main menu:_`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
      },
    });
  }

  // 2. ================= PAID (CONFIRMED) BOOKINGS for OWNER / EMPLOYEE =================
  // Display as individual actionable cards with Complete Appointment button!
  if (statusFilter === "CONFIRMED" && (role === "OWNER" || role === "EMPLOYEE")) {
    await bot.sendMessage(
      chatId,
      `💳 *PAID & CONFIRMED BOOKINGS (${bookings.length} Found):*\n\nAppointments verified and ready to be marked completed:`
    );

    for (const b of bookings) {
      const srvName = b.service?.name || "Service";
      const srvPrice = b.bookedPrice || b.service?.price || "0";
      const srvDuration = b.duration || b.service?.duration || 30;
      const custName = b.customer?.fullName || "Client";
      const custPhone = b.customer?.phone || "N/A";
      const staffName = b.employee?.name || "Assigned Specialist";
      const txRef = b.payment?.transactionId || "Direct Payment";

      const bookingCard =
        `💳 *PAID APPOINTMENT #${b.id}* 💳\n\n` +
        `👤 *Customer:* ${custName} (\`${custPhone}\`)\n` +
        `💄 *Service:* ${srvName} (${srvDuration} mins)\n` +
        `💰 *Amount Paid:* ETB ${srvPrice} (PAID ✅)\n` +
        `📅 *Date & Time:* \`${b.appointmentDate}\` at \`${b.appointmentTime}\`\n` +
        `💇 *Specialist:* ${staffName}\n` +
        `🧾 *Reference:* \`${txRef}\``;

      const inlineButtons = role === "OWNER" ? [
        [
          { text: "🌟 Complete Appointment", callback_data: `complete_booking:${b.id}` },
        ],
      ] : [
        [
          { text: "🌟 Complete Service", callback_data: `complete_emp_booking:${b.id}` },
        ],
      ];

      await bot.sendMessage(chatId, bookingCard, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: inlineButtons },
      });
    }

    return bot.sendMessage(chatId, `_Tap below to return to the main menu:_`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
      },
    });
  }

  // 3. ================= CANCELLED / REJECTED / ALL BOOKINGS =================
  let text = `📁 *${statusTitle} (${bookings.length} Shown):*\n\n`;

  bookings.forEach((b, idx) => {
    const status = b.bookingStatus || "PENDING";
    const statusEmoji = status === "ACCEPTED" || status === "CONFIRMED" ? "✅" : status === "COMPLETED" ? "🌟" : status === "PENDING" ? "⏳" : status === "CANCELLED" ? "🚫" : "❌";
    const srvName = b.service?.name || "Service";
    const srvPrice = b.bookedPrice || b.service?.price || "0";
    const srvDuration = b.duration || b.service?.duration || 30;
    const payStatus = b.payment?.paymentStatus || b.paymentStatus || (status === "CONFIRMED" || status === "COMPLETED" ? "PAID" : "UNPAID");

    text += `${idx + 1}. *#${b.id}* · ${statusEmoji} *${status}* (ETB ${srvPrice})\n`;
    text += `   💄 *Service:* ${srvName} (${srvDuration} mins)\n`;
    text += `   📅 *Date:* \`${b.appointmentDate}\` at \`${b.appointmentTime}\`\n`;

    if (role === "CUSTOMER") {
      text += `   🏪 *Salon:* ${b.salon?.name || "Veloura Salon"}\n`;
      text += `   💇 *Specialist:* ${b.employee?.name || "Assigned staff"}\n`;
    } else {
      text += `   👤 *Customer:* ${b.customer?.fullName || "Client"} (\`${b.customer?.phone || "N/A"}\`)\n`;
      if (role === "OWNER") {
        text += `   💇 *Specialist:* ${b.employee?.name || "Assigned staff"}\n`;
      }
    }

    text += `   💳 *Payment:* ${payStatus}\n`;
    if (b.rejectionReason) {
      text += `   📝 *Reason:* ${b.rejectionReason}\n`;
    }
    if (b.cancelledAt) {
      text += `   🕒 *Cancelled At:* ${new Date(b.cancelledAt).toLocaleString()}\n`;
    }
    text += `\n`;
  });

  let inline_keyboard = [];
  if (role === "CUSTOMER" && statusFilter === "ACCEPTED" && bookings.length > 0) {
    const firstAccepted = bookings[0];
    inline_keyboard.push([
      { text: `💳 Pay #${firstAccepted.id}`, callback_data: `pay_cust_booking:${firstAccepted.id}` },
      { text: `❌ Cancel #${firstAccepted.id}`, callback_data: `cancel_cust_booking:${firstAccepted.id}` },
    ]);
  }
  inline_keyboard.push([{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]);

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard },
  });
};

/**
 * Handle Profile View
 */
const handleProfileView = async (chatId, user) => {
  if (!bot || !user) return;
  const role = (user.role || "").toUpperCase();

  let statsLine = "";
  if (role === "CUSTOMER") {
    const total = await Appointment.count({ where: { customerId: user.id } });
    const completed = await Appointment.count({ where: { customerId: user.id, bookingStatus: "COMPLETED" } });
    statsLine = `📊 *Total Bookings:* ${total}\n🌟 *Completed Services:* ${completed}\n`;
  } else if (role === "OWNER") {
    const salon = await Salon.findOne({ where: { ownerId: user.id } });
    statsLine = `🏪 *Managed Salon:* ${salon ? salon.name : "None"}\n📍 *Salon Status:* ${salon?.status || "N/A"}\n`;
  } else if (role === "EMPLOYEE") {
    const emp = await Employee.findOne({ where: { userId: user.id }, include: [{ model: Salon, as: "salon" }] });
    const completed = emp ? await Appointment.count({ where: { employeeId: emp.id, bookingStatus: "COMPLETED" } }) : 0;
    statsLine = `🏪 *Salon:* ${emp?.salon?.name || "N/A"}\n💼 *Title:* ${emp?.title || "Specialist"}\n🌟 *Services Completed:* ${completed}\n`;
  } else if (role === "ADMIN") {
    statsLine = `🛡️ *Privileges:* Super Administrator\n`;
  }

  const profileText =
    `👤 *YOUR PROFILE INFORMATION* 👤\n\n` +
    `📛 *Full Name:* ${user.fullName}\n` +
    `📱 *Phone Number:* \`${user.phone}\`\n` +
    `📧 *Email:* ${user.email || "Not provided"}\n` +
    `🎭 *Account Role:* ${user.role}\n` +
    `🔔 *Telegram Alerts:* ${user.telegramNotifyEnabled ? "✅ Active" : "❌ Disabled"}\n` +
    `📅 *Member Since:* ${new Date(user.createdAt).toLocaleDateString()}\n\n` +
    statsLine;

  bot.sendMessage(chatId, profileText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
    },
  });
};

/**
 * Handle Salon Details View (Owner)
 */
const handleSalonDetailsView = async (chatId, user) => {
  if (!bot || !user) return;
  const salon = await Salon.findOne({ where: { ownerId: user.id } });
  if (!salon) {
    return bot.sendMessage(chatId, "No salon profile linked to your account.", {
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]] },
    });
  }

  const staffCount = await Employee.count({ where: { salonId: salon.id } });
  const totalBookings = await Appointment.count({ where: { salonId: salon.id } });

  const text =
    `🏢 *SALON PROFILE & DETAILS* 🏢\n\n` +
    `🏪 *Salon Name:* ${salon.name}\n` +
    `📍 *Address:* ${salon.address || "Main Street"}, ${salon.subCity ? `${salon.subCity}, ` : ""}${salon.city || "Addis Ababa"}\n` +
    `📞 *Phone:* \`${salon.phone || "N/A"}\`\n` +
    `📧 *Email:* ${salon.email || "N/A"}\n` +
    `⏳ *Operating Status:* ${salon.status || "ACTIVE"}\n` +
    `👥 *Total Specialists:* ${staffCount}\n` +
    `📅 *Total Appointments:* ${totalBookings}\n` +
    `📝 *Description:* ${salon.description || "N/A"}`;

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 View Staff Team", callback_data: "menu_staff" }],
        [{ text: "📊 Revenue & Stats", callback_data: "menu_stats" }],
        [{ text: "⬅️ Back to Menu", callback_data: "menu_main" }],
      ],
    },
  });
};

/**
 * Handle Staff Team View (Owner)
 */
const handleStaffListView = async (chatId, user) => {
  if (!bot || !user) return;
  const salon = await Salon.findOne({ where: { ownerId: user.id } });
  if (!salon) {
    return bot.sendMessage(chatId, "No salon profile linked to your account.");
  }

  const staff = await Employee.findAll({ where: { salonId: salon.id } });
  if (staff.length === 0) {
    return bot.sendMessage(chatId, `👥 *Specialist Team (${salon.name}):*\n\nNo specialists added to your salon yet.`, {
      reply_markup: { inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]] },
    });
  }

  let text = `👥 *Specialist Team at ${salon.name} (${staff.length} Staff):*\n\n`;
  staff.forEach((s, idx) => {
    text += `${idx + 1}. *${s.name}*\n`;
    text += `   💼 *Specialty:* ${s.title || "Beauty Specialist"}\n`;
    text += `   📱 *Phone:* \`${s.phone || "N/A"}\`\n`;
    text += `   🟢 *Status:* ${s.status || "ACTIVE"}\n\n`;
  });

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
    },
  });
};

/**
 * Handle Salon Stats View (Owner)
 */
const handleSalonStatsView = async (chatId, user) => {
  if (!bot || !user) return;
  const salon = await Salon.findOne({ where: { ownerId: user.id } });
  if (!salon) {
    return bot.sendMessage(chatId, "No salon profile linked to your account.");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const totalBookings = await Appointment.count({ where: { salonId: salon.id } });
  const todayBookings = await Appointment.count({ where: { salonId: salon.id, appointmentDate: todayStr } });
  const completedBookings = await Appointment.count({ where: { salonId: salon.id, bookingStatus: "COMPLETED" } });
  const pendingBookings = await Appointment.count({ where: { salonId: salon.id, bookingStatus: "PENDING" } });

  const completedAppts = await Appointment.findAll({
    where: { salonId: salon.id, bookingStatus: "COMPLETED" },
    include: [{ model: Service, as: "service", attributes: ["price"] }],
  });
  const totalRevenue = completedAppts.reduce((sum, a) => sum + Number(a.bookedPrice || a.service?.price || 0), 0);

  const text =
    `📊 *SALON METRICS & REVENUE OVERVIEW* 📊\n\n` +
    `🏪 *Salon:* ${salon.name}\n\n` +
    `💰 *Estimated Total Revenue:* ETB ${totalRevenue.toLocaleString()}\n` +
    `📅 *Total Bookings:* ${totalBookings}\n` +
    `🕒 *Today's Appointments:* ${todayBookings}\n` +
    `🌟 *Completed Appointments:* ${completedBookings}\n` +
    `⏳ *Pending Requests:* ${pendingBookings}\n\n` +
    `_Live operational statistics for ${salon.name}_`;

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 View Salon Bookings", callback_data: "menu_filter:ALL" }],
        [{ text: "⬅️ Back to Menu", callback_data: "menu_main" }],
      ],
    },
  });
};

/**
 * Handle Specialist Performance View (Employee)
 */
const handleSpecialistPerformanceView = async (chatId, user) => {
  if (!bot || !user) return;
  const emp = await Employee.findOne({ where: { userId: user.id }, include: [{ model: Salon, as: "salon" }] });
  if (!emp) {
    return bot.sendMessage(chatId, "No specialist profile found.");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const totalAssigned = await Appointment.count({ where: { employeeId: emp.id } });
  const todayAssigned = await Appointment.count({ where: { employeeId: emp.id, appointmentDate: todayStr } });
  const completed = await Appointment.count({ where: { employeeId: emp.id, bookingStatus: "COMPLETED" } });
  const pending = await Appointment.count({ where: { employeeId: emp.id, bookingStatus: "PENDING" } });

  const text =
    `🌟 *SPECIALIST PERFORMANCE & STATS* 🌟\n\n` +
    `👤 *Specialist:* ${user.fullName}\n` +
    `🏪 *Salon:* ${emp.salon?.name || "Veloura Salon"}\n\n` +
    `🌟 *Completed Appointments:* ${completed}\n` +
    `🕒 *Today's Scheduled Clients:* ${todayAssigned}\n` +
    `⏳ *Pending Assignments:* ${pending}\n` +
    `📋 *All-Time Assigned:* ${totalAssigned}\n\n` +
    `_Keep up the fantastic work delivering exceptional beauty services! ✨_`;

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🕒 Today's Schedule", callback_data: "cmd_today" }],
        [{ text: "⬅️ Back to Menu", callback_data: "menu_main" }],
      ],
    },
  });
};

/**
 * Handle Admin Salons View
 */
const handleAdminSalonsView = async (chatId) => {
  if (!bot) return;
  const salons = await Salon.findAll({
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [{ model: User, as: "owner", attributes: ["fullName", "phone"] }],
  });

  if (salons.length === 0) {
    return bot.sendMessage(chatId, "🏢 No salons registered yet.");
  }

  let text = `🏢 *Salons Directory (${salons.length} Recent):*\n\n`;
  salons.forEach((s, idx) => {
    const statusEmoji = s.status === "ACTIVE" ? "🟢" : s.status === "SUSPENDED" ? "⛔" : "⏳";
    text += `${idx + 1}. *${s.name}* · ${statusEmoji} *${s.status || "ACTIVE"}*\n`;
    text += `   📍 ${s.city || "Addis Ababa"}, ${s.address || "Main branch"}\n`;
    text += `   👤 Owner: ${s.owner?.fullName || "Unassigned"} (\`${s.owner?.phone || "N/A"}\`)\n\n`;
  });

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
    },
  });
};

/**
 * Handle Admin Metrics View
 */
const handleAdminMetricsView = async (chatId) => {
  if (!bot) return;
  const totalSalons = await Salon.count();
  const activeSalons = await Salon.count({ where: { status: "ACTIVE" } });
  const suspendedSalons = await Salon.count({ where: { status: "SUSPENDED" } });
  const pendingSalons = await Salon.count({ where: { status: "PENDING_APPROVAL" } });
  const totalUsers = await User.count();
  const totalCustomers = await User.count({ where: { role: "CUSTOMER" } });
  const totalOwners = await User.count({ where: { role: "OWNER" } });
  const totalSpecialists = await User.count({ where: { role: "EMPLOYEE" } });
  const totalBookings = await Appointment.count();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = await Appointment.count({ where: { appointmentDate: todayStr } });

  const text =
    `🛡️ *PLATFORM METRICS & SYSTEM HEALTH* 🛡️\n\n` +
    `🏢 *Salons:*\n` +
    `• Total: *${totalSalons}* (🟢 *${activeSalons}* Active · ⛔ *${suspendedSalons}* Suspended · ⏳ *${pendingSalons}* Pending)\n\n` +
    `👥 *Users Base:*\n` +
    `• Total Users: *${totalUsers}*\n` +
    `• Customers: *${totalCustomers}* · Owners: *${totalOwners}* · Specialists: *${totalSpecialists}*\n\n` +
    `📅 *Bookings Performance:*\n` +
    `• Today's Appointments: *${todayBookings}*\n` +
    `• All-Time Total: *${totalBookings}*\n\n` +
    `_Veloura Node.js API & Database: Operational ✅_`;

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
    },
  });
};

/**
 * Send Help Menu
 */
const sendHelpMenu = async (chatId, user) => {
  if (!bot) return;
  const role = user ? (user.role || "").toUpperCase() : "CUSTOMER";

  let helpText =
    `📖 *VELOURA TELEGRAM BOT GUIDE* 📖\n\n` +
    `• /menu - Open the interactive visual dashboard\n` +
    `• /today - View your appointments & agenda for today\n` +
    `• /mybookings - View your recent and upcoming bookings\n` +
    `• /profile - Check your profile information\n` +
    `• /status - Check account connection & notification status\n` +
    `• /unlink - Disconnect this Telegram account\n` +
    `• /help - Show this guide\n\n`;

  if (role === "ADMIN") {
    helpText += `🛡️ *Admin Command:* /admin - View live platform metrics\n\n`;
  }

  helpText += `_You can also use the convenient keyboard buttons at the bottom of your screen anytime!_`;

  bot.sendMessage(chatId, helpText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "📱 Open Menu", callback_data: "menu_main" }]],
    },
  });
};

/**
 * Handle /today agenda query
 */
const handleTodayCommand = async (chatId) => {
  if (!bot) return;

  const user = await User.findOne({ where: { telegramChatId: String(chatId) } });
  if (!user) {
    return bot.sendMessage(chatId, "Please connect your Veloura account first using the website.");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  let whereCondition = { appointmentDate: todayStr };
  if (user.role === "CUSTOMER") {
    whereCondition.customerId = user.id;
  } else if (user.role === "OWNER") {
    const salon = await Salon.findOne({ where: { ownerId: user.id } });
    if (salon) whereCondition.salonId = salon.id;
  } else if (user.role === "EMPLOYEE") {
    const employee = await Employee.findOne({ where: { userId: user.id } });
    if (employee) whereCondition.employeeId = employee.id;
  }

  const bookings = await Appointment.findAll({
    where: whereCondition,
    include: [
      { model: Salon, as: "salon", attributes: ["name"] },
      { model: Service, as: "service", attributes: ["name", "duration", "price"] },
      { model: Employee, as: "employee", attributes: ["name"] },
      { model: User, as: "customer", attributes: ["fullName", "phone"] },
    ],
    order: [["appointmentTime", "ASC"]],
  });

  if (bookings.length === 0) {
    return bot.sendMessage(
      chatId,
      `📅 *Today's Agenda (${todayStr}):*\n\nNo appointments scheduled for today. Enjoy your day! ☀️`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
        },
      }
    );
  }

  let message = `📅 *Today's Appointments (${todayStr})* — *${bookings.length} Total:*\n\n`;
  bookings.forEach((b, i) => {
    const time = b.appointmentTime || "TBD";
    const status = b.bookingStatus || "PENDING";
    const statusEmoji = status === "ACCEPTED" || status === "CONFIRMED" ? "✅" : status === "COMPLETED" ? "🌟" : status === "PENDING" ? "⏳" : "❌";
    message += `${i + 1}. *${time}* · ${statusEmoji} *${status}*\n`;
    message += `   💄 *Service:* ${b.service?.name || "Service"} (${b.service?.duration || 30} mins)\n`;
    if (user.role === "CUSTOMER") {
      message += `   🏪 *Salon:* ${b.salon?.name || "Salon"}\n`;
      message += `   💇 *Specialist:* ${b.employee?.name || "Assigned staff"}\n\n`;
    } else {
      message += `   👤 *Customer:* ${b.customer?.fullName || "Client"} (\`${b.customer?.phone || ""}\`)\n\n`;
    }
  });

  bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "⬅️ Back to Menu", callback_data: "menu_main" }]],
    },
  });
};

/**
 * Handle /mybookings query
 */
const handleMyBookingsCommand = async (chatId) => {
  if (!bot) return;

  const user = await User.findOne({ where: { telegramChatId: String(chatId) } });
  if (!user) {
    return bot.sendMessage(chatId, "Please connect your Veloura account first from the website.");
  }

  await handleBookingsFilter(chatId, user, "ALL");
};

/**
 * Generic Sender helper with guaranteed HTTP delivery
 */
const sendTelegramMessage = async (chatId, messageText, options = {}) => {
  if (!chatId) return null;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN is not configured.");
    return null;
  }

  try {
    const payload = {
      chat_id: chatId,
      text: messageText,
      parse_mode: "Markdown",
      ...options,
    };

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.ok) {
      console.log(`[Telegram] ✅ Message delivered to Chat ID ${chatId} (Msg ID: ${data.result?.message_id})`);
    } else {
      console.warn(`[Telegram] ⚠️ Telegram API error:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`[Telegram] ❌ Network error sending to ${chatId}:`, err.message);
    return null;
  }
};

/**
 * NOTIFICATION: New Booking Created
 */
const notifyNewBooking = async (appointmentId) => {
  try {
    console.log(`[Telegram] notifyNewBooking triggered for appointment ID: ${appointmentId}`);

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      console.warn(`[Telegram] Appointment ${appointmentId} not found.`);
      return;
    }

    const customer = await User.findByPk(appointment.customerId);
    const salon = await Salon.findByPk(appointment.salonId);
    const service = await Service.findByPk(appointment.serviceId);
    const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
    const owner = salon ? await User.findByPk(salon.ownerId) : null;

    const serviceName = service?.name || "Beauty Service";
    const servicePrice = appointment.bookedPrice || service?.price || "0";
    const serviceDuration = appointment.duration || service?.duration || 30;
    const salonName = salon?.name || "Veloura Salon";
    const customerName = customer?.fullName || "Valued Customer";
    const customerPhone = customer?.phone || "N/A";
    const employeeName = employee?.name || "Auto-assigned";

    // 1. Notify Customer (with Cancel Booking Button)
    if (customer?.telegramChatId && customer.telegramNotifyEnabled) {
      console.log(`[Telegram] Sending booking confirmation to Customer: ${customer.fullName} (${customer.telegramChatId})`);
      await sendTelegramMessage(
        customer.telegramChatId,
        `🌸 *Booking Request Submitted!* 🌸\n\n` +
        `Your appointment at *${salonName}* for *${serviceName}* has been received.\n\n` +
        `📅 *Date:* \`${appointment.appointmentDate}\`\n` +
        `🕒 *Time:* \`${appointment.appointmentTime}\`\n` +
        `💰 *Price:* ETB ${servicePrice}\n` +
        `👤 *Specialist:* ${employeeName}\n\n` +
        `⏳ *Status:* Pending salon confirmation. We will notify you once accepted!`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "❌ Cancel Booking", callback_data: `cancel_cust_booking:${appointment.id}` },
              ],
            ],
          },
        }
      );
    } else {
      console.log(`[Telegram] Customer (ID: ${customer?.id}) has no linked Telegram chat ID or notifications disabled.`);
    }

    // 2. Notify Salon Owner (with Instant Accept / Decline Buttons!)
    if (owner?.telegramChatId && owner.telegramNotifyEnabled) {
      console.log(`[Telegram] Sending new booking alert to Salon Owner: ${owner.fullName} (${owner.telegramChatId})`);
      await sendTelegramMessage(
        owner.telegramChatId,
        `🔔 *NEW BOOKING REQUEST!* 🔔\n\n` +
        `🏪 *Salon:* ${salonName}\n` +
        `👤 *Customer:* ${customerName} (\`${customerPhone}\`)\n` +
        `💄 *Service:* ${serviceName} (${serviceDuration} mins)\n` +
        `📅 *Date:* \`${appointment.appointmentDate}\` at \`${appointment.appointmentTime}\`\n` +
        `💰 *Amount:* ETB ${servicePrice}\n\n` +
        `Please accept or decline this booking request:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Accept Booking", callback_data: `accept_booking:${appointment.id}` },
                { text: "❌ Decline", callback_data: `reject_booking:${appointment.id}` },
              ],
            ],
          },
        }
      );
    } else {
      console.log(`[Telegram] Salon Owner (ID: ${owner?.id}) has no linked Telegram chat ID or notifications disabled.`);
    }

    // 3. Notify Assigned Employee (with Accept / Reject buttons)
    if (employee?.userId) {
      const employeeUser = await User.findByPk(employee.userId);
      if (employeeUser?.telegramChatId && employeeUser.telegramNotifyEnabled) {
        await sendTelegramMessage(
          employeeUser.telegramChatId,
          `💇 *New Appointment Assigned to You!* 💇\n\n` +
          `👤 *Customer:* ${customerName} (\`${customerPhone}\`)\n` +
          `💄 *Service:* ${serviceName}\n` +
          `📅 *Date:* \`${appointment.appointmentDate}\` at \`${appointment.appointmentTime}\`\n` +
          `⏱️ *Duration:* ${serviceDuration} mins\n` +
          `💰 *Price:* ETB ${servicePrice}\n\n` +
          `Please accept or reject this assignment:`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Accept", callback_data: `accept_emp_booking:${appointment.id}` },
                  { text: "❌ Reject", callback_data: `reject_emp_booking:${appointment.id}` },
                ],
              ],
            },
          }
        );
      }
    }
  } catch (err) {
    console.error("[Telegram] notifyNewBooking error:", err);
  }
};

/**
 * NOTIFICATION: Booking Status Changed (Confirmed, Cancelled, Completed)
 */
const notifyBookingStatusChange = async (appointmentId, status) => {
  try {
    // When status is ACCEPTED, REJECTED, or COMPLETED, createNotification delivers the single rich message with complete details
    if (status === "ACCEPTED" || status === "CONFIRMED" || status === "REJECTED" || status === "COMPLETED") return;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return;

    const customer = await User.findByPk(appointment.customerId);
    const salon = await Salon.findByPk(appointment.salonId);
    const service = await Service.findByPk(appointment.serviceId);

    if (customer?.telegramChatId && customer.telegramNotifyEnabled) {
      const statusTitle =
        status === "COMPLETED"
          ? "🌟 *Service Completed!*"
          : status === "CANCELLED" || status === "REJECTED"
          ? "❌ *Booking Cancelled*"
          : `ℹ️ *Booking Status: ${status}*`;

      await sendTelegramMessage(
        customer.telegramChatId,
        `${statusTitle}\n\n` +
        `Your appointment at *${salon?.name || "Salon"}* for *${service?.name || "Service"}* on *${appointment.appointmentDate}* at *${appointment.appointmentTime}* is now *${status}*.`
      );
    }
  } catch (err) {
    console.error("[Telegram] notifyBookingStatusChange error:", err);
  }
};

/**
 * NOTIFICATION: Booking Accepted (Sent to Customer with Pay & Cancel buttons)
 */
const notifyBookingAccepted = async (appointmentId) => {
  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Salon, as: "salon", attributes: ["name", "phone", "address"], required: false },
        { model: Service, as: "service", attributes: ["name", "duration", "price"], required: false },
        { model: Employee, as: "employee", attributes: ["name"], required: false },
        { model: User, as: "customer", attributes: ["fullName", "phone"], required: false },
        { model: Payment, as: "payment", required: false },
      ],
    });

    if (!appointment) return;

    const customer = appointment.customer || (await User.findByPk(appointment.customerId));
    const isTgEnabled = Boolean(
      customer?.telegramChatId &&
      customer.telegramNotifyEnabled !== false &&
      customer.telegramNotifyEnabled !== 0
    );

    if (isTgEnabled) {
      const sName = appointment.salon?.name || "Veloura Salon";
      const srvName = appointment.service?.name || "Beauty Service";
      const srvDuration = appointment.duration || appointment.service?.duration || 30;
      const srvPrice = appointment.bookedPrice || appointment.service?.price || "0";
      const staffName = appointment.employee?.name || "Assigned Specialist";
      const apptDate = appointment.appointmentDate || "Scheduled Date";
      const apptTime = appointment.appointmentTime || "Scheduled Time";

      console.log(`[Telegram] Sending Booking Accepted alert to Customer: ${customer.fullName} (${customer.telegramChatId})`);

      await sendTelegramMessage(
        customer.telegramChatId,
        `✅ *BOOKING ACCEPTED — PAYMENT REQUIRED* ✅\n\n` +
        `Your booking at *${sName}* for *${srvName}* on \`${apptDate}\` at \`${apptTime}\` has been accepted!\n\n` +
        `💰 *Amount Due:* ETB ${srvPrice}\n` +
        `⏱️ *Duration:* ${srvDuration} mins\n` +
        `💇 *Specialist:* ${staffName}\n\n` +
        `💳 Please complete your payment to confirm your appointment.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "💳 Pay Now", callback_data: `pay_cust_booking:${appointment.id}` },
                { text: "❌ Cancel Booking", callback_data: `cancel_cust_booking:${appointment.id}` },
              ],
            ],
          },
        }
      );
    }
  } catch (err) {
    console.error("[Telegram] notifyBookingAccepted error:", err);
  }
};

/**
 * NOTIFICATION: Payment Received
 */
const notifyPaymentSuccess = async (paymentData) => {
  try {
    const user = await User.findByPk(paymentData.customerId);
    if (user?.telegramChatId && user.telegramNotifyEnabled) {
      await sendTelegramMessage(
        user.telegramChatId,
        `💳 *Payment Receipt Confirmed!* 💳\n\n` +
        `✅ *Amount Paid:* ETB ${paymentData.amount}\n` +
        `🧾 *Reference:* \`${paymentData.txRef || paymentData.reference || "N/A"}\`\n` +
        `📅 *Date:* ${new Date().toLocaleDateString()}\n\n` +
        `Thank you for booking with Veloura!`
      );
    }

    // Also notify assigned employee and salon owner of payment
    if (paymentData.appointmentId) {
      const appointment = await Appointment.findByPk(paymentData.appointmentId);
      if (appointment) {
        const salon = await Salon.findByPk(appointment.salonId);
        const owner = salon?.ownerId ? await User.findByPk(salon.ownerId) : null;
        const employee = appointment.employeeId ? await Employee.findByPk(appointment.employeeId) : null;
        const employeeUser = employee?.userId ? await User.findByPk(employee.userId) : null;
        const duration = appointment.duration || service?.duration || 30;
        const employeeName = employee?.name || "Assigned Specialist";
        const salonName = salon?.name || "Salon";
        const serviceName = service?.name || "Beauty Service";

        const paymentAlertText =
          `💳 *Payment Received from Customer!* 💳\n\n` +
          `🆔 *Booking ID:* #${appointment.id}\n` +
          `👤 *Customer:* ${user?.fullName || "Client"} (\`${user?.phone || "N/A"}\`)\n` +
          `🏪 *Salon:* ${salonName}\n` +
          `💄 *Service:* ${serviceName} (${duration} mins)\n` +
          `📅 *Date & Time:* \`${appointment.appointmentDate}\` at \`${appointment.appointmentTime}\`\n` +
          `💰 *Amount Paid:* ETB ${paymentData.amount}\n` +
          `🧾 *Reference:* \`${paymentData.txRef || paymentData.reference || "N/A"}\`\n` +
          `💇 *Specialist:* ${employeeName}\n\n` +
          `✅ *Payment Status:* PAID. The appointment is confirmed and ready to be completed!`;

        if (employeeUser?.telegramChatId && employeeUser.telegramNotifyEnabled) {
          await sendTelegramMessage(employeeUser.telegramChatId, paymentAlertText, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🌟 Mark as Completed",
                    callback_data: `complete_emp_booking:${appointment.id}`,
                  },
                ],
              ],
            },
          });
        }
        if (owner?.telegramChatId && owner.telegramNotifyEnabled) {
          await sendTelegramMessage(owner.telegramChatId, paymentAlertText, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🌟 Mark as Completed",
                    callback_data: `complete_booking:${appointment.id}`,
                  },
                ],
              ],
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("[Telegram] notifyPaymentSuccess error:", err);
  }
};

/**
 * NOTIFICATION: Admin Alert when New Salon is Registered
 */
const notifyAdminNewSalon = async (salonId) => {
  try {
    const salon = await Salon.findByPk(salonId);
    if (!salon) return;
    const owner = salon.ownerId ? await User.findByPk(salon.ownerId) : null;

    const admins = await User.findAll({
      where: { role: "ADMIN", telegramNotifyEnabled: true },
    });

    const adminMessage =
      `🛡️ *NEW SALON REGISTRATION ALERT!* 🛡️\n\n` +
      `🏪 *Salon:* ${salon.name}\n` +
      `👤 *Owner:* ${owner?.fullName || "Owner"} (\`${owner?.phone || "N/A"}\`)\n` +
      `📍 *Location:* ${salon.city || "Addis Ababa"}, ${salon.address || "Main branch"}\n` +
      `⏳ *Status:* ${salon.status || "PENDING_APPROVAL"}\n\n` +
      `Please review this registration in your Admin Dashboard or type /admin for metrics.`;

    for (const admin of admins) {
      if (admin.telegramChatId) {
        sendTelegramMessage(admin.telegramChatId, adminMessage);
      }
    }
  } catch (err) {
    console.error("[Telegram] notifyAdminNewSalon error:", err);
  }
};

module.exports = {
  initTelegramBot,
  sendTelegramMessage,
  notifyNewBooking,
  notifyBookingAccepted,
  notifyBookingStatusChange,
  notifyPaymentSuccess,
  notifyAdminNewSalon,
};
