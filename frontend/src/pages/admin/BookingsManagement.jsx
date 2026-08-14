// src/pages/admin/BookingsManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";

// Centralized UI Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const BookingsManagement = ({ onMenuClick }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal State for Viewing Booking Details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch All Bookings from Admin Endpoint
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin/bookings");

      const rawData = res.data;
      const bookingsArray = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.data?.bookings)
            ? rawData.data.bookings
            : Array.isArray(rawData?.bookings)
              ? rawData.bookings
              : Array.isArray(rawData?.rows)
                ? rawData.rows
                : [];

      setBookings(bookingsArray);
    } catch (err) {
      console.error("❌ Fetch Bookings Error:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Failed to load platform bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Safe Extractor targeting `bookingStatus`
  const getBookingStatus = (b) => {
    if (!b) return "PENDING";
    const rawStatus =
      b.bookingStatus || b.status || b.booking_status || b.state || "PENDING";
    return String(rawStatus).trim().toUpperCase();
  };

  // Safe Extractor targeting `paymentStatus` with safeguards
  const getPaymentStatus = (b) => {
    if (!b) return "PENDING";
    const rawPayment =
      b.paymentStatus ||
      b.payment_status ||
      b.paymentState ||
      b.status_payment ||
      "PENDING";
    return String(rawPayment).trim().toUpperCase();
  };

  // Helper Extractors
  const getCustomerName = (b) => {
    if (!b) return "Guest";
    const cust = b.Customer || b.user || b.customer || b.User;
    if (cust) {
      if (cust.name) return cust.name;
      if (cust.fullName) return cust.fullName;
      if (cust.firstName || cust.first_name) {
        const fn = cust.firstName || cust.first_name || "";
        const ln = cust.lastName || cust.last_name || "";
        return `${fn} ${ln}`.trim();
      }
    }
    return b.customerName || b.userName || "Guest";
  };

  const getSalonName = (b) => {
    if (!b) return "N/A";
    const salon = b.Salon || b.salon;
    return salon?.name || b.salonName || "N/A";
  };

  const getServiceName = (b) => {
    if (!b) return "N/A";
    const service = b.Service || b.service;
    return service?.name || b.serviceName || "N/A";
  };

  const getEmployeeName = (b) => {
    if (!b) return "Unassigned";
    const emp = b.Employee || b.employee || b.Staff || b.staff;
    if (emp) {
      if (emp.name) return emp.name;
      if (emp.fullName) return emp.fullName;
      if (emp.firstName || emp.first_name) {
        const fn = emp.firstName || emp.first_name || "";
        const ln = emp.lastName || emp.last_name || "";
        return `${fn} ${ln}`.trim();
      }
    }
    return b.employeeName || b.staffName || "Unassigned";
  };

  const getDateTime = (b) => {
    if (!b) return { date: "N/A", time: "" };
    const date =
      b.bookingDate || b.appointmentDate || b.date || b.booking_date || "N/A";
    const time =
      b.bookingTime || b.appointmentTime || b.time || b.booking_time || "";
    return { date, time };
  };

  const getTotalPrice = (b) => {
    const val =
      b?.totalPrice ?? b?.price ?? b?.amount ?? b?.total_price ?? "0.00";
    return `${val} ETB`;
  };

  // Compute Statistics using Database Values
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => getBookingStatus(b) === "PENDING").length,
    accepted: bookings.filter((b) =>
      ["ACCEPTED", "CONFIRMED"].includes(getBookingStatus(b)),
    ).length,
    completed: bookings.filter((b) => getBookingStatus(b) === "COMPLETED")
      .length,
    cancelled: bookings.filter((b) =>
      ["CANCELLED", "CANCELED"].includes(getBookingStatus(b)),
    ).length,
    rejected: bookings.filter((b) => getBookingStatus(b) === "REJECTED").length,
  };

  // Filter Bookings by Search & Status
  const filteredBookings = bookings.filter((booking) => {
    const st = getBookingStatus(booking);

    // Status Filter
    if (selectedStatus !== "ALL") {
      if (
        selectedStatus === "ACCEPTED" &&
        !["ACCEPTED", "CONFIRMED"].includes(st)
      ) {
        return false;
      } else if (
        selectedStatus === "CANCELLED" &&
        !["CANCELLED", "CANCELED"].includes(st)
      ) {
        return false;
      } else if (
        selectedStatus !== "ACCEPTED" &&
        selectedStatus !== "CANCELLED" &&
        st !== selectedStatus
      ) {
        return false;
      }
    }

    // Search Filter
    const query = searchTerm.toLowerCase();
    const customerName = getCustomerName(booking).toLowerCase();
    const salonName = getSalonName(booking).toLowerCase();
    const bookingId = String(booking.id || "").toLowerCase();

    return (
      customerName.includes(query) ||
      salonName.includes(query) ||
      bookingId.includes(query)
    );
  });

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "1280px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* MOBILE SIDEBAR TOGGLE HEADER */}
      {onMenuClick && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={onMenuClick}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
            aria-label="Open sidebar navigation"
          >
            ☰
          </button>
          <span
            style={{ fontWeight: "600", fontSize: "1rem", color: "#374151" }}
          >
            Admin Menu
          </span>
        </div>
      )}

      {/* PAGE HEADER SECTION */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#111827",
            margin: 0,
          }}
        >
          📅 Platform Bookings Monitor
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>
          Monitor and track all customer appointments across all registered
          platform salons.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* STATISTICS OVERVIEW CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <StatCard
          label="Total Bookings"
          count={stats.total}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          label="Pending"
          count={stats.pending}
          color="#f59e0b"
          bgColor="#fffbe1"
        />
        <StatCard
          label="Accepted / Confirmed"
          count={stats.accepted}
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatCard
          label="Completed"
          count={stats.completed}
          color="#6366f1"
          bgColor="#eef2ff"
        />
        <StatCard
          label="Cancelled"
          count={stats.cancelled}
          color="#ef4444"
          bgColor="#fef2f2"
        />
        <StatCard
          label="Rejected"
          count={stats.rejected}
          color="#6b7280"
          bgColor="#f3f4f6"
        />
      </div>

      {/* SEARCH AND FILTERS */}
      <Card style={{ marginBottom: "20px", padding: "16px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search Field */}
          <div style={{ flex: "1 1 280px" }}>
            <Input
              placeholder="🔍 Search by Customer, Salon, or Booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              "ALL",
              "PENDING",
              "ACCEPTED",
              "COMPLETED",
              "CANCELLED",
              "REJECTED",
            ].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: selectedStatus === st ? "#ec4899" : "#e5e7eb",
                  backgroundColor: selectedStatus === st ? "#fdf2f8" : "#fff",
                  color: selectedStatus === st ? "#db2777" : "#374151",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {st === "ACCEPTED"
                  ? "Accepted / Confirmed"
                  : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* BOOKINGS TABLE */}
      {loading ? (
        <Loader />
      ) : filteredBookings.length === 0 ? (
        <Card
          style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
        >
          No bookings match your search criteria or filter.
        </Card>
      ) : (
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "850px",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Salon</th>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Booking Status</th>
                  <th style={thStyle}>Payment</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const customerName = getCustomerName(b);
                  const salonName = getSalonName(b);
                  const serviceName = getServiceName(b);
                  const staffName = getEmployeeName(b);
                  const { date, time } = getDateTime(b);

                  return (
                    <tr
                      key={b.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={tdStyle}>
                        <strong>#{b.id}</strong>
                      </td>
                      <td style={tdStyle}>{customerName}</td>
                      <td style={tdStyle}>
                        <strong>{salonName}</strong>
                      </td>
                      <td style={{ ...tdStyle, color: "#4b5563" }}>
                        {serviceName}
                      </td>
                      <td style={{ ...tdStyle, color: "#4b5563" }}>
                        {staffName}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <div>{date}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {time}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={getBookingStatus(b)} />
                      </td>
                      <td style={tdStyle}>
                        <PaymentBadge status={getPaymentStatus(b)} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleOpenDetails(b)}
                        >
                          👁️ View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* READ-ONLY BOOKING DETAILS MODAL */}
      {showModal && selectedBooking && (
        <div style={modalBackdropStyle}>
          <div
            style={{ ...modalContentStyle, maxWidth: "550px", width: "92%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#111827" }}>
                📋 Booking Details #{selectedBooking.id}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "0.875rem",
              }}
            >
              <DetailBox
                label="Customer"
                value={getCustomerName(selectedBooking)}
              />
              <DetailBox label="Salon" value={getSalonName(selectedBooking)} />
              <DetailBox
                label="Service"
                value={getServiceName(selectedBooking)}
              />
              <DetailBox
                label="Staff Assigned"
                value={getEmployeeName(selectedBooking)}
              />
              <DetailBox
                label="Date"
                value={getDateTime(selectedBooking).date}
              />
              <DetailBox
                label="Time"
                value={getDateTime(selectedBooking).time || "N/A"}
              />
              <DetailBox
                label="Booking Status"
                value={
                  <StatusBadge status={getBookingStatus(selectedBooking)} />
                }
              />
              <DetailBox
                label="Payment Status"
                value={
                  <PaymentBadge status={getPaymentStatus(selectedBooking)} />
                }
              />
              <DetailBox
                label="Total Amount"
                value={getTotalPrice(selectedBooking)}
              />
            </div>

            <p
              style={{
                marginTop: "16px",
                fontSize: "0.75rem",
                color: "#6b7280",
                fontStyle: "italic",
              }}
            >
              * Note: As Platform Administrator, status updates are managed
              directly by salon owners.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Helper Components
const StatCard = ({ label, count, color, bgColor }) => (
  <div
    style={{
      backgroundColor: bgColor,
      borderRadius: "10px",
      padding: "12px 16px",
      border: `1px solid ${color}33`,
    }}
  >
    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: color }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "1.4rem",
        fontWeight: "700",
        color: "#111827",
        marginTop: "2px",
      }}
    >
      {count}
    </div>
  </div>
);

const DetailBox = ({ label, value }) => (
  <div
    style={{
      backgroundColor: "#f9fafb",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #f3f4f6",
    }}
  >
    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>
      {label}
    </div>
    <div style={{ fontWeight: "600", color: "#111827" }}>{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const st = (status || "PENDING").toUpperCase();
  const config = {
    PENDING: { bg: "#fef3c7", color: "#d97706" },
    ACCEPTED: { bg: "#d1fae5", color: "#059669" },
    CONFIRMED: { bg: "#d1fae5", color: "#059669" },
    COMPLETED: { bg: "#e0e7ff", color: "#4f46e5" },
    CANCELLED: { bg: "#fee2e2", color: "#dc2626" },
    CANCELED: { bg: "#fee2e2", color: "#dc2626" },
    REJECTED: { bg: "#f3f4f6", color: "#4b5563" },
  };
  const current = config[st] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.75rem",
        fontWeight: "600",
        backgroundColor: current.bg,
        color: current.color,
      }}
    >
      {st}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const st = (status || "PENDING").toUpperCase();

  const config = {
    PAID: { bg: "#d1fae5", color: "#059669" },
    COMPLETED: { bg: "#d1fae5", color: "#059669" },
    SUCCESS: { bg: "#d1fae5", color: "#059669" },
    PENDING: { bg: "#fef3c7", color: "#d97706" },
    UNPAID: { bg: "#fff7ed", color: "#c2410c" },
    PROCESSING: { bg: "#eff6ff", color: "#2563eb" },
    FAILED: { bg: "#fee2e2", color: "#dc2626" },
    CANCELLED: { bg: "#fee2e2", color: "#dc2626" },
    REFUNDED: { bg: "#f3e8ff", color: "#7e22ce" },
    PARTIAL: { bg: "#f0fdf4", color: "#15803d" },
  };

  const current = config[st] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.75rem",
        fontWeight: "600",
        backgroundColor: current.bg,
        color: current.color,
        display: "inline-block",
        textAlign: "center",
      }}
    >
      {st}
    </span>
  );
};

// Styles
const thStyle = {
  padding: "12px 16px",
  color: "#4b5563",
  fontWeight: "600",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "12px 16px",
  color: "#111827",
  verticalAlign: "middle",
};

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "16px",
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  maxHeight: "85vh",
  overflowY: "auto",
};

export default BookingsManagement;
