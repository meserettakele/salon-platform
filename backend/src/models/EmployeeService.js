const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmployeeService = sequelize.define(
  "EmployeeService",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "employee_services",
    timestamps: false,
  },
);

module.exports = EmployeeService;
