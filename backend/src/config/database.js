const { Sequelize } = require("sequelize");
const env = require("./environment");

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASS, {
  host: env.DB.HOST,
  port: env.DB.PORT,
  dialect: "mysql",
  logging: env.NODE_ENV === "development" ? console.log : false,
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
