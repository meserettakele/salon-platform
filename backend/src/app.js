const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes"); // Added Phase 5 Routes
const customerRoutes = require("./routes/customerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const employeeBookingRoutes = require("./routes/employeeBookingRoutes");

app.use(cors());

// Global JSON and Form Request Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload folders to allow web browsers/apps to pull images directly
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Route Mountpoints
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/owner", ownerRoutes); // Added Phase 5 Route Mountpoint
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/customer/notifications", notificationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/customer/notifications", notificationRoutes);
app.use("/api/v1/employee", employeeBookingRoutes);

// Base Verification Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Beauty Salon API Backend Engine Status: operational",
    data: { timestamp: new Date() },
  });
});

// Global Fallback Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
});

module.exports = app;
