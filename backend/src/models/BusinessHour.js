const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BusinessHour = sequelize.define(
  "BusinessHour",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "salon_id", // 👈 Maps JS salonId to DB column salon_id
    },
    day: {
      type: DataTypes.ENUM(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ),
      allowNull: false,
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "opening_time", // 👈 Maps JS openingTime to DB column opening_time
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "closing_time", // 👈 Maps JS closingTime to DB column closing_time
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_closed", // 👈 Maps JS isClosed to DB column is_closed
    },
  },
  {
    tableName: "business_hours",
    underscored: true, // 👈 Ensures Sequelize handles snake_case DB columns properly
    timestamps: true,
  },
);
module.exports = BusinessHour;
