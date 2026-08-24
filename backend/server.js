const app = require("./src/app");
const env = require("./src/config/environment");
const { sequelize } = require("./src/models");

async function initializeServer() {
  try {
    // Authenticate database connection pool
    await sequelize.authenticate();
    console.log(
      "Database connection pool established successfully with MySQL.",
    );

    // Ensure Telegram columns exist safely on users table & rejectionReason on appointments
    try {
      const [cols] = await sequelize.query("SHOW COLUMNS FROM `users`");
      const colNames = cols.map((c) => c.Field);
      if (!colNames.includes("telegramChatId")) {
        await sequelize.query("ALTER TABLE `users` ADD COLUMN `telegramChatId` VARCHAR(255) NULL;");
      }
      if (!colNames.includes("telegramUsername")) {
        await sequelize.query("ALTER TABLE `users` ADD COLUMN `telegramUsername` VARCHAR(255) NULL;");
      }
      if (!colNames.includes("telegramAuthToken")) {
        await sequelize.query("ALTER TABLE `users` ADD COLUMN `telegramAuthToken` VARCHAR(255) NULL;");
      }
      if (!colNames.includes("telegramNotifyEnabled")) {
        await sequelize.query("ALTER TABLE `users` ADD COLUMN `telegramNotifyEnabled` TINYINT(1) DEFAULT 1;");
      }

      const [apptCols] = await sequelize.query("SHOW COLUMNS FROM `appointments`");
      const apptColNames = apptCols.map((c) => c.Field);
      if (!apptColNames.includes("rejectionReason")) {
        await sequelize.query("ALTER TABLE `appointments` ADD COLUMN `rejectionReason` VARCHAR(255) NULL;");
      }
    } catch (e) {
      console.warn("Schema verification notice:", e.message);
    }

    // Sync all models to target structural schemas
    await sequelize.sync();
    console.log(
      "All relational database schemas initialized and synced successfully.",
    );

    // Start HTTP Server Listener immediately
    app.listen(env.PORT, () => {
      console.log(
        `Server executing in [${env.NODE_ENV}] mode running on port: ${env.PORT}`,
      );

      // Initialize Telegram Bot Service after server is listening
      try {
        const { initTelegramBot } = require("./src/services/telegramService");
        initTelegramBot();
      } catch (tgErr) {
        console.warn("Telegram bot startup notice:", tgErr.message);
      }
    });
  } catch (error) {
    console.error("Critical Server Initialization Failure:", error.message);
    process.exit(1);
  }
}

initializeServer();
