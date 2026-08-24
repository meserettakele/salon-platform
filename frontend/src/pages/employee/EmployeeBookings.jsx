import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiUser,
  FiX,
} from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useDateTime } from "../../context/DateTimeContext";
import api from "../../services/api";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const EmployeeBookings = () => {
  const { formatDate, formatTime } = useDateTime();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchBookings = async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = statusFilter ? { status: statusFilter } : {};

      const response = await api.get("/employee/bookings", { params });

      const data = response?.data?.data || response?.data || [];

      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch employee bookings:", error);

      alert(error?.response?.data?.message || "Failed to load your bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  // =====================================================
  // ACCEPT
  // =====================================================

  const handleAccept = async (bookingId) => {
    try {
      setActionLoading(`accept-${bookingId}`);

      await api.patch(`/employee/bookings/${bookingId}/accept`);

      await fetchBookings(true);
    } catch (error) {
      console.error("Accept booking error:", error);

      alert(error?.response?.data?.message || "Failed to accept the booking.");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // OPEN REJECT MODAL
  // =====================================================

  const openRejectModal = (booking) => {
    setSelectedBooking(booking);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(`reject-${selectedBooking.id}`);

      await api.patch(`/employee/bookings/${selectedBooking.id}/reject`, {
        reason: rejectionReason.trim() || "Staff unavailable",
      });

      setShowRejectModal(false);
      setSelectedBooking(null);
      setRejectionReason("");

      await fetchBookings(true);
    } catch (error) {
      console.error("Reject booking error:", error);

      alert(error?.response?.data?.message || "Failed to reject the booking.");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // COMPLETE
  // =====================================================

  const handleComplete = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this appointment as completed?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(`complete-${bookingId}`);

      await api.patch(`/employee/bookings/${bookingId}/complete`);

      await fetchBookings(true);
    } catch (error) {
      console.error("Complete booking error:", error);

      alert(
        error?.response?.data?.message || "Failed to complete the appointment.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatus = (booking) =>
    String(booking?.bookingStatus || booking?.status || "").toUpperCase();

  const getPaymentStatus = (booking) =>
    String(
      booking?.paymentStatus || booking?.payment?.paymentStatus || "",
    ).toUpperCase();

  const canComplete = (booking) => {
    const bookingStatus = getStatus(booking);
    const paymentStatus = getPaymentStatus(booking);

    return bookingStatus === "ACCEPTED" && paymentStatus === "PAID";
  };

  const getStatusStyle = (status) => {
    switch (status) {
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

  const getPaymentStyle = (status) => {
    switch (status) {
      case "PAID":
        return {
          backgroundColor: "#dcfce7",
          color: "#15803d",
        };

      case "PENDING":
      case "PENDING_VERIFICATION":
        return {
          backgroundColor: "#fef3c7",
          color: "#b45309",
        };

      case "FAILED":
        return {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
        };

      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
        };
    }
  };

  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            My Bookings
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "var(--color-muted)",
              fontSize: "0.9rem",
            }}
          >
            Manage appointments assigned to you.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiRefreshCw
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* =====================================================
          STATUS FILTERS
      ===================================================== */}

      <Card
        style={{
          padding: "14px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value;

            return (
              <button
                key={filter.value || "ALL"}
                onClick={() => setStatusFilter(filter.value)}
                style={{
                  border: active
                    ? "1px solid var(--color-primary)"
                    : "1px solid #e5e7eb",
                  backgroundColor: active
                    ? "rgba(233, 30, 99, 0.08)"
                    : "#ffffff",
                  color: active ? "var(--color-primary)" : "#4b5563",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  fontSize: "0.82rem",
                  fontWeight: active ? "700" : "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* =====================================================
          BOOKINGS
      ===================================================== */}

      {bookings.length === 0 ? (
        <Card
          style={{
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <FiCalendar
            style={{
              fontSize: "3rem",
              color: "#d1d5db",
              marginBottom: "12px",
            }}
          />

          <h3
            style={{
              margin: "0 0 6px",
              color: "#374151",
            }}
          >
            No bookings found
          </h3>

          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
            }}
          >
            There are no appointments matching this filter.
          </p>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "18px",
          }}
        >
          {bookings.map((booking) => {
            const status = getStatus(booking);
            const paymentStatus = getPaymentStatus(booking);

            const customer = booking.customer || {};

            const service = booking.service || {};

            const customerName =
              customer.fullName || booking.customerName || "Customer";

            const customerPhone =
              customer.phone || booking.customerPhone || "Not provided";

            const customerEmail =
              customer.email || booking.customerEmail || "Not provided";

            const serviceName =
              service.name || booking.serviceName || "Service";

            const duration = booking.duration || service.duration;

            const price = booking.bookedPrice ?? service.price ?? booking.price;

            return (
              <Card
                key={booking.id}
                style={{
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                {/* Booking top bar */}

                <div
                  style={{
                    padding: "16px 18px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "#9ca3af",
                      fontWeight: "600",
                    }}
                  >
                    Booking #{booking.id}
                  </span>

                  <span
                    style={{
                      ...getStatusStyle(status),
                      padding: "5px 10px",
                      borderRadius: "20px",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                    }}
                  >
                    {formatStatus(status)}
                  </span>
                </div>

                {/* Customer */}

                <div style={{ padding: "18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(233, 30, 99, 0.1)",
                        color: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        fontWeight: "800",
                        flexShrink: 0,
                      }}
                    >
                      {customerName.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: "750",
                          color: "var(--color-dark)",
                        }}
                      >
                        {customerName}
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginTop: "5px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "var(--color-muted)",
                            fontSize: "0.72rem",
                          }}
                        >
                          <FiPhone />
                          {customerPhone}
                        </span>

                        {customerEmail !== "Not provided" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "var(--color-muted)",
                              fontSize: "0.72rem",
                            }}
                          >
                            <FiMail />
                            {customerEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Appointment details */}

                  <div
                    style={{
                      backgroundColor: "var(--color-card-subtle)",
                      borderRadius: "12px",
                      padding: "14px",
                      marginBottom: "14px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                      }}
                    >
                      <FiUser
                        style={{
                          color: "var(--color-primary)",
                        }}
                      />

                      <strong
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--color-dark)",
                        }}
                      >
                        {serviceName}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <span style={detailLabelStyle}>
                          <FiCalendar /> Date
                        </span>

                        <strong style={detailValueStyle}>
                          {formatDate(booking.appointmentDate)}
                        </strong>
                      </div>

                      <div>
                        <span style={detailLabelStyle}>
                          <FiClock /> Time
                        </span>

                        <strong style={detailValueStyle}>
                          {formatTime(booking.appointmentTime)}
                        </strong>
                      </div>

                      {duration && (
                        <div>
                          <span style={detailLabelStyle}>Duration</span>

                          <strong style={detailValueStyle}>
                            {duration} min
                          </strong>
                        </div>
                      )}

                      {price !== undefined && (
                        <div>
                          <span style={detailLabelStyle}>
                            <FiDollarSign /> Price
                          </span>

                          <strong style={detailValueStyle}>
                            {Number(price).toFixed(2)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment */}

                  {/* Payment Details */}
                  {(() => {
                    const isPaid = paymentStatus === "PAID";
                    return (
                      <div
                        style={{
                          borderRadius: "12px",
                          backgroundColor: isPaid ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
                          border: isPaid ? "1.5px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.25)",
                          padding: "12px 14px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: isPaid ? "#10B981" : "#D97706", display: "flex", alignItems: "center", gap: "6px" }}>
                            {isPaid ? "✅ Payment Confirmed" : "⏳ Payment Pending"}
                          </span>
                          <span
                            style={{
                              ...getPaymentStyle(paymentStatus),
                              padding: "4px 9px",
                              borderRadius: "12px",
                              fontSize: "0.7rem",
                              fontWeight: "800",
                            }}
                          >
                            {formatStatus(paymentStatus || "UNPAID")}
                          </span>
                        </div>

                        {isPaid ? (
                          <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(16, 185, 129, 0.2)", fontSize: "0.78rem", color: "var(--color-dark)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                              <span style={{ color: "#6b7280" }}>Amount Paid:</span>
                              <strong style={{ color: "#10B981" }}>ETB {booking.payment?.amount || price}</strong>
                            </div>
                            {booking.payment?.paymentMethod && (
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                <span style={{ color: "#6b7280" }}>Method:</span>
                                <span>{booking.payment.paymentMethod}</span>
                              </div>
                            )}
                            {booking.payment?.transactionId && (
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Transaction Ref:</span>
                                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#374151" }}>{booking.payment.transactionId}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ marginTop: "6px", fontSize: "0.74rem", color: "#92400e" }}>
                            Customer has not completed payment yet. Once paid, you can complete this booking.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Actions */}

                  {status === "PENDING" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={actionLoading === `accept-${booking.id}`}
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: "#10b981",
                        }}
                      >
                        <FiCheck />
                        {actionLoading === `accept-${booking.id}`
                          ? "Accepting..."
                          : "Accept"}
                      </button>

                      <button
                        onClick={() => openRejectModal(booking)}
                        disabled={actionLoading === `reject-${booking.id}`}
                        style={{
                          ...actionButtonStyle,
                          backgroundColor: "#ef4444",
                        }}
                      >
                        <FiX />
                        Reject
                      </button>
                    </div>
                  )}

                  {status === "ACCEPTED" && (
                    <div>
                      {canComplete(booking) ? (
                        <button
                          onClick={() => handleComplete(booking.id)}
                          disabled={actionLoading === `complete-${booking.id}`}
                          style={{
                            ...actionButtonStyle,
                            width: "100%",
                            backgroundColor: "#2563eb",
                          }}
                        >
                          <FiCheck />
                          {actionLoading === `complete-${booking.id}`
                            ? "Completing..."
                            : "Complete Appointment"}
                        </button>
                      ) : (
                        <div
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            borderRadius: "10px",
                            backgroundColor: "#fffbeb",
                            color: "#b45309",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          Payment must be completed before the appointment can
                          be marked as completed.
                        </div>
                      )}
                    </div>
                  )}

                  {status === "COMPLETED" && (
                    <div
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderRadius: "10px",
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                      }}
                    >
                      ✓ Appointment completed
                    </div>
                  )}

                  {status === "REJECTED" && (
                    <div
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderRadius: "10px",
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                      }}
                    >
                      Booking rejected
                    </div>
                  )}

                  {status === "CANCELLED" && (
                    <div
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderRadius: "10px",
                        backgroundColor: "#f9fafb",
                        color: "#6b7280",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                      }}
                    >
                      Booking cancelled
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 2000,
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowRejectModal(false);
              setSelectedBooking(null);
            }
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.15rem",
                    fontWeight: "800",
                    color: "var(--color-dark)",
                  }}
                >
                  Reject Booking
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "0.8rem",
                    color: "var(--color-muted)",
                  }}
                >
                  Provide a reason for rejecting this appointment.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedBooking(null);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--color-muted)",
                }}
              >
                <FiX />
              </button>
            </div>

            <textarea
              rows="3"
              placeholder="e.g., Staff unavailable at requested time..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                fontSize: "0.85rem",
                outline: "none",
                marginBottom: "16px",
                boxSizing: "border-box",
                backgroundColor: "var(--color-card)",
                color: "var(--color-dark)",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedBooking(null);
                }}
                style={{
                  ...actionButtonStyle,
                  backgroundColor: "var(--color-card-subtle)",
                  color: "var(--color-dark)",
                  border: "1px solid var(--color-border)",
                  padding: "10px 16px",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading === `reject-${selectedBooking?.id}`}
                style={{
                  ...actionButtonStyle,
                  backgroundColor: "#ef4444",
                  padding: "10px 18px",
                }}
              >
                <FiX />
                {actionLoading === `reject-${selectedBooking?.id}`
                  ? "Rejecting..."
                  : "Reject Booking"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const detailLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "0.68rem",
  color: "var(--color-muted-light)",
  marginBottom: "3px",
};

const detailValueStyle = {
  display: "block",
  fontSize: "0.76rem",
  color: "var(--color-dark)",
};

const actionButtonStyle = {
  border: "none",
  color: "#ffffff",
  borderRadius: "9px",
  padding: "9px 12px",
  fontSize: "0.78rem",
  fontWeight: "700",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
};

export default EmployeeBookings;
