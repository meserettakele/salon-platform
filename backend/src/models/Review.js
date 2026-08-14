const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ownerReply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ownerReplyDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    updatedAt: false,
  },
);

module.exports = Review;
