const express = require("express");
const sequelize = require("./src/config/database");

// Force-import models and routes to ensure no syntax/reference errors
try {
  require("./src/models/employee");
  const ownerRoutes = require("./src/routes/ownerRoutes");

  const app = express();
  app.use(express.json());
  app.use("/api/owner", ownerRoutes);

  console.log("✅ All files compiled and imported with zero syntax errors.");

  // Test database connection and schema sync
  sequelize
    .authenticate()
    .then(() => {
      console.log("✅ Database connection established successfully.");
      return sequelize.sync();
    })
    .then(() => {
      console.log(
        "✅ Database models synchronized cleanly. Ready for Phase 5.4.",
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Database initialization failed:", err.message);
      process.exit(1);
    });
} catch (error) {
  console.error("❌ Compilation or import error detected:\n", error.stack);
  process.exit(1);
}
