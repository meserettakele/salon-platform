// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../common/Button";
import api from "../../services/api";

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
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

  // Navigation routes configuration for each user role with multi-language labels
  const menuConfigs = {
    CUSTOMER: [
      { path: "/customer/dashboard", icon: "🏠", label: t("dashboard") },
      { path: "/customer/book", icon: "📅", label: t("bookAppointment") },
      { path: "/customer/appointments", icon: "🕒", label: t("myAppointments") },
      { path: "/customer/transactions", icon: "💳", label: t("transactions") },
      { path: "/customer/notifications", icon: "🔔", label: t("notifications") },
    ],
    OWNER: [
      { path: "/owner/dashboard", icon: "🏠", label: t("dashboard") },
      { path: "/owner/salon", icon: "🏪", label: t("salons") },
      { path: "/owner/employees", icon: "👥", label: t("employees") },
      { path: "/owner/services", icon: "💄", label: t("services") },
      { path: "/owner/business-hours", icon: "🕒", label: t("businessHours") },
      { path: "/owner/bookings", icon: "📅", label: t("bookings") },
      { path: "/owner/customers", icon: "👥", label: t("customers") },
      { path: "/owner/transactions", icon: "💳", label: t("transactions") },
      { path: "/owner/notifications", icon: "🔔", label: t("notifications") },
    ],
    EMPLOYEE: [
      { path: "/employee/dashboard", icon: "🏠", label: t("dashboard") },
      { path: "/employee/bookings", icon: "📅", label: t("bookings") },
      { path: "/employee/profile", icon: "👤", label: t("profile") },
      { path: "/employee/notifications", icon: "🔔", label: t("notifications") },
    ],
    ADMIN: [
      { path: "/admin/dashboard", icon: "🏠", label: t("dashboard") },
      { path: "/admin/salons", icon: "🏪", label: t("salons") },
      { path: "/admin/categories", icon: "🎨", label: t("categories") },
      { path: "/admin/bookings", icon: "📅", label: t("bookings") },
      { path: "/admin/reports", icon: "📊", label: t("systemReport") },
      { path: "/admin/profile", icon: "👤", label: t("profile") },
      { path: "/admin/notifications", icon: "🔔", label: t("notifications") },
    ],
  };

  const activeStyle = {
    color: "var(--color-primary)",
    backgroundColor: "var(--color-primary-light)",
    fontWeight: "700",
    borderLeft: "3px solid var(--color-primary)",
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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Main Sidebar Drawer Container */}
      <aside
        style={{
          width: "280px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          borderRadius: "0 var(--radius-ios) var(--radius-ios) 0",
          borderRight: "1px solid var(--color-border)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          backgroundColor: "var(--color-card)",
          overflowY: "auto",
          boxSizing: "border-box",
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

          {/* Clickable Profile Header */}
          <div
            onClick={handleProfileClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "var(--radius-ui)",
              backgroundColor: "var(--color-primary-light)",
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
                (user?.fullName || user?.name || "U").charAt(0).toUpperCase()
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
                {user?.fullName || user?.name || "User"}
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
                  ? (salonName || "Salon Owner")
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
                  padding: "11px 14px",
                  borderRadius: "var(--radius-ui)",
                  fontSize: "0.92rem",
                  transition: "var(--transition-premium)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-dark)",
                  ...(isActive ? activeStyle : {}),
                })}
              >
                <span>{link.icon}</span>
                <span style={{ fontWeight: "600" }}>{link.label}</span>
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
            {t("logout")}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
