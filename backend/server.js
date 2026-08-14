const app = require("./src/app");
const env = require("./src/config/environment");
const { sequelize } = require("./src/models"); // Updated to import unified models index

async function initializeServer() {
  try {
    // Authenticate database connection pool
    await sequelize.authenticate();
    console.log(
      "Database connection pool established successfully with MySQL.",
    );

    // Sync all models to target structural schemas
    // NOTE: In development mode, use { alter: true } or { force: false } to maintain data stability.
    await sequelize.sync();
    console.log(
      "All relational database schemas initialized and synced successfully.",
    );

    // Start HTTP Server Listener
    app.listen(env.PORT, () => {
      console.log(
        `Server executing in [${env.NODE_ENV}] mode running on port: ${env.PORT}`,
      );
    });
  } catch (error) {
    console.error("Critical Server Initialization Failure:", error.message);
    process.exit(1);
  }
}

initializeServer();
