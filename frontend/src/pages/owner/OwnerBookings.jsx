// src/pages/owner/OwnerBookings.jsx
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiCheck,
  FiX,
  FiEye,
  FiDollarSign,
  FiFilter,
} from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useDateTime } from "../../context/DateTimeContext";
import api from "../../services/api";

export const OwnerBookings = () => {
  const { formatDate, formatTime } = useDateTime();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/bookings");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || res?.data?.bookings || [];
      setBookings(list);
      console.log("OWNER BOOKINGS:", list);
    } catch (err) {
      console.error("Error fetching owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      await api.patch(`/owner/bookings/${id}/${action}`);
      fetchBookings();
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalBooking) return;
    try {
      setSubmittingReject(true);
      const reason = rejectionReason.trim() || "Declined by salon";
      await api.patch(`/owner/bookings/${rejectModalBooking.id}/reject`, {
        reason,
      });
      setRejectModalBooking(null);
      setRejectionReason("");
      fetchBookings();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject booking");
    } finally {
      setSubmittingReject(false);
    }
  };

  // Compute Statistics
  const stats = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let waitingPayment = 0;
    let completed = 0;
    let cancelled = 0;
    let rejected = 0;

    bookings.forEach((b) => {
      const bStatus = (b.bookingStatus || b.status || "").toUpperCase();
      const pStatus = (
        b.payment?.paymentStatus ||
        b.paymentStatus ||
        "UNPAID"
      ).toUpperCase();

      if (bStatus === "PENDING") pending++;
      else if (bStatus === "CONFIRMED" || bStatus === "ACCEPTED") {
        if (pStatus === "PENDING_VERIFICATION") waitingPayment++;
        else confirmed++;
      } else if (bStatus === "COMPLETED") completed++;
      else if (bStatus === "CANCELLED") cancelled++;
      else if (bStatus === "REJECTED") rejected++;
    });

    return {
      pending,
      confirmed,
      waitingPayment,
      completed,
      cancelled,
      rejected,
    };
  }, [bookings]);

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bStatus = (b.bookingStatus || b.status || "").toUpperCase();
      const pStatus = (b.paymentStatus || "").toUpperCase();

      let matchesFilter = true;
      if (statusFilter === "PENDING") matchesFilter = bStatus === "PENDING";
      else if (statusFilter === "CONFIRMED")
        matchesFilter =
          (bStatus === "CONFIRMED" || bStatus === "ACCEPTED") &&
          pStatus !== "PENDING_VERIFICATION";
      else if (statusFilter === "WAITING_PAYMENT")
        matchesFilter = pStatus === "PENDING_VERIFICATION";
      else if (statusFilter === "COMPLETED")
        matchesFilter = bStatus === "COMPLETED";
      else if (statusFilter === "CANCELLED")
        matchesFilter = bStatus === "CANCELLED";
      else if (statusFilter === "REJECTED")
        matchesFilter = bStatus === "REJECTED";

      const customerName = b.customer?.fullName || b.customerName || "";
      const serviceName = b.service?.name || b.serviceName || "";
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        customerName.toLowerCase().includes(query) ||
        serviceName.toLowerCase().includes(query) ||
        String(b.id).includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, statusFilter, searchTerm]);

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* 1. PAGE TITLE & HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            color: "var(--color-dark)",
            margin: 0,
            fontFamily: "Manrope, sans-serif",
          }}
        >
          Bookings Management
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--color-muted)", marginTop: "4px" }}>
          Main appointment working console. Review requests, monitor payments,
          and fulfill services.
        </p>
      </div>

      {/* 2. STATS CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <Card style={statCardStyle}>
          <span style={statLabelStyle}>Pending</span>
          <h3 style={{ ...statNumberStyle, color: "#d97706" }}>
            {stats.pending}
          </h3>
        </Card>
        <Card style={statCardStyle}>
          <span style={statLabelStyle}>Confirmed</span>
          <h3 style={{ ...statNumberStyle, color: "#2563eb" }}>
            {stats.confirmed}
          </h3>
        </Card>
        <Card style={statCardStyle}>
          <span style={statLabelStyle}>Payment Waiting</span>
          <h3 style={{ ...statNumberStyle, color: "#9333ea" }}>
            {stats.waitingPayment}
          </h3>
        </Card>
        <Card style={statCardStyle}>
          <span style={statLabelStyle}>Completed</span>
          <h3 style={{ ...statNumberStyle, color: "#059669" }}>
            {stats.completed}
          </h3>
        </Card>
        <Card style={statCardStyle}>
          <span style={statLabelStyle}>Cancelled</span>
          <h3 style={{ ...statNumberStyle, color: "#6b7280" }}>
            {stats.cancelled}
          </h3>
        </Card>
        <Card style={statCardStyle}>
          <span style={statLabelStyle}>Rejected</span>
          <h3 style={{ ...statNumberStyle, color: "#dc2626" }}>
            {stats.rejected}
          </h3>
        </Card>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <Card style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <FiSearch
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Search by customer, service or Booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                fontSize: "0.88rem",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {[
              { id: "ALL", label: "All" },
              { id: "PENDING", label: "Pending" },
              { id: "CONFIRMED", label: "Confirmed" },
              { id: "WAITING_PAYMENT", label: "Payment Waiting" },
              { id: "COMPLETED", label: "Completed" },
              { id: "CANCELLED", label: "Cancelled" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor:
                    statusFilter === tab.id ? "#e91e63" : "#f3f4f6",
                  color: statusFilter === tab.id ? "#ffffff" : "#4b5563",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. BOOKINGS TABLE */}
      <Card padding="0" style={{ overflow: "hidden" }}>
        {filteredBookings.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <FiCalendar
              style={{
                fontSize: "2.5rem",
                color: "#d1d5db",
                marginBottom: "12px",
              }}
            />
            <h4 style={{ margin: 0, fontSize: "1rem", color: "#374151" }}>
              No bookings found
            </h4>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.85rem",
                color: "#9ca3af",
              }}
            >
              No appointments matched your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#fafafa",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Booking Status</th>
                  <th style={thStyle}>Payment Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>
                    Workflow Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const bStatus = (
                    b.bookingStatus ||
                    b.status ||
                    "PENDING"
                  ).toUpperCase();
                  const pStatus = (b.paymentStatus || "UNPAID").toUpperCase();
                  const customerName =
                    b.customer?.fullName || b.customerName || "Customer";
                  const serviceName =
                    b.service?.name || b.serviceName || "Service";
                  const employeeName =
                    b.employee?.fullName ||
                    b.employee?.name ||
                    b.employeeName ||
                    "Unassigned";
                  const rawDate = b.appointmentDate || b.date;
                  const rawTime = b.appointmentTime || b.time;
                  const dateStr = rawDate ? formatDate(rawDate) : "Today";
                  const timeStr = rawTime ? formatTime(rawTime) : "TBD";

                  return (
                    <tr
                      key={b.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={tdStyle}>
                        <strong
                          style={{ fontFamily: "monospace", color: "#6b7280" }}
                        >
                          #{b.id}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#111827" }}>
                          {customerName}
                        </strong>
                      </td>
                      <td style={tdStyle}>{serviceName}</td>
                      <td style={tdStyle}>{employeeName}</td>
                      <td style={tdStyle}>
                        {dateStr} <span style={{ color: "#9ca3af" }}>at</span>{" "}
                        {timeStr}
                      </td>
                      <td style={tdStyle}>
                        <span style={getBookingBadgeStyle(bStatus)}>
                          {bStatus}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={getPaymentBadgeStyle(pStatus)}>
                          {pStatus}
                        </span>
                      </td>

                      {/* WORKFLOW ACTIONS BASED ON STRICT BUSINESS LOGIC */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {/* 1. PENDING STATUS */}
                          {bStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(b.id, "accept")
                                }
                                style={{
                                  padding: "5px 10px",
                                  backgroundColor: "#10b981",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <FiCheck /> Accept
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalBooking(b);
                                  setRejectionReason("");
                                }}
                                style={{
                                  padding: "5px 10px",
                                  backgroundColor: "#ef4444",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <FiX /> Reject
                              </button>
                            </>
                          )}

                          {/* 2. CONFIRMED + UNPAID */}
                          {(bStatus === "CONFIRMED" ||
                            bStatus === "ACCEPTED") &&
                            pStatus === "UNPAID" && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#d97706",
                                  fontWeight: "600",
                                  backgroundColor: "#fffbe6",
                                  padding: "4px 8px",
                                  borderRadius: "8px",
                                }}
                              >
                                ⏳ Waiting for customer payment
                              </span>
                            )}

                          {/* 3. PAYMENT APPROVED (PAID) -> READY TO COMPLETE */}
                          {(bStatus === "CONFIRMED" ||
                            bStatus === "ACCEPTED") &&
                            pStatus === "PAID" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(b.id, "complete")
                                }
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#2563eb",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontSize: "0.78rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                                }}
                              >
                                ✨ Mark as Completed
                              </button>
                            )}

                          {/* 5. COMPLETED / CANCELLED / REJECTED */}
                          {["COMPLETED", "CANCELLED", "REJECTED"].includes(
                            bStatus,
                          ) && (
                            <button
                              onClick={() => setSelectedBooking(b)}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <FiEye /> Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* DETAILS MODAL */}
      {selectedBooking && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
                Appointment Details #{selectedBooking.id}
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "0.88rem",
                color: "#374151",
              }}
            >
              <div>
                <strong>Customer:</strong>{" "}
                {selectedBooking.customer?.fullName ||
                  selectedBooking.customerName ||
                  "N/A"}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {selectedBooking.customer?.email || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong>{" "}
                {selectedBooking.customer?.phone || "N/A"}
              </div>
              <div>
                <strong>Service:</strong>{" "}
                {selectedBooking.service?.name ||
                  selectedBooking.serviceName ||
                  "N/A"}
              </div>
              <div>
                <strong>Assigned Employee:</strong>{" "}
                {selectedBooking.employee?.fullName ||
                  selectedBooking.employee?.name ||
                  selectedBooking.employeeName ||
                  "Unassigned"}
              </div>
              <div>
                <strong>Date & Time:</strong>{" "}
                {selectedBooking.appointmentDate || selectedBooking.date
                  ? formatDate(selectedBooking.appointmentDate || selectedBooking.date)
                  : "N/A"}{" "}
                at{" "}
                {selectedBooking.appointmentTime || selectedBooking.time
                  ? formatTime(selectedBooking.appointmentTime || selectedBooking.time)
                  : "N/A"}
              </div>
              <div>
                <strong>Price:</strong>{" "}
                {selectedBooking.service?.price ||
                  selectedBooking.totalPrice ||
                  "0"}{" "}
                ETB
              </div>
              <div>
                <strong>Booking Status:</strong>{" "}
                {selectedBooking.bookingStatus || selectedBooking.status}
              </div>
              {selectedBooking.rejectionReason && (
                <div style={{ color: "#dc2626" }}>
                  <strong>Rejection Reason:</strong>{" "}
                  {selectedBooking.rejectionReason}
                </div>
              )}
              <div>
                <strong>Payment Status:</strong> {selectedBooking.paymentStatus}
              </div>
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                onClick={() => setSelectedBooking(null)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalBooking && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, maxWidth: "500px" }}>
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
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FiXCircle /> Reject Appointment #{rejectModalBooking.id}
              </h3>
              <button
                onClick={() => setRejectModalBooking(null)}
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

            <p
              style={{
                fontSize: "0.85rem",
                color: "#4b5563",
                marginBottom: "14px",
                lineHeight: "1.4",
              }}
            >
              Please provide a reason for declining{" "}
              <strong>
                {rejectModalBooking.customer?.fullName ||
                  rejectModalBooking.customerName ||
                  "Customer"}
              </strong>
              's request for{" "}
              <strong>
                {rejectModalBooking.service?.name ||
                  rejectModalBooking.serviceName ||
                  "Service"}
              </strong>
              . This explanation will be sent directly to the customer on their dashboard bell and Telegram.
            </p>

            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Quick Presets:
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "14px",
              }}
            >
              {[
                "Fully booked at this time",
                "Specialist unavailable",
                "Time slot conflict",
                "Salon closed / maintenance",
                "Emergency / Schedule conflict",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectionReason(preset)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    backgroundColor:
                      rejectionReason === preset ? "#fee2e2" : "#f9fafb",
                    color: rejectionReason === preset ? "#991b1b" : "#374151",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Rejection Note / Explanation:
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. We are fully booked at 2:00 PM. Please consider booking after 4:00 PM."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Button
                onClick={() => setRejectModalBooking(null)}
                variant="secondary"
                disabled={submittingReject}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmReject}
                disabled={submittingReject}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: submittingReject ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {submittingReject ? "Declining..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const statCardStyle = {
  padding: "14px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #f3f4f6",
};

const statLabelStyle = {
  fontSize: "0.72rem",
  fontWeight: "700",
  color: "#6b7280",
  textTransform: "uppercase",
};

const statNumberStyle = {
  fontSize: "1.4rem",
  fontWeight: "800",
  margin: "2px 0 0 0",
};

const thStyle = {
  padding: "12px 16px",
  color: "var(--color-muted)",
  fontWeight: "700",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const tdStyle = {
  padding: "14px 16px",
  color: "var(--color-dark)",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "16px",
};

const modalContent = {
  backgroundColor: "var(--color-card)",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "480px",
  width: "100%",
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--color-border)",
};

const getBookingBadgeStyle = (status) => {
  const base = {
    padding: "3px 8px",
    borderRadius: "8px",
    fontSize: "0.7rem",
    fontWeight: "700",
  };
  if (status === "ACCEPTED" || status === "CONFIRMED")
    return { ...base, backgroundColor: "#eff6ff", color: "#2563eb" };
  if (status === "COMPLETED")
    return { ...base, backgroundColor: "#dcfce7", color: "#15803d" };
  if (status === "REJECTED" || status === "CANCELLED")
    return { ...base, backgroundColor: "#fee2e2", color: "#b91c1c" };
  return { ...base, backgroundColor: "#fef3c7", color: "#b45309" };
};

const getPaymentBadgeStyle = (status) => {
  const base = {
    padding: "3px 8px",
    borderRadius: "8px",
    fontSize: "0.7rem",
    fontWeight: "700",
  };
  if (status === "PAID")
    return { ...base, backgroundColor: "#dcfce7", color: "#15803d" };
  if (status === "PENDING_VERIFICATION")
    return { ...base, backgroundColor: "#f3e8ff", color: "#9333ea" };
  return { ...base, backgroundColor: "#fee2e2", color: "#b91c1c" };
};

export default OwnerBookings;
