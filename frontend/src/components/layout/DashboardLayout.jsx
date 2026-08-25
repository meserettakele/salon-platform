// src/components/layout/DashboardLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useDateTime } from "../../context/DateTimeContext";
import { Button } from "../common/Button";
import { DateTimeQuickToggle } from "../common/DateTimeQuickToggle";
import api, { getImageUrl } from "../../services/api";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activePopupNotification, setActivePopupNotification] = useState(null);
  const [selectedMessageModal, setSelectedMessageModal] = useState(null);
  const [notifFilter, setNotifFilter] = useState("ALL");
  const previousNotifIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);

  // Header Profile Dropdown & Logout Modal State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);

  const currentRole = user?.role ? user.role.toUpperCase() : "";

  // Helper to map event types or roles to icons
  const getNotificationIcon = (type) => {
    switch ((type || "").toUpperCase()) {
      case "MESSAGE":
      case "CONTACT":
      case "INQUIRY":
        return "💬";
      case "SALON_REGISTRATION":
        return "🏢";
      case "SALON_STATUS":
        return "🏷️";
      case "OWNER_REGISTERED":
        return "👤";
      case "BOOKING":
      case "APPOINTMENT":
      case "BOOKING_ACCEPTED":
      case "BOOKING_CONFIRMED":
        return "✅";
      case "APPOINTMENT_COMPLETED":
        return "🌟";
      case "PAYMENT":
      case "PAYMENT_REQUIRED":
      case "PAYMENT_RECEIVED":
      case "PAYMENT_SUCCESSFUL":
        return "💳";
      case "SYSTEM":
        return "⚙️";
      case "CANCELLED":
      case "BOOKING_CANCELLED":
      case "BOOKING_CANCELLED_BY_CUSTOMER":
      case "BOOKING_REJECTED":
        return "❌";
      default:
        return "🔔";
    }
  };

  const { formatDate, formatTime } = useDateTime();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingNotifications(true);
      const res = await api.get("/notifications");

      // Extract rawData array properly regardless of whether axios interceptor unpacked data
      let rawData = [];
      if (Array.isArray(res)) {
        rawData = res;
      } else if (Array.isArray(res?.notifications)) {
        rawData = res.notifications;
      } else if (Array.isArray(res?.data?.notifications)) {
        rawData = res.data.notifications;
      } else if (Array.isArray(res?.data)) {
        rawData = res.data;
      } else if (res?.notifications && typeof res.notifications === "object") {
        rawData = Array.isArray(res.notifications) ? res.notifications : [res.notifications];
      }

      const formatted = rawData.map((item) => ({
        id: item.id || item._id,
        title: item.title || "Notification",
        message: item.message || item.content || item.body || "",
        type: item.type || "SYSTEM",
        icon: getNotificationIcon(item.type),
        read: Boolean(item.isRead ?? item.read),
        time: item.createdAt ? formatTime(item.createdAt) : "Just now",
        date: item.createdAt ? formatDate(item.createdAt) : "",
        appointment: item.appointment || null,
        link: item.link || item.targetUrl || null,
      }));

      // Detect new unread notifications and pop out the toast
      const newUnreads = formatted.filter(
        (n) => !n.read && !previousNotifIdsRef.current.has(n.id)
      );

      if (newUnreads.length > 0 && !isInitialFetchRef.current) {
        // Trigger the pop-out toast for the newest unread message
        setActivePopupNotification(newUnreads[0]);
      }

      // Store all current IDs
      previousNotifIdsRef.current = new Set(formatted.map((n) => n.id));
      isInitialFetchRef.current = false;

      setNotifications(formatted);
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif) return;
    // Mark as read in backend
    if (!notif.read) {
      await api.patch(`/notifications/${notif.id}/read`).catch(() => null);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
    }
    setIsNotificationsOpen(false);
    setActivePopupNotification(null);

    // If it has a specific link, navigate, otherwise open message modal
    if (notif.link) {
      navigate(notif.link);
    } else {
      setSelectedMessageModal(notif);
    }
  };

  const markAllAsRead = async () => {
    await api.patch("/notifications/read-all").catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (user && token) {
      fetchNotifications();
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 10000);
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
    if (currentRole === "OWNER") return "/customer/settings";
    if (currentRole === "ADMIN") return "/admin/reports";
    return "/customer/settings";
  };

  const getNotificationsPath = () => {
    if (currentRole === "OWNER") return "/owner/notifications";
    if (currentRole === "ADMIN") return "/admin/notifications";
    if (currentRole === "EMPLOYEE") return "/employee/notifications";
    return "/customer/notifications";
  };

  // Filtered notifications based on tab
  const filteredNotifications = notifications.filter((item) => {
    if (notifFilter === "MESSAGES") {
      return (
        item.type === "MESSAGE" ||
        item.type === "CONTACT" ||
        item.type === "INQUIRY" ||
        item.title?.toLowerCase().includes("message") ||
        item.title?.toLowerCase().includes("inquiry")
      );
    }
    if (notifFilter === "BOOKINGS") {
      const t = (item.type || "").toUpperCase();
      return (
        t.includes("BOOKING") ||
        t.includes("APPOINTMENT") ||
        t.includes("CANCEL") ||
        t.includes("REJECT") ||
        t.includes("ACCEPT") ||
        t.includes("PAYMENT") ||
        t.includes("CONFIRM")
      );
    }
    return true;
  });

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
          backgroundColor: "var(--color-card)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
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
                backgroundColor: "var(--color-dark)",
                borderRadius: "2px",
              }}
            ></span>
            <span
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "var(--color-dark)",
                borderRadius: "2px",
              }}
            ></span>
            <span
              style={{
                width: "20px",
                height: "2px",
                backgroundColor: "var(--color-dark)",
                borderRadius: "2px",
              }}
            ></span>
          </button>

          {/* Veloura Brand Header Emblem */}
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              userSelect: "none",
            }}
            title="Go to Veloura Home"
          >
            <img
              src="/veloura-logo.png"
              alt="Veloura Logo"
              style={{
                width: isSmallMobile ? "28px" : "34px",
                height: isSmallMobile ? "28px" : "34px",
                borderRadius: "8px",
                objectFit: "cover",
                boxShadow: "0 2px 6px rgba(216, 69, 112, 0.2)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span
                style={{
                  fontWeight: "800",
                  fontFamily: "var(--font-display)",
                  fontSize: isSmallMobile ? "1.05rem" : "1.25rem",
                  color: "var(--color-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Veloura
              </span>
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-secondary)",
                }}
              >
                Beauty Salon
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Date/Time Toggle, Bell & Profile Picture Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isSmallMobile ? "8px" : "14px",
            flexShrink: 0,
          }}
        >
          {/* Quick Date/Time Toggle */}
          <DateTimeQuickToggle />

          {/* Notification Bell */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              style={{
                background: unreadCount > 0 ? "rgba(216, 69, 112, 0.1)" : "#f3f4f6",
                border: unreadCount > 0 ? "1px solid rgba(216, 69, 112, 0.3)" : "none",
                borderRadius: "50%",
                width: isSmallMobile ? "36px" : "40px",
                height: isSmallMobile ? "36px" : "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.15rem",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
              }}
              title="Notifications & Messages"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    borderRadius: "10px",
                    padding: "2px 6px",
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 5px rgba(225, 29, 72, 0.4)",
                    animation: "pulseBadge 2s infinite",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "12px",
                  width: isSmallMobile ? "310px" : "400px",
                  backgroundColor: "var(--color-card)",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "14px 18px 10px",
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-card)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "0.95rem",
                          fontWeight: "800",
                          color: "var(--color-dark)",
                        }}
                      >
                        Notifications & Messages
                      </h4>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            backgroundColor: "rgba(216, 69, 112, 0.12)",
                            color: "var(--color-primary)",
                            padding: "2px 8px",
                            borderRadius: "999px",
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-primary)",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setNotifFilter("ALL")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: notifFilter === "ALL" ? "var(--color-primary)" : "var(--color-card-subtle)",
                        color: notifFilter === "ALL" ? "#FFFFFF" : "var(--color-muted)",
                      }}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter("MESSAGES")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: notifFilter === "MESSAGES" ? "var(--color-primary)" : "var(--color-card-subtle)",
                        color: notifFilter === "MESSAGES" ? "#FFFFFF" : "var(--color-muted)",
                      }}
                    >
                      💬 Messages
                    </button>
                    <button
                      onClick={() => setNotifFilter("BOOKINGS")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: notifFilter === "BOOKINGS" ? "var(--color-primary)" : "var(--color-card-subtle)",
                        color: notifFilter === "BOOKINGS" ? "#FFFFFF" : "var(--color-muted)",
                      }}
                    >
                      📅 Bookings
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {loadingNotifications ? (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "var(--color-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      Loading notifications...
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div
                      style={{
                        padding: "32px 20px",
                        textAlign: "center",
                        color: "var(--color-muted-light)",
                        fontSize: "0.88rem",
                      }}
                    >
                      <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "6px" }}>📭</span>
                      No notifications found in this view
                    </div>
                  ) : (
                    filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px 18px",
                          borderBottom: "1px solid var(--color-border)",
                          backgroundColor: item.read ? "var(--color-card)" : "var(--color-primary-light)",
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <span style={{ fontSize: "1.3rem", marginTop: "2px", flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.88rem",
                                fontWeight: item.read ? "600" : "800",
                                color: "var(--color-dark)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.title}
                            </p>
                            {!item.read && (
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  backgroundColor: "var(--color-primary)",
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                  marginLeft: "6px",
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              margin: "2px 0 0 0",
                              fontSize: "0.82rem",
                              color: item.read ? "var(--color-muted)" : "var(--color-dark-muted)",
                              lineHeight: "1.4",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.message}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--color-muted-light)" }}>
                              {item.time} {item.date ? `· ${item.date}` : ""}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--color-primary)", fontWeight: "700" }}>
                              View details →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* View all link */}
                <div
                  style={{
                    padding: "10px 16px",
                    borderTop: "1px solid var(--color-border)",
                    textAlign: "center",
                    backgroundColor: "var(--color-card-subtle)",
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
                      color: "var(--color-primary)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    View all notifications & messages →
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
              {(() => {
                const rawImg =
                  user?.profileImage ||
                  user?.profile_image ||
                  user?.avatar ||
                  user?.image ||
                  user?.profilePicture ||
                  user?.photo;
                const avatarSrc = rawImg ? getImageUrl(rawImg) : null;

                return (
                  <>
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user?.fullName || "User"}
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                        style={{
                          width: isSmallMobile ? "34px" : "38px",
                          height: isSmallMobile ? "34px" : "38px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--color-primary)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: avatarSrc ? "none" : "flex",
                        width: isSmallMobile ? "34px" : "38px",
                        height: isSmallMobile ? "34px" : "38px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        color: "#ffffff",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    >
                      {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </>
                );
              })()}

              {!isSmallMobile && (
                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "var(--color-dark)",
                      maxWidth: "110px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.fullName || "User"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      color: "var(--color-muted)",
                      textTransform: "capitalize",
                    }}
                  >
                    {currentRole.toLowerCase()}
                  </div>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "10px",
                  width: "240px",
                  backgroundColor: "var(--color-card)",
                  borderRadius: "14px",
                  boxShadow: "0 14px 35px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--color-border)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-card-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {(() => {
                    const rawImg =
                      user?.profileImage ||
                      user?.profile_image ||
                      user?.avatar ||
                      user?.image ||
                      user?.profilePicture ||
                      user?.photo;
                    const avatarSrc = rawImg ? getImageUrl(rawImg) : null;

                    return avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="User"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1.5px solid var(--color-primary)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-primary)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "0.9rem",
                          flexShrink: 0,
                        }}
                      >
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    );
                  })()}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: "800",
                        color: "var(--color-dark)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.fullName || "User Account"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--color-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.phone || user?.email || "Veloura Member"}
                    </div>
                  </div>
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

      {/* ─── FLOATING TOAST POP-OUT NOTIFICATION ─── */}
      {activePopupNotification && (
        <div
          style={{
            position: "fixed",
            top: "75px",
            right: "20px",
            zIndex: 9999,
            backgroundColor: "var(--color-card)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-lg)",
            borderLeft: "5px solid var(--color-primary)",
            border: "1px solid var(--color-border)",
            padding: "16px 18px",
            maxWidth: "380px",
            width: "calc(100vw - 40px)",
            animation: "slideInRight 0.35s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.4rem" }}>{activePopupNotification.icon}</span>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: "800", color: "var(--color-dark)" }}>
                  {activePopupNotification.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.84rem",
                    color: "var(--color-muted)",
                    lineHeight: "1.4",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {activePopupNotification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePopupNotification(null)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-muted-light)",
                fontSize: "1.1rem",
                cursor: "pointer",
                padding: "2px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={() => setActivePopupNotification(null)}
              style={{
                padding: "5px 12px",
                fontSize: "0.78rem",
                fontWeight: "600",
                color: "var(--color-muted)",
                backgroundColor: "var(--color-card-subtle)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
            <button
              onClick={() => handleNotificationClick(activePopupNotification)}
              style={{
                padding: "5px 14px",
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "#FFFFFF",
                backgroundColor: "var(--color-primary)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Open Message
            </button>
          </div>
        </div>
      )}

      {/* ─── FULL MESSAGE DETAILS MODAL ─── */}
      {selectedMessageModal && (
        <div style={modalOverlayStyle}>
          <div
            style={{
              ...modalContainerStyle,
              maxWidth: "520px",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.8rem" }}>{selectedMessageModal.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "var(--color-dark)" }}>
                    {selectedMessageModal.title}
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
                    Received: {selectedMessageModal.time} {selectedMessageModal.date ? `· ${selectedMessageModal.date}` : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessageModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Message Body Box */}
            <div
              style={{
                backgroundColor: "var(--color-card-subtle)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "0.92rem",
                color: "var(--color-dark)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              {selectedMessageModal.message}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(selectedMessageModal.message);
                  alert("Message details copied to clipboard!");
                }}
                style={{
                  padding: "8px 14px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  color: "var(--color-dark)",
                  backgroundColor: "var(--color-card-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                📋 Copy Details
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setSelectedMessageModal(null);
                    navigate(getNotificationsPath());
                  }}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "var(--color-primary)",
                    backgroundColor: "rgba(216, 69, 112, 0.08)",
                    border: "1px solid rgba(216, 69, 112, 0.2)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  All Notifications
                </button>
                <Button
                  onClick={() => setSelectedMessageModal(null)}
                  style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContainerStyle}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.15rem", fontWeight: "700", color: "var(--color-dark)" }}>
              Confirm Logout
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "var(--color-muted)" }}>
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

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulseBadge {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.18);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
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
  color: "var(--color-dark)",
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
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(4px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const modalContainerStyle = {
  backgroundColor: "var(--color-card)",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "400px",
  width: "100%",
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--color-border)",
};

export default DashboardLayout;
