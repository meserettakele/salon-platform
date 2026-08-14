const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Salon = sequelize.define(
  "Salon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true, // Stores the single profile image URL tracking string
    },
    gallery: {
      type: DataTypes.JSON,
      allowNull: true, // Stores the dynamic array layout of gallery image strings
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "salons",
    timestamps: true,
  },
);

module.exports = Salon;
