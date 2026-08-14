// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";
import api from "../../services/api";

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [salonName, setSalonName] = useState("");

  useEffect(() => {
    const role = user?.role?.toUpperCase();
    if (role === "OWNER") {
      api.get("/owner/salon")
        .then((res) => {
          const data = res?.data?.data || res?.data || null;
          if (data?.name) setSalonName(data.name);
        })
        .catch(() => {});
    }
  }, [user]);

  // Navigation routes configuration for each user role
  const menuConfigs = {
    CUSTOMER: [
      { path: "/customer/dashboard", label: "🏠 Dashboard" },
      { path: "/customer/book", label: "📅 Book Appointment" },
      { path: "/customer/appointments", label: "📅 Booking History" },
      { path: "/customer/transactions", label: "💳 Transactions" },
      { path: "/customer/notifications", label: "Notifications" },
    ],
    OWNER: [
      { path: "/owner/dashboard", label: "🏠 Dashboard" },
      { path: "/owner/salon", label: "🏪 My Salon" },
      { path: "/owner/employees", label: "👥 Employees" },
      { path: "/owner/services", label: "💄 Services" },
      { path: "/owner/business-hours", label: "🕒 Business Hours" },
      { path: "/owner/bookings", label: "📅 Bookings" },
      { path: "/owner/customers", label: "👥 Customers" },
      { path: "/owner/transactions", label: "💳 Transactions" },
    ],
    EMPLOYEE: [
      { path: "/employee/dashboard", label: "🏠 Dashboard" },
      { path: "/employee/bookings", label: "📅 My Bookings" },
      { path: "/employee/profile", label: "👤 My Profile" },
    ],
    ADMIN: [
      { path: "/admin/dashboard", label: "🏠 Dashboard" },
      { path: "/admin/salons", label: "🏪 Salons Management" },
      { path: "/admin/categories", label: "🎨 Manage Categories" },
      { path: "/admin/bookings", label: "📅 Bookings Monitor" },
      { path: "/admin/reports", label: "📊 System Reports" },
      { path: "/admin/profile", label: "👤 Admin Profile" },
    ],
    EMPLOYEE: [
      { path: "/employee/dashboard", label: "🏠 Dashboard" },
      { path: "/employee/bookings", label: "📅 My Bookings" },
      { path: "/employee/profile", label: "👤 My Profile" },
    ],
  };

  const activeStyle = {
    color: "var(--color-primary)",
    backgroundColor: "rgba(233, 30, 99, 0.05)",
    fontWeight: "600",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (window.innerWidth <= 992) setIsOpen(false);
  };

  const handleProfileClick = () => {
    if (currentRole === "ADMIN") {
      navigate("/admin/profile");
    } else if (currentRole === "CUSTOMER") {
      navigate("/customer/profile");
    } else if (currentRole === "OWNER") {
      navigate("/owner/profile");
    } else if (currentRole === "EMPLOYEE") {
      navigate("/employee/profile");
    }

    if (window.innerWidth <= 992) setIsOpen(false);
  };

  // Safe user role normalization (handles "ADMIN", "admin", "Admin")
  const currentRole = user?.role ? user.role.toUpperCase() : "";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Main Sidebar Drawer Container */}
      <aside
        className="glass-panel"
        style={{
          width: "280px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          borderRadius: "0 var(--radius-ios) var(--radius-ios) 0",
          borderLeft: "none",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          backgroundColor: "var(--color-card)",
          overflowY: "auto",
        }}
      >
        <div>
          {/* Close Button on Mobile */}
          {window.innerWidth <= 992 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "8px",
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: "1.2rem",
                  color: "var(--color-muted)",
                  padding: "4px 8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* 🚀 TELEGRAM-STYLE CLICKABLE PROFILE HEADER */}
          <div
            onClick={handleProfileClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              marginBottom: "24px",
              borderRadius: "var(--radius-ui)",
              backgroundColor: "rgba(233, 30, 99, 0.06)",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            title="Open Profile"
          >
            {/* Circle Avatar */}
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "1.1rem",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {user?.profileImage ? (
                <img
                  src={
                    user.profileImage.startsWith("http://") ||
                    user.profileImage.startsWith("https://")
                      ? user.profileImage
                      : `http://localhost:5000/${user.profileImage.replace(/^\/+/, "")}`
                  }
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                (user?.fullName || user?.name || "O").charAt(0).toUpperCase()
              )}
            </div>

            {/* Profile Info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  color: "var(--color-dark)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.fullName || user?.name || "Salon Owner"}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-primary)",
                  fontWeight: "600",
                  letterSpacing: "0.05em",
                }}
              >
                {currentRole === "OWNER"
                  ? (salonName || "My Salon")
                  : currentRole === "CUSTOMER"
                  ? "Customer Account"
                  : currentRole === "EMPLOYEE"
                  ? "Staff Member"
                  : currentRole === "ADMIN"
                  ? "Admin Account"
                  : "Account"}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {menuConfigs[currentRole]?.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={
                  link.path === "/admin/dashboard" ||
                  link.path === "/customer/dashboard" ||
                  link.path === "/owner/dashboard" ||
                  link.path === "/employee/dashboard"
                }
                onClick={() => {
                  if (window.innerWidth <= 992) setIsOpen(false);
                }}
                style={({ isActive }) => ({
                  padding: "12px 16px",
                  borderRadius: "var(--radius-ui)",
                  fontSize: "0.95rem",
                  transition: "var(--transition-premium)",
                  display: "block",
                  textDecoration: "none",
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-dark)",
                  ...(isActive ? activeStyle : {}),
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div style={{ marginTop: "24px" }}>
          <Button
            variant="secondary"
            onClick={handleLogout}
            style={{ width: "100%" }}
          >
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
