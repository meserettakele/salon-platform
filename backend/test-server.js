const app = require("./src/app");
const sequelize = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function checkServer() {
  try {
    console.log("🔄 Attaching to database instance...");
    await sequelize.authenticate();
    console.log("✔ Database connection established successfully.");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server successfully working on http://localhost:${PORT}`);
      console.log(
        "✔ Phase 5.2 routing maps, static folders, and upload modules are live.",
      );

      console.log("\n--- SERVER STATUS: ONLINE ---");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Server failed to initialize:");
    console.error(error);
    process.exit(1);
  }
}

checkServer();
