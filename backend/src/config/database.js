const { Sequelize } = require("sequelize");
const env = require("./environment");

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASS, {
  host: env.DB.HOST,
  port: env.DB.PORT,
  dialect: "mysql",
  logging: env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl:
      process.env.DB_SSL === "true" ||
      (env.DB.HOST &&
        env.DB.HOST !== "127.0.0.1" &&
        env.DB.HOST !== "localhost")
        ? { rejectUnauthorized: false }
        : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true, // Auto-manages createdAt and updatedAt fields across tables
    freezeTableName: true, // Enforces exact table names matching model declarations
  },
});

module.exports = sequelize;
