// models/notification.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable if targeted by role
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    recipientRole: {
      type: DataTypes.ENUM("ADMIN", "OWNER", "CUSTOMER", "EMPLOYEE"),
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Notification;