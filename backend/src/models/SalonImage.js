const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalonImage = sequelize.define(
  "SalonImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "salon_images",
    timestamps: true,
    updatedAt: false, // Image records are an immutable timeline feed
  },
);

module.exports = SalonImage;
