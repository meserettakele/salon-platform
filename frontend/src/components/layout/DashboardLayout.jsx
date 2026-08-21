// src/components/layout/DashboardLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";
import api from "../../services/api";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Header Profile Dropdown & Logout Modal State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);

  const currentRole = user?.role ? user.role.toUpperCase() : "";

  // Helper to map event types or roles to icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case "BOOKING":
      case "APPOINTMENT":
        return "📅";
      case "PAYMENT":
        return "💳";
      case "SYSTEM":
        return "⚙️";
      case "CANCELLED":
        return "❌";
      default:
        return "🔔";
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingNotifications(true);
      const res = await api.get("/notifications");

      if (res?.data) {
        const rawData =
          res.data.notifications ||
          res.data.data?.notifications ||
          res.data.data ||
          (Array.isArray(res.data) ? res.data : []);

        const formatted = rawData.map((item) => ({
          id: item.id || item._id,
          title: item.title || "Notification",
          message: item.message || item.content || item.body || "",
          icon: getNotificationIcon(item.type),
          read: Boolean(item.isRead ?? item.read),
          time: item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just now",
          appointment: item.appointment || null,
          link: item.link || item.targetUrl || null,
        }));

        setNotifications(formatted);
      }
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (id, link) => {
    await api.patch(`/notifications/${id}/read`).catch(() => null);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setIsNotificationsOpen(false);
    if (link) navigate(link);
  };

  const markAllAsRead = async () => {
    await api.patch("/notifications/read-all").catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (user && token) {
      fetchNotifications();
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      if (width > 992) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dropdown close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMobileOrTablet = screenWidth <= 992;
  const isSmallMobile = screenWidth <= 480;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate("/login");
  };

  const getProfilePath = () => {
    if (currentRole === "OWNER") return "/owner/profile";
    if (currentRole === "ADMIN") return "/admin/profile";
    return "/customer/profile";
  };

  const getSettingsPath = () => {
    if (currentRole === "OWNER") return "/customer/settings"; // or owner settings
    if (currentRole === "ADMIN") return "/admin/reports";
    return "/customer/settings";
  };

  const getNotificationsPath = () => {
    if (currentRole === "OWNER") return "/owner/notifications";
    if (currentRole === "ADMIN") return "/admin/notifications";
    if (currentRole === "EMPLOYEE") return "/employee/notifications";
    return "/customer/notifications";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-warm, #f9fafb)",
        overflowX: "hidden",
      }}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Top Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          padding: isSmallMobile ? "10px 12px" : "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 90,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          boxSizing: "border-box",
        }}
      >
        {/* Left Side: Toggle & Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isSmallMobile ? "8px" : "16px",
            minWidth: 0,
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              cursor: "pointer",
              background: "none",
              border: "none",
              flexShrink: 0,
            }}
            title="Toggle Navigation"
            aria-label="Toggle Sidebar"
          >
            <span
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "#374151",
                borderRadius: "2px",
              }}
            ></span>
            <span
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "#374151",
                borderRadius: "2px",
              }}
            ></span>
            <span
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "#374151",
                borderRadius: "2px",
              }}
            ></span>
          </button>

          <span
            style={{
              fontWeight: "700",
              fontFamily: "Manrope, sans-serif",
              fontSize: isSmallMobile ? "0.95rem" : "1.1rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "#111827",
            }}
          >
            Dashboard
          </span>
        </div>

        {/* Right Side: Bell & Profile Picture Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isSmallMobile ? "8px" : "16px",
            flexShrink: 0,
          }}
        >
          {/* Notification Bell */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              style={{
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: isSmallMobile ? "34px" : "38px",
                height: isSmallMobile ? "34px" : "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                cursor: "pointer",
                position: "relative",
              }}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    borderRadius: "10px",
                    padding: "2px 6px",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    border: "2px solid #ffffff",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "10px",
                  width: isSmallMobile ? "280px" : "360px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "#111827",
                      }}
                    >
                      Notifications
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {unreadCount} unread
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                  {loadingNotifications ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: "0.85rem",
                      }}
                    >
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "0.85rem",
                      }}
                    >
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleNotificationClick(item.id, item.link)
                        }
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px 16px",
                          borderBottom: "1px solid #f3f4f6",
                          backgroundColor: item.read ? "#ffffff" : "#f0f9ff",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem", marginTop: "2px" }}>
                          {item.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.85rem",
                              fontWeight: item.read ? "600" : "700",
                              color: "#111827",
                            }}
                          >
                            {item.title}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0 0",
                              fontSize: "0.8rem",
                              color: item.read ? "#6b7280" : "#374151",
                              lineHeight: "1.35",
                            }}
                          >
                            {item.message}
                          </p>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#9ca3af",
                              marginTop: "6px",
                              display: "block",
                            }}
                          >
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* View all link */}
                <div
                  style={{
                    padding: "10px 16px",
                    borderTop: "1px solid #f3f4f6",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate(getNotificationsPath());
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#db2777",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Picture & Dropdown Menu */}
          <div style={{ position: "relative" }} ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: "20px",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary, #e91e63)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  boxShadow: "0 2px 6px rgba(233,30,99,0.25)",
                }}
              >
                {(user?.fullName || user?.name || "U").charAt(0).toUpperCase()}
              </div>
              {!isSmallMobile && (
                <div style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "#111827",
                      display: "block",
                      lineHeight: "1.2",
                    }}
                  >
                    {user?.fullName || user?.name || "User"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#6b7280",
                      fontWeight: "500",
                    }}
                  >
                    {currentRole}
                  </span>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "8px",
                  width: "220px",
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px -5px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "700", color: "#111827" }}>
                    {user?.fullName || user?.name || "User"}
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                    {user?.email || "owner@salon.com"}
                  </p>
                </div>

                <div style={{ padding: "6px 0" }}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate(getProfilePath());
                    }}
                    style={dropdownMenuItemStyle}
                  >
                    <span>👤</span> My Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate(`${getProfilePath()}#password`);
                    }}
                    style={dropdownMenuItemStyle}
                  >
                    <span>🔒</span> Change Password
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate(getSettingsPath());
                    }}
                    style={dropdownMenuItemStyle}
                  >
                    <span>⚙️</span> Settings
                  </button>

                  <div style={{ borderTop: "1px solid #f3f4f6", margin: "4px 0" }} />

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    style={{ ...dropdownMenuItemStyle, color: "#e11d48" }}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContainerStyle}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "700", color: "#111827" }}>
              Confirm Logout
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "#6b7280" }}>
              Are you sure you want to log out of your salon platform account?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmLogout} style={{ backgroundColor: "#e11d48" }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Outlet Container */}
      <main
        style={{
          marginLeft: !isSidebarOpen || isMobileOrTablet ? "0px" : "280px",
          padding: isSmallMobile ? "16px 12px" : "32px 4%",
          minHeight: "calc(100vh - 65px)",
          transition: "margin-left 0.3s ease",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

const dropdownMenuItemStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "#374151",
  background: "none",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.15s ease",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const modalContainerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "400px",
  width: "100%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

export default DashboardLayout;
