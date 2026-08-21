// src/pages/shared/NotificationsPage.jsx
// Shared notifications page used by Owner, Admin, Employee, and Customer roles.
// The backend /api/v1/notifications endpoint is already role-aware -- it returns
// only the notifications that belong to the currently logged-in user''s userId / recipientRole.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = user?.role ? user.role.toUpperCase() : "";
  const isCustomer = currentRole === "CUSTOMER";

  const roleSubtitle = {
    CUSTOMER: "Stay updated with your appointments and activity.",
    OWNER: "Stay updated with new bookings, cancellations, and salon activity.",
    EMPLOYEE: "Stay updated with your assigned appointments and schedule changes.",
    ADMIN: "Stay updated with platform activity and system notifications.",
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/notifications");
      let dataList = [];
      if (Array.isArray(res)) {
        dataList = res;
      } else if (Array.isArray(res?.notifications)) {
        dataList = res.notifications;
      } else if (Array.isArray(res?.data)) {
        dataList = res.data;
      } else if (Array.isArray(res?.data?.notifications)) {
        dataList = res.data.notifications;
      } else if (res?.data?.notifications) {
        dataList = res.data.notifications;
      }
      setNotifications(dataList);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.response?.data?.message || err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAsRead = async (notifId, isUnread) => {
    if (!isUnread) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id || n._id) === notifId ? { ...n, isRead: true } : n)
      );
      await api.patch(`/notifications/${notifId}/read`);
    } catch (err) { console.warn("Failed to mark as read:", err); }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      await api.patch("/notifications/read-all");
    } catch (err) { console.warn("Failed to mark all read:", err); }
  };

  const handleCancelBooking = async (e, bookingId, notifId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setActionLoadingId(notifId);
      await api.patch(`/customer/bookings/${bookingId}/cancel`);
      alert("Booking cancelled successfully.");
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally { setActionLoadingId(null); }
  };

  const handlePayNow = (e, bookingId) => {
    e.stopPropagation();
    navigate(`/customer/payment?bookingId=${bookingId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.toLocaleString();
  };

  const getTypeIcon = (type) => {
    switch ((type || "").toUpperCase()) {
      case "BOOKING": case "APPOINTMENT": case "BOOKING_ACCEPTED": case "BOOKING_CONFIRMED": return "📅";
      case "BOOKING_CANCELLED": case "CANCELLED": return "❌";
      case "PAYMENT": case "PAYMENT_REQUIRED": return "💳";
      case "SYSTEM": return "⚙️";
      case "NEW_BOOKING": return "🆕";
      default: return "🔔";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#111827", margin: 0 }}>
            🔔 Notifications
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "4px 0 0 0" }}>
            {roleSubtitle[currentRole] || "Stay updated with your latest activity."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{ padding: "6px 12px", fontSize: "0.8rem", fontWeight: "600", color: "#db2777", border: "1px solid #fbcfe8", borderRadius: "8px", backgroundColor: "#fdf2f8", cursor: "pointer" }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444", color: "#b91c1c", marginBottom: "16px", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", padding: "40px 20px", borderRadius: "12px", border: "1px solid #e5e7eb", textAlign: "center", color: "#6b7280" }}>
          <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>🔔</span>
          <p style={{ fontSize: "1rem", fontWeight: "600", color: "#374151", margin: 0 }}>No notifications yet</p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: "4px 0 0 0" }}>
            You will see updates here when there is new activity for your account.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((item, index) => {
            const notifId = item.id || item._id;
            const isUnread = !item.isRead && !item.read;
            const appt = item.appointment || item.booking || {};
            const salonName = appt.salon?.name || appt.salonName || item.salon?.name || "";
            const serviceName = appt.service?.name || appt.serviceName || item.service?.name || "";
            const specialistName = appt.employee?.name || appt.specialistName || item.employee?.name || "";
            const customerName = appt.customer?.name || appt.customerName || item.customer?.name || "";
            const apptDate = appt.appointmentDate || item.appointmentDate || "";
            const apptTime = appt.appointmentTime || item.appointmentTime || "";
            const targetBookingId = item.bookingId || appt.bookingId || appt.id;
            const hasDetails = Boolean(salonName || serviceName || specialistName || customerName || apptDate);
            const showCustomerActions = isCustomer && (
              item.type?.toUpperCase() === "BOOKING_ACCEPTED" ||
              item.type?.toUpperCase() === "PAYMENT_REQUIRED" ||
              item.actionRequired
            );

            return (
              <div
                key={notifId || index}
                onClick={() => handleMarkAsRead(notifId, isUnread)}
                style={{
                  backgroundColor: isUnread ? "#fff5f8" : "#ffffff",
                  border: isUnread ? "1px solid #fbcfe8" : "1px solid #e5e7eb",
                  borderRadius: "12px", padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  position: "relative", transition: "all 0.2s ease",
                  cursor: isUnread ? "pointer" : "default",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isUnread && (
                      <span style={{ height: "8px", width: "8px", backgroundColor: "#db2777", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: "1.1rem" }}>{getTypeIcon(item.type)}</span>
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                      {item.title || "Notification"}
                    </h3>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af", whiteSpace: "nowrap", marginLeft: "8px" }}>
                    {formatDate(item.createdAt || item.date)}
                  </span>
                </div>

                <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: "0 0 10px 0" }}>{item.message}</p>

                {hasDetails && (
                  <div style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px", fontSize: "0.8rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
                    {salonName && <div><span style={{ color: "#9ca3af", display: "block" }}>Salon</span><strong>{salonName}</strong></div>}
                    {serviceName && <div><span style={{ color: "#9ca3af", display: "block" }}>Service</span><strong>{serviceName}</strong></div>}
                    {customerName && !isCustomer && <div><span style={{ color: "#9ca3af", display: "block" }}>Customer</span><strong>{customerName}</strong></div>}
                    {specialistName && isCustomer && <div><span style={{ color: "#9ca3af", display: "block" }}>Specialist</span><strong>{specialistName}</strong></div>}
                    {apptDate && <div><span style={{ color: "#9ca3af", display: "block" }}>Date & Time</span><strong>{apptDate}{apptTime ? ` @ ${apptTime}` : ""}</strong></div>}
                  </div>
                )}

                {item.rejectionReason && (
                  <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", fontSize: "0.8rem", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>
                    <strong>Reason:</strong> {item.rejectionReason}
                  </div>
                )}

                {showCustomerActions && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                    <button
                      onClick={(e) => handleCancelBooking(e, targetBookingId, notifId)}
                      disabled={actionLoadingId === notifId}
                      style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: "600", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "6px", backgroundColor: "#ffffff", cursor: "pointer" }}
                    >
                      {actionLoadingId === notifId ? "Cancelling..." : "Cancel Booking"}
                    </button>
                    <button
                      onClick={(e) => handlePayNow(e, targetBookingId)}
                      style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: "600", color: "#ffffff", border: "none", borderRadius: "6px", backgroundColor: "#db2777", cursor: "pointer" }}
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
