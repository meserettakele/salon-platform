const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalonCategory = sequelize.define(
  "SalonCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "salon_categories",
    timestamps: false,
  },
);

module.exports = SalonCategory;
