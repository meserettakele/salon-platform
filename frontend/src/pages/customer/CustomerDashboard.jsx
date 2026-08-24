// src/pages/customer/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useDateTime } from "../../context/DateTimeContext";
import { Card } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import bookingService from "../../services/bookingService";
import notificationService from "../../services/notificationservice";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { formatDate, formatTime } = useDateTime();
  const navigate = useNavigate();

  const [nextAppointment, setNextAppointment] = useState(null);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const currentDateString = formatDate(new Date(), { includeWeekday: true });

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      // Fetch Customer Appointments
      const bookingsRes = await bookingService.getCustomerBookings();
      const bookingsList = bookingsRes?.data || bookingsRes || [];

      // Helper function to extract booking status safely
      const getStatus = (b) =>
        (b.bookingStatus || b.status || "").toUpperCase();

      // 1. Calculate Booking Statistics (checking ACCEPTED & CONFIRMED)
      setStats({
        total: bookingsList.length,
        accepted: bookingsList.filter((b) =>
          ["ACCEPTED", "CONFIRMED"].includes(getStatus(b)),
        ).length,
        completed: bookingsList.filter((b) => getStatus(b) === "COMPLETED")
          .length,
        rejected: bookingsList.filter((b) =>
          ["REJECTED", "CANCELLED"].includes(getStatus(b)),
        ).length,
      });

      // 2. Filter for active/upcoming appointment (PENDING or ACCEPTED/CONFIRMED)
      const activeBooking = bookingsList.find((b) =>
        ["PENDING", "ACCEPTED", "CONFIRMED"].includes(getStatus(b)),
      );
      setNextAppointment(activeBooking || null);

      // 3. Filter for Accepted Bookings that require payment
      const pendingPaymentList = bookingsList.filter((b) => {
        const st = getStatus(b);
        const paySt = (b.paymentStatus || "").toUpperCase();
        return (st === "ACCEPTED" || st === "CONFIRMED") && paySt !== "PAID";
      });
      setAcceptedBookings(pendingPaymentList);

      // 4. Fetch Customer Notifications
      try {
        const notifRes = await notificationService.getNotifications();
        const notifList = notifRes?.data || notifRes || [];
        setNotifications(notifList.slice(0, 3));
      } catch (notifErr) {
        console.warn("Notification endpoint note:", notifErr.message);
      }
    } catch (err) {
      setError(err?.message || "Failed to load dashboard overview.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      fetchOverviewData();
    } catch (err) {
      setError(err?.message || "Failed to cancel booking.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* Customer Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            "linear-gradient(135deg, #e05297 0%, #c2185b 60%, #880e4f 100%)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "28px",
          color: "#ffffff",
          boxShadow: "0 12px 32px -8px rgba(224,82,151,0.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ flex: "1 1 420px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                ✨ Customer Dashboard
              </span>

              <span
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                • {currentDateString}
              </span>
            </div>

            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                margin: 0,
                color: "#ffffff",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {getGreeting()}, {user?.fullName || user?.name || "Valued Client"}{" "}
              👋
            </h1>

            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.85)",
                margin: "6px 0 16px 0",
              }}
            >
              Keep track of your appointments, bookings, and salon visits.
            </p>

            {/* Booking Summary Row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 11px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: "0.78rem",
                }}
              >
                <FiCalendar />
                <span>
                  <strong>{stats.total}</strong> Total Bookings
                </span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 11px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: "0.78rem",
                }}
              >
                <FiCheckCircle />
                <span>
                  <strong>{stats.accepted}</strong> Accepted Bookings
                </span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 11px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: "0.78rem",
                }}
              >
                <FiCheckCircle />
                <span>
                  <strong>{stats.completed}</strong> Completed Bookings
                </span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 11px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: "0.78rem",
                }}
              >
                <FiXCircle />
                <span>
                  <strong>{stats.rejected}</strong> Rejected Bookings
                </span>
              </div>
            </div>
          </div>

          {/* Hero Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => navigate("/customer/book")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 18px",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                color: "#c2185b",
                border: "none",
                fontWeight: "700",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              }}
            >
              📅 Book Appointment
            </Button>

            <button
              onClick={() => fetchOverviewData(true)}
              disabled={refreshing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: refreshing ? "not-allowed" : "pointer",
              }}
            >
              <FiRefreshCw
                style={{
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </motion.div>

      {error && <ErrorMessage message={error} />}

      {/* Grid Container for Dashboard Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Upcoming Appointment Overview */}
        <Card>
          <h3
            style={{
              color: "var(--color-primary)",
              marginBottom: "16px",
              fontSize: "1.2rem",
            }}
          >
            Upcoming Appointment
          </h3>

          {nextAppointment ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <strong style={{ fontSize: "1.05rem", display: "block" }}>
                  {nextAppointment.salon?.name ||
                    nextAppointment.salonName ||
                    "Salon"}
                </strong>
                <span
                  style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}
                >
                  {nextAppointment.service?.name ||
                    nextAppointment.serviceName ||
                    "Service"}
                </span>
              </div>

              <div style={{ fontSize: "0.95rem" }}>
                📅 <strong>Date:</strong>{" "}
                {formatDate(nextAppointment.appointmentDate || nextAppointment.bookingDate || nextAppointment.date)} at{" "}
                {formatTime(nextAppointment.appointmentTime || nextAppointment.startTime || nextAppointment.time)}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    backgroundColor: ["ACCEPTED", "CONFIRMED"].includes(
                      (
                        nextAppointment.bookingStatus ||
                        nextAppointment.status ||
                        ""
                      ).toUpperCase(),
                    )
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(212, 175, 55, 0.15)",
                    color: ["ACCEPTED", "CONFIRMED"].includes(
                      (
                        nextAppointment.bookingStatus ||
                        nextAppointment.status ||
                        ""
                      ).toUpperCase(),
                    )
                      ? "#10b981"
                      : "var(--color-gold, #d4af37)",
                    border: `1px solid ${
                      ["ACCEPTED", "CONFIRMED"].includes(
                        (
                          nextAppointment.bookingStatus ||
                          nextAppointment.status ||
                          ""
                        ).toUpperCase(),
                      )
                        ? "#10b981"
                        : "var(--color-gold, #d4af37)"
                    }`,
                  }}
                >
                  Booking:{" "}
                  {nextAppointment.bookingStatus || nextAppointment.status}
                </span>

                <strong style={{ color: "var(--color-primary)" }}>
                  {nextAppointment.service?.price || nextAppointment.price} ETB
                </strong>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)", fontSize: "0.95rem" }}>
              You have no active or upcoming appointments scheduled right now.
            </p>
          )}

          {/* Quick Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={() => navigate("/customer/book")}
              style={{ flex: 1 }}
            >
              Book Appointment
            </Button>
            <Button
              onClick={() => navigate("/customer/appointments")}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "1px solid var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              View All
            </Button>
          </div>
        </Card>

        {/* Recent Notifications Overview */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                color: "var(--color-primary)",
                margin: 0,
                fontSize: "1.2rem",
              }}
            >
              Recent Notifications
            </h3>
            <button
              onClick={() => navigate("/customer/notifications")}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-gold, #d4af37)",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              View All →
            </button>
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.95rem" }}>
              No recent notifications.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(224, 82, 151, 0.04)",
                    borderLeft: "3px solid var(--color-primary)",
                  }}
                >
                  <strong style={{ fontSize: "0.9rem", display: "block" }}>
                    {notif.title}
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                    }}
                  >
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Accepted Bookings Requiring Payment Section */}
      {acceptedBookings.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <Card>
            <h3
              style={{
                color: "var(--color-primary)",
                marginBottom: "16px",
                fontSize: "1.2rem",
              }}
            >
              Accepted Bookings (Action Required)
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {acceptedBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(224, 82, 151, 0.2)",
                    backgroundColor: "rgba(224, 82, 151, 0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "1rem", display: "block" }}>
                      {b.salon?.name || b.salonName || "Salon"} —{" "}
                      {b.service?.name || b.serviceName}
                    </strong>

                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-muted)",
                      }}
                    >
                      Professional:{" "}
                      {b.employee?.name || b.employeeName || "Any Professional"}
                    </span>

                    <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                      📅 {b.bookingDate || b.date} at {b.startTime || b.time} |{" "}
                      <strong>{b.service?.price || b.price} ETB</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button onClick={() => navigate("/customer/transactions")}>
                      Pay Now
                    </Button>

                    <Button
                      onClick={() => handleCancelBooking(b.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #ef4444",
                        color: "#ef4444",
                      }}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
