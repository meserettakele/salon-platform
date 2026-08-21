// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Login } from "../pages/public/Login";
import { Register } from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";

// Core Page Components
import Home from "../pages/public/Home";
import Salons from "../pages/public/Salons";
import SalonDetails from "../pages/public/SalonDetails";

// Phase 2 Layout Components
import { PublicLayout } from "../components/layout/PublicLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";

// Dashboard Pages
import { CustomerDashboard } from "../pages/customer/CustomerDashboard";
import { BookingFlow } from "../pages/customer/BookingFlow";
import MyAppointments from "../pages/customer/MyAppointments";
import CustomerNotifications from "../pages/customer/CustomerNotifications";
import { CustomerProfile } from "../pages/customer/CustomerProfile";

import { PaymentPage } from "../pages/customer/PaymentPage";
import PaymentSuccessPage from "../pages/customer/PaymentSuccessPage";

// Owner Workspace Pages
import { OwnerDashboard } from "../pages/owner/OwnerDashboard";
import MySalon from "../pages/owner/MySalon";
import Employees from "../pages/owner/Employees";
import Services from "../pages/owner/Services";
import BusinessHours from "../pages/owner/BusinessHours";
import OwnerBookings from "../pages/owner/OwnerBookings";
import CustomersList from "../pages/owner/CustomersList";
import OwnerProfile from "../pages/owner/OwnerProfile";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import SalonsManagement from "../pages/admin/SalonsManagement";
import CategoriesManagement from "../pages/admin/CategoriesManagement";
import BookingsManagement from "../pages/admin/BookingsManagement";
import SystemReport from "../pages/admin/SystemReport";
import AdminProfile from "../pages/admin/AdminProfile";
import OwnerTransactions from "../pages/owner/OwnerTransactions";

// Employee Workspace Pages
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeBookings from "../pages/employee/EmployeeBookings";
import EmployeeProfile from "../pages/employee/EmployeeProfile";

// Shared Pages (used across multiple roles)
import NotificationsPage from "../pages/shared/NotificationsPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages Layout Group */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/salons" element={<Salons />} />
        <Route path="/salons/:id" element={<SalonDetails />} />

        {/* Authentication Gateway Nodes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Dashboard Layout Group */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Customer Workspace Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/book"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <BookingFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/appointments"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/transactions"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Chapa payment return page */}
        <Route
          path="/customer/payment/success"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />

        {/* Salon Owner Workspace Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/salon"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <MySalon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/employees"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/services"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/business-hours"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <BusinessHours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/bookings"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/customers"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <CustomersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/profile"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/transactions"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/notifications"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Employee Workspace Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/bookings"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/notifications"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Platform Administration Workspace Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/salons"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SalonsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CategoriesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <BookingsManagement />
            </ProtectedRoute>
          }
        />
        {/* 📊 SYSTEM & BUSINESS REPORTS */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SystemReport />
            </ProtectedRoute>
          }
        />
        {/* 👤 ADMIN PROFILE ROUTE */}
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Global Safety Redirection Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
