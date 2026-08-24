// src/pages/employee/EmployeeDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiChevronRight,
  FiUser,
  FiScissors,
  FiPhone,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { useDateTime } from "../../context/DateTimeContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import {
  getEmployeeBookings,
  acceptEmployeeBooking,
  rejectEmployeeBooking,
} from "../../services/employeeBookingService";

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { formatDate, formatTime } = useDateTime();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // =====================================================
  // FETCH BOOKINGS
  // =====================================================

  const fetchBookings = async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getEmployeeBookings();

      const data = Array.isArray(response) ? response : response?.data || [];

      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch employee bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const getTodayString = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayString();

  const todayBookings = bookings.filter((booking) => {
    if (!booking.appointmentDate) return false;

    return booking.appointmentDate.split("T")[0] === todayString;
  });

  // =====================================================
  // STATISTICS
  // =====================================================

  const pendingRequests = bookings.filter(
    (booking) => (booking.bookingStatus || "").toUpperCase() === "PENDING",
  ).length;

  const acceptedToday = todayBookings.filter(
    (booking) =>
      (booking.bookingStatus || "").toUpperCase() === "ACCEPTED" ||
      (booking.bookingStatus || "").toUpperCase() === "CONFIRMED",
  ).length;

  const completedTotal = bookings.filter(
    (booking) => (booking.bookingStatus || "").toUpperCase() === "COMPLETED",
  ).length;

  // =====================================================
  // ACCEPT BOOKING
  // =====================================================

  const handleAccept = async (bookingId) => {
    try {
      setActionLoading(bookingId);

      await acceptEmployeeBooking(bookingId);

      await fetchBookings(true);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to accept the booking.");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT BOOKING
  // =====================================================

  const handleReject = async (bookingId) => {
    const reason = window.prompt(
      "Enter the reason for rejecting this booking:",
    );

    if (reason === null) {
      return;
    }

    const finalReason = reason.trim();

    if (!finalReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(bookingId);

      await rejectEmployeeBooking(bookingId, finalReason);

      await fetchBookings(true);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to reject the booking.");
    } finally {
      setActionLoading(null);
    }
  };



  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    const normalized = (status || "").toUpperCase();

    switch (normalized) {
      case "PENDING":
        return {
          backgroundColor: "#fef3c7",
          color: "#b45309",
        };

      case "ACCEPTED":
      case "CONFIRMED":
        return {
          backgroundColor: "#dcfce7",
          color: "#15803d",
        };

      case "COMPLETED":
        return {
          backgroundColor: "#dbeafe",
          color: "#1d4ed8",
        };

      case "REJECTED":
      case "CANCELLED":
        return {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
        };

      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151",
        };
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loader />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* =================================================
          WELCOME HERO
      ================================================= */}

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            "linear-gradient(135deg, #e91e63 0%, #881337 60%, #4c0519 100%)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "28px",
          color: "#ffffff",
          boxShadow: "0 12px 32px -8px rgba(233,30,99,0.3)",
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
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: "rgba(255,255,255,0.2)",
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              👤 EMPLOYEE ACCOUNT
            </span>

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
              Welcome, {user?.fullName || user?.name || "Employee"} 👋
            </h1>

            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.85)",
                margin: "6px 0 0",
              }}
            >
              Here is your appointment schedule and booking activity for today.
            </p>
          </div>

          <button
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
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
      </motion.div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {/* Pending */}

        <Card style={statCardStyle}>
          <div style={statIconBox("#fff7ed", "#ea580c")}>
            <FiClock />
          </div>

          <span style={statLabelStyle}>Pending Requests</span>

          <h3
            style={{
              ...statValueStyle,
              color: "#ea580c",
            }}
          >
            {pendingRequests}
          </h3>
        </Card>

        {/* Accepted Today */}

        <Card style={statCardStyle}>
          <div style={statIconBox("#ecfdf5", "#059669")}>
            <FiCheckCircle />
          </div>

          <span style={statLabelStyle}>Accepted Today</span>

          <h3
            style={{
              ...statValueStyle,
              color: "#059669",
            }}
          >
            {acceptedToday}
          </h3>
        </Card>

        {/* Completed */}

        <Card style={statCardStyle}>
          <div style={statIconBox("#eff6ff", "#2563eb")}>
            <FiCheckCircle />
          </div>

          <span style={statLabelStyle}>Completed Total</span>

          <h3
            style={{
              ...statValueStyle,
              color: "#2563eb",
            }}
          >
            {completedTotal}
          </h3>
        </Card>
      </div>

      {/* =================================================
          QUICK ACTION
      ================================================= */}

      <Card
        style={{
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "var(--color-dark)",
                margin: 0,
              }}
            >
              Booking Management
            </h3>

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-muted)",
                margin: "4px 0 0",
              }}
            >
              Review and manage your assigned appointments.
            </p>
          </div>

          <Button onClick={() => navigate("/employee/bookings")}>
            View My Bookings <FiChevronRight />
          </Button>
        </div>
      </Card>

      {/* =================================================
          TODAY'S APPOINTMENTS
      ================================================= */}

      <Card
        padding="0"
        style={{
          overflow: "hidden",
          marginBottom: "28px",
        }}
      >
        <div style={tableHeaderContainer}>
          <div>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: "700",
                color: "var(--color-dark)",
                margin: 0,
              }}
            >
              Today's Appointments
            </h3>

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-muted)",
                margin: "2px 0 0",
              }}
            >
              Your appointment timeline for today
            </p>
          </div>

          <span
            style={{
              fontSize: "0.75rem",
              padding: "4px 9px",
              backgroundColor: "#fce7f3",
              color: "#be185d",
              borderRadius: "10px",
              fontWeight: "700",
            }}
          >
            {todayBookings.length} Appointments
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <div style={emptyContainer}>
            <FiCalendar
              style={{
                fontSize: "2.2rem",
                color: "#9ca3af",
                marginBottom: "10px",
              }}
            />

            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "#6b7280",
              }}
            >
              You have no appointments scheduled for today.
            </p>

            <Button
              variant="text"
              onClick={() => navigate("/employee/bookings")}
              style={{
                marginTop: "8px",
                color: "#e91e63",
              }}
            >
              View All Bookings
            </Button>
          </div>
        ) : (
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {todayBookings.map((booking) => {
              const status = booking.bookingStatus || "PENDING";

              const customer = booking.customer?.fullName || "Customer";

              const service = booking.service?.name || "Service";

              const phone = booking.customer?.phone;

              const statusStyle = getStatusStyle(status);

              const isPending = status.toUpperCase() === "PENDING";

              const isActionLoading = actionLoading === booking.id;

              return (
                <motion.div
                  key={booking.id}
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  style={tableRowStyle}
                >
                  {/* Time */}

                  <div
                    style={{
                      minWidth: "90px",
                      textAlign: "center",
                    }}
                  >
                    <FiClock
                      style={{
                        color: "#e91e63",
                        marginBottom: "3px",
                      }}
                    />

                    <strong
                      style={{
                        display: "block",
                        fontSize: "0.85rem",
                        color: "var(--color-dark)",
                      }}
                    >
                      {formatTime(booking.appointmentTime)}
                    </strong>
                  </div>

                  {/* Appointment Information */}

                  <div
                    style={{
                      flex: 1,
                      padding: "0 18px",
                      minWidth: 0,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--color-dark)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiUser />
                      {customer}
                    </strong>

                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginTop: "4px",
                      }}
                    >
                      <FiScissors />
                      {service}
                    </span>

                    {phone && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--color-muted-light)",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          marginTop: "3px",
                        }}
                      >
                        <FiPhone />
                        {phone}
                      </span>
                    )}
                  </div>

                  {/* Status */}

                  <div
                    style={{
                      marginRight: "12px",
                    }}
                  >
                    <span
                      style={{
                        ...statusStyle,
                        padding: "5px 9px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                      }}
                    >
                      {status.toUpperCase()}
                    </span>
                  </div>

                  {/* Actions */}

                  {isPending && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <button
                        disabled={isActionLoading}
                        onClick={() => handleAccept(booking.id)}
                        style={{
                          padding: "7px 11px",
                          backgroundColor: "#10b981",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          cursor: isActionLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {isActionLoading ? "..." : "Accept"}
                      </button>

                      <button
                        disabled={isActionLoading}
                        onClick={() => handleReject(booking.id)}
                        style={{
                          padding: "7px 11px",
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          cursor: isActionLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// =====================================================
// STYLES
// =====================================================

const statCardStyle = {
  padding: "16px",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  border: "1px solid #f3f4f6",
};

const statIconBox = (bgColor, textColor) => ({
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: bgColor,
  color: textColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.1rem",
  marginBottom: "10px",
});

const statLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: "600",
  color: "var(--color-muted)",
  display: "block",
};

const statValueStyle = {
  fontSize: "1.5rem",
  fontWeight: "800",
  color: "var(--color-dark)",
  margin: "2px 0 0",
  fontFamily: "Manrope, sans-serif",
};

const tableHeaderContainer = {
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid var(--color-border)",
  backgroundColor: "var(--color-card)",
};

const tableRowStyle = {
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  borderBottom: "1px solid var(--color-border)",
};

const emptyContainer = {
  padding: "42px 20px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default EmployeeDashboard;
