const sequelize = require("../config/database");

const User = require("./User");
const Salon = require("./Salon");
const Category = require("./Category");
const SalonCategory = require("./SalonCategory");
const Employee = require("./Employee");
const Service = require("./Service");
const EmployeeService = require("./EmployeeService");
const BusinessHour = require("./BusinessHour");
const SalonImage = require("./SalonImage");
const Appointment = require("./Appointment");
const Payment = require("./Payment");
const Review = require("./Review");
const Notification = require("./Notification");

// =========================================================
// CENTRALIZED ASSOCIATIONS
// =========================================================

// User <-> Salon
User.hasOne(Salon, {
  foreignKey: "ownerId",
  as: "salon",
  onDelete: "CASCADE",
});

Salon.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
});

// =========================================================
// User <-> Employee
// =========================================================

User.hasOne(Employee, {
  foreignKey: "userId",
  as: "employeeProfile",
  onDelete: "SET NULL",
});

Employee.belongsTo(User, {
  foreignKey: "userId",
  as: "userAccount",
});

// =========================================================
// Salon <-> Category
// =========================================================

Salon.belongsToMany(Category, {
  through: SalonCategory,
  foreignKey: "salonId",
  as: "categories",
});

Category.belongsToMany(Salon, {
  through: SalonCategory,
  foreignKey: "categoryId",
  as: "salons",
});

// =========================================================
// Salon <-> Employee
// =========================================================

Salon.hasMany(Employee, {
  foreignKey: "salonId",
  as: "employees",
  onDelete: "CASCADE",
});

Employee.belongsTo(Salon, {
  foreignKey: "salonId",
  as: "salon",
});

// =========================================================
// Salon <-> Service
// =========================================================

Salon.hasMany(Service, {
  foreignKey: "salonId",
  as: "services",
  onDelete: "CASCADE",
});

Service.belongsTo(Salon, {
  foreignKey: "salonId",
  as: "salon",
});

// =========================================================
// Employee <-> Service
// =========================================================

Employee.belongsToMany(Service, {
  through: EmployeeService,
  foreignKey: "employeeId",
  as: "services",
});

Service.belongsToMany(Employee, {
  through: EmployeeService,
  foreignKey: "serviceId",
  as: "employees",
});

// =========================================================
// Salon <-> BusinessHour
// =========================================================

Salon.hasMany(BusinessHour, {
  foreignKey: "salonId",
  as: "businessHours",
  onDelete: "CASCADE",
});

BusinessHour.belongsTo(Salon, {
  foreignKey: "salonId",
  as: "salon",
});

// =========================================================
// Salon <-> SalonImage
// =========================================================

Salon.hasMany(SalonImage, {
  foreignKey: "salonId",
  as: "images",
  onDelete: "CASCADE",
});

SalonImage.belongsTo(Salon, {
  foreignKey: "salonId",
  as: "salon",
});

// =========================================================
// User <-> Notification
// =========================================================

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// =========================================================
// Notification <-> Appointment
// =========================================================

Appointment.hasMany(Notification, {
  foreignKey: "bookingId",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(Appointment, {
  foreignKey: "bookingId",
  as: "appointment",
});

// =========================================================
// APPOINTMENTS
// =========================================================

User.hasMany(Appointment, {
  foreignKey: "customerId",
  as: "appointments",
  onDelete: "CASCADE",
});

Appointment.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Salon.hasMany(Appointment, {
  foreignKey: "salonId",
  as: "appointments",
  onDelete: "CASCADE",
});

Appointment.belongsTo(Salon, {
  foreignKey: "salonId",
  as: "salon",
});

Employee.hasMany(Appointment, {
  foreignKey: "employeeId",
  as: "appointments",
  onDelete: "RESTRICT",
});

Appointment.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

Service.hasMany(Appointment, {
  foreignKey: "serviceId",
  as: "appointments",
  onDelete: "RESTRICT",
});

Appointment.belongsTo(Service, {
  foreignKey: "serviceId",
  as: "service",
});

// =========================================================
// Appointment <-> Payment
// =========================================================

Appointment.hasOne(Payment, {
  foreignKey: "appointmentId",
  as: "payment",
  onDelete: "CASCADE",
});

Payment.belongsTo(Appointment, {
  foreignKey: "appointmentId",
  as: "appointment",
});

// =========================================================
// REVIEWS
// =========================================================

User.hasMany(Review, {
  foreignKey: "customerId",
  as: "reviews",
  onDelete: "CASCADE",
});

Review.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Salon.hasMany(Review, {
  foreignKey: "salonId",
  as: "reviews",
  onDelete: "CASCADE",
});

Review.belongsTo(Salon, {
  foreignKey: "salonId",
  as: "salon",
});

// =========================================================
// CATEGORY <-> SERVICE
// =========================================================

Category.hasMany(Service, {
  foreignKey: "categoryId",
  as: "services",
});

Service.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

module.exports = {
  sequelize,
  User,
  Salon,
  Category,
  SalonCategory,
  Employee,
  Service,
  EmployeeService,
  BusinessHour,
  SalonImage,
  Appointment,
  Payment,
  Review,
  Notification,
};
