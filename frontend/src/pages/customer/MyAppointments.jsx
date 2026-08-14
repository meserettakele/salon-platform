import React, { useState, useEffect } from "react";
import api from "../../services/api";

const MyAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [payingId, setPayingId] = useState(null);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CHAPA");

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/customer/bookings?type=${activeTab}`);

        if (isMounted) {
          let dataList = [];
          if (Array.isArray(res.data)) {
            dataList = res.data;
          } else if (Array.isArray(res.data?.data)) {
            dataList = res.data.data;
          } else if (Array.isArray(res.data?.bookings)) {
            dataList = res.data.bookings;
          } else if (Array.isArray(res.data?.result)) {
            dataList = res.data.result;
          }

          setBookings(dataList);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Failed to load booking history.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Action: Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelingId(bookingId);
      await api.patch(`/customer/bookings/${bookingId}/cancel`);

      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === bookingId
            ? { ...b, bookingStatus: "CANCELLED", status: "CANCELLED" }
            : b,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelingId(null);
    }
  };

  // Submit Payment Request
  const handleProcessPayment = async () => {
    if (!selectedBooking) return;

    const currentBookingId = selectedBooking.id || selectedBooking._id;
    const rawAmount =
      selectedBooking.bookedPrice ||
      selectedBooking.totalAmount ||
      selectedBooking.price ||
      0;

    try {
      setPayingId(currentBookingId);

      // Sending both keys so it works regardless of what your backend destructures
      const payload = {
        bookingId: currentBookingId,
        appointmentId: currentBookingId,
        amount: Number(rawAmount),
        paymentMethod: paymentMethod, // Matches Sequelize ENUM ("CHAPA", "CBE_BIRR", etc.)
      };

      console.log("Sending payment payload:", payload);

      const res = await api.post("/payment", payload);

      // Check if backend returned a Gateway URL (e.g. Chapa checkout link)
      const checkoutUrl =
        res.data?.data?.checkout_url ||
        res.data?.checkout_url ||
        res.data?.paymentUrl ||
        res.data?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl; // Redirects user to payment gateway
      } else {
        alert(`Payment via ${paymentMethod} initiated successfully!`);
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === currentBookingId
              ? { ...b, paymentStatus: "PAID" }
              : b,
          ),
        );
        setSelectedBooking(null);
      }
    } catch (err) {
      console.error("Payment Error Response:", err.response?.data);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to process payment. Please try again.";

      alert(`Payment Error: ${errorMessage}`);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-4 md:p-6"
      style={{ maxWidth: "56rem", margin: "0 auto", padding: "1.5rem" }}
    >
      <div className="mb-6" style={{ marginBottom: "1.5rem" }}>
        <h1
          className="text-2xl font-bold text-gray-800"
          style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1f2937" }}
        >
          My Appointments
        </h1>
        <p
          className="text-sm text-gray-500"
          style={{ fontSize: "0.875rem", color: "#6b7280" }}
        >
          View and manage your upcoming and past bookings.
        </p>
      </div>

      {/* TABS */}
      <div
        className="flex border-b mb-6"
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("current")}
          style={{
            padding: "0.625rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "current"
                ? "2px solid #db2777"
                : "2px solid transparent",
            color: activeTab === "current" ? "#db2777" : "#6b7280",
          }}
        >
          Upcoming & Active
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "0.625rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "history"
                ? "2px solid #db2777"
                : "2px solid transparent",
            color: activeTab === "history" ? "#db2777" : "#6b7280",
          }}
        >
          Past History
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            borderLeft: "4px solid #ef4444",
            padding: "1rem",
            marginBottom: "1.5rem",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div
          style={{ padding: "4rem 0", textAlign: "center", color: "#6b7280" }}
        >
          Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "2.5rem 1.5rem",
            borderRadius: "0.75rem",
            textAlign: "center",
            border: "1px solid #e5e7eb",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: "1rem", fontWeight: "600", color: "#374151" }}>
            No appointments found
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {bookings.map((item) => (
            <BookingCard
              key={item.id || item._id}
              booking={item}
              isCanceling={cancelingId === (item.id || item._id)}
              isPaying={payingId === (item.id || item._id)}
              onCancel={() => handleCancelBooking(item.id || item._id)}
              onPay={() => setSelectedBooking(item)}
            />
          ))}
        </div>
      )}

      {/* PAYMENT MODAL */}
      {selectedBooking && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1rem",
                color: "#111827",
              }}
            >
              Select Payment Method
            </h2>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#4b5563",
                marginBottom: "1rem",
              }}
            >
              Amount to Pay:{" "}
              <strong>
                ETB{" "}
                {Number(
                  selectedBooking.bookedPrice ||
                    selectedBooking.totalAmount ||
                    selectedBooking.price ||
                    0,
                ).toLocaleString()}
              </strong>
            </p>

            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "0.5rem",
              }}
            >
              Payment Option
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%",
                padding: "0.625rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
              }}
            >
              <option value="CHAPA">Chapa (Card / Telebirr Online)</option>
              <option value="TELEBIRR">Telebirr Direct</option>
              <option value="CBE_BIRR">CBE Birr</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Pay Cash at Salon</option>
            </select>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={payingId !== null}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  backgroundColor: "#db2777",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {payingId ? "Processing..." : "Proceed to Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= SUB-COMPONENT: BOOKING CARD =================
const BookingCard = ({ booking, isCanceling, isPaying, onCancel, onPay }) => {
  const {
    salon,
    service,
    employee,
    bookedPrice,
    totalAmount,
    price: rawPrice,
    rejectionReason,
  } = booking;

  const appointmentDate =
    booking.appointmentDate || booking.date || booking.bookingDate || "N/A";
  const appointmentTime =
    booking.appointmentTime || booking.time || booking.bookingTime || "N/A";

  const bookingStatus = (
    booking.bookingStatus ||
    booking.status ||
    "PENDING"
  ).toUpperCase();

  const paymentStatus = (booking.paymentStatus || "UNPAID").toUpperCase();
  const price = bookedPrice || totalAmount || rawPrice || 0;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.75rem",
          borderBottom: "1px solid #f3f4f6",
          paddingBottom: "0.75rem",
        }}
      >
        <div>
          <h3
            style={{
              fontWeight: "700",
              fontSize: "1.125rem",
              color: "#111827",
              margin: 0,
            }}
          >
            {salon?.name || booking.salonName || "Salon Name"}
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#4b5563",
              margin: "0.25rem 0 0 0",
            }}
          >
            {service?.name || booking.serviceName || "Service Name"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: "1.125rem",
              fontWeight: "700",
              color: "#db2777",
              margin: 0,
            }}
          >
            ETB {Number(price).toLocaleString()}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
          fontSize: "0.875rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "#9ca3af",
              textTransform: "uppercase",
              fontWeight: "600",
              margin: 0,
            }}
          >
            Date
          </p>
          <p
            style={{
              fontWeight: "500",
              color: "#1f2937",
              margin: "0.25rem 0 0 0",
            }}
          >
            📅 {appointmentDate}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "#9ca3af",
              textTransform: "uppercase",
              fontWeight: "600",
              margin: 0,
            }}
          >
            Time
          </p>
          <p
            style={{
              fontWeight: "500",
              color: "#1f2937",
              margin: "0.25rem 0 0 0",
            }}
          >
            ⏰ {appointmentTime}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "#9ca3af",
              textTransform: "uppercase",
              fontWeight: "600",
              margin: 0,
            }}
          >
            Specialist
          </p>
          <p
            style={{
              fontWeight: "500",
              color: "#1f2937",
              margin: "0.25rem 0 0 0",
            }}
          >
            {employee?.name || booking.employeeName || "Any Specialist"}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "#9ca3af",
              textTransform: "uppercase",
              fontWeight: "600",
              margin: 0,
            }}
          >
            Statuses
          </p>
          <div
            style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}
          >
            <StatusBadge type="booking" status={bookingStatus} />
            <StatusBadge type="payment" status={paymentStatus} />
          </div>
        </div>
      </div>

      {bookingStatus === "REJECTED" && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            color: "#b91c1c",
            fontSize: "0.75rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #fee2e2",
          }}
        >
          <strong>Rejection Reason:</strong>{" "}
          {rejectionReason || "No reason provided by salon."}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        {bookingStatus === "PENDING" && (
          <button
            onClick={onCancel}
            disabled={isCanceling}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              borderRadius: "0.5rem",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            {isCanceling ? "Canceling..." : "Cancel Booking"}
          </button>
        )}

        {bookingStatus === "ACCEPTED" && (
          <>
            {paymentStatus !== "PAID" ? (
              <>
                <button
                  onClick={onCancel}
                  disabled={isCanceling || isPaying}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: "0.5rem",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {isCanceling ? "Canceling..." : "Cancel Booking"}
                </button>
                <button
                  onClick={onPay}
                  disabled={isPaying || isCanceling}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#ffffff",
                    backgroundColor: "#db2777",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Pay Now
                </button>
              </>
            ) : (
              <span
                style={{
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "#15803d",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "0.5rem",
                }}
              >
                ✓ Appointment Confirmed
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ type, status }) => {
  let style = { backgroundColor: "#f3f4f6", color: "#374151" };

  if (type === "booking") {
    switch (status) {
      case "PENDING":
        style = { backgroundColor: "#fef3c7", color: "#92400e" };
        break;
      case "ACCEPTED":
      case "COMPLETED":
        style = { backgroundColor: "#dcfce7", color: "#166534" };
        break;
      case "REJECTED":
      case "CANCELLED":
        style = { backgroundColor: "#fee2e2", color: "#991b1b" };
        break;
      default:
        break;
    }
  } else if (type === "payment") {
    switch (status) {
      case "PAID":
        style = { backgroundColor: "#d1fae5", color: "#065f46" };
        break;
      case "PENDING":
        style = { backgroundColor: "#fef3c7", color: "#92400e" };
        break;
      case "UNPAID":
        style = { backgroundColor: "#f3f4f6", color: "#4b5563" };
        break;
      case "FAILED":
      case "REFUNDED":
        style = { backgroundColor: "#fee2e2", color: "#991b1b" };
        break;
      default:
        break;
    }
  }

  return (
    <span
      style={{
        padding: "0.125rem 0.5rem",
        borderRadius: "0.25rem",
        fontSize: "0.625rem",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        ...style,
      }}
    >
      {status || (type === "booking" ? "PENDING" : "UNPAID")}
    </span>
  );
};

export default MyAppointments;
