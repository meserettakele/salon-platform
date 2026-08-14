const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "CASH",
        "TELEBIRR",
        "CHAPA",
        "CBE_BIRR",
        "BANK_TRANSFER",
      ),
      allowNull: false,
    },

    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ETB",
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  },
);

module.exports = Payment;
