// src/pages/customer/PaymentPage.jsx
import React, { useEffect, useState } from "react";
import { Card } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import api from "../../services/api";

export const PaymentPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingBookings, setPendingBookings] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment Modal States
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CHAPA");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch bookings matching your API endpoint
      const res = await api.get("/customer/bookings?type=current");
      let bookingsList = [];
      if (Array.isArray(res.data)) {
        bookingsList = res.data;
      } else if (Array.isArray(res.data?.data)) {
        bookingsList = res.data.data;
      } else if (Array.isArray(res.data?.bookings)) {
        bookingsList = res.data.bookings;
      }

      // Filter for accepted bookings that aren't paid
      const pending = bookingsList.filter((b) => {
        const st = (b.bookingStatus || b.status || "").toUpperCase();
        const paySt = (b.paymentStatus || "").toUpperCase();
        return (st === "ACCEPTED" || st === "CONFIRMED") && paySt !== "PAID";
      });
      setPendingBookings(pending);

      // Attempt to fetch payment history if endpoint exists
      try {
        const payRes = await api.get("/customer/bookings?type=history");
        let payList = [];
        if (Array.isArray(payRes.data)) payList = payRes.data;
        else if (Array.isArray(payRes.data?.data)) payList = payRes.data.data;

        const completed = payList.filter(
          (p) => (p.paymentStatus || p.status || "").toUpperCase() === "PAID",
        );
        setCompletedPayments(completed);
      } catch (payErr) {
        console.warn("History fetch warning:", payErr.message);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load transaction details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (booking) => {
    setSelectedBookingForPay(booking);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!selectedBookingForPay) return;

    const currentBookingId =
      selectedBookingForPay.id || selectedBookingForPay._id;
    const rawAmount =
      selectedBookingForPay.bookedPrice ||
      selectedBookingForPay.totalAmount ||
      selectedBookingForPay.service?.price ||
      selectedBookingForPay.price ||
      0;

    try {
      setProcessingPayment(true);
      setError("");

      // Payload aligned directly with your MyAppointments component
      const payload = {
        bookingId: currentBookingId,
        appointmentId: currentBookingId,
        amount: Number(rawAmount),
        paymentMethod: paymentMethod,
      };

      console.log("Sending payment payload:", payload);

      const res = await api.post("/payment", payload);

      const checkoutUrl =
        res.data?.data?.checkout_url ||
        res.data?.checkout_url ||
        res.data?.paymentUrl ||
        res.data?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      alert(`Payment via ${paymentMethod} initiated successfully!`);
      setSelectedBookingForPay(null);
      fetchData();
    } catch (err) {
      console.error("Payment Error Response:", err.response?.data);
      const serverErrorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Payment processing failed.";
      setError(serverErrorMsg);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: "20px 0", position: "relative" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>Transactions</h2>

      {error && <ErrorMessage message={error} />}

      {/* Tab Controls */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          padding: "6px",
          borderRadius: "24px",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "20px",
            border: "none",
            backgroundColor:
              activeTab === "pending" ? "#db2777" : "transparent",
            color: activeTab === "pending" ? "#ffffff" : "#6b7280",
            fontWeight: "600",
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Pending {pendingBookings.length > 0 && `(${pendingBookings.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "20px",
            border: "none",
            backgroundColor:
              activeTab === "history" ? "#db2777" : "transparent",
            color: activeTab === "history" ? "#ffffff" : "#6b7280",
            fontWeight: "600",
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          History ({completedPayments.length})
        </button>
      </div>

      <h3
        style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          textTransform: "uppercase",
          marginBottom: "16px",
          letterSpacing: "0.5px",
        }}
      >
        {activeTab === "pending" ? "Pending Payments" : "Transaction History"}
      </h3>

      {/* PENDING TAB */}
      {activeTab === "pending" && (
        <>
          {pendingBookings.length === 0 ? (
            <Card>
              <p style={{ color: "#6b7280", margin: 0 }}>
                No pending payments found.
              </p>
            </Card>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {pendingBookings.map((b, idx) => {
                const amount =
                  b.bookedPrice ||
                  b.totalAmount ||
                  b.service?.price ||
                  b.price ||
                  0;
                return (
                  <Card key={b.id || b._id || idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "rgba(212, 175, 55, 0.15)",
                          color: "#b8860b",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        PENDING
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        #{String(b.id || idx + 1).padStart(4, "0")}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>
                          {b.salon?.name || b.salonName || "Salon Name"}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: "#6b7280",
                            fontSize: "0.85rem",
                          }}
                        >
                          Specialist:{" "}
                          {b.employee?.name ||
                            b.employeeName ||
                            "Any Specialist"}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderTop: "1px solid rgba(0,0,0,0.05)",
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                        margin: "12px 0",
                      }}
                    >
                      <span>
                        • {b.service?.name || b.serviceName || "Service"}
                      </span>
                      <strong>{Number(amount).toLocaleString()} ETB</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "12px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          TOTAL:{" "}
                        </span>
                        <strong
                          style={{ fontSize: "1.2rem", color: "#db2777" }}
                        >
                          {Number(amount).toLocaleString()} ETB
                        </strong>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleOpenPaymentModal(b)}
                        style={{ backgroundColor: "#db2777" }}
                      >
                        Pay Now
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <>
          {completedPayments.length === 0 ? (
            <Card>
              <p style={{ color: "#6b7280", margin: 0 }}>
                No completed transactions found.
              </p>
            </Card>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {completedPayments.map((tx, idx) => {
                const amount =
                  tx.bookedPrice || tx.totalAmount || tx.amount || 0;
                return (
                  <Card key={tx.id || tx._id || idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        PAID
                      </span>
                    </div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>
                      {tx.salon?.name || tx.salonName || "Salon"}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "8px",
                        marginTop: "8px",
                        borderTop: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        Method: {tx.paymentMethod || "ONLINE"}
                      </span>
                      <strong style={{ fontSize: "1.1rem", color: "#10b981" }}>
                        {Number(amount).toLocaleString()} ETB
                      </strong>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PAYMENT MODAL */}
      {selectedBookingForPay && (
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
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem" }}>
              Select Payment Method
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.85rem",
                marginBottom: "16px",
              }}
            >
              Paying for:{" "}
              <strong>
                {selectedBookingForPay.service?.name ||
                  selectedBookingForPay.serviceName ||
                  "Service"}
              </strong>
            </p>

            <form onSubmit={handleConfirmPayment}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="CHAPA">Chapa (Card / Telebirr Online)</option>
                  <option value="TELEBIRR">Telebirr Direct</option>
                  <option value="CBE_BIRR">CBE Birr</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Pay Cash at Salon</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  padding: "12px",
                  backgroundColor: "rgba(0,0,0,0.03)",
                  borderRadius: "8px",
                }}
              >
                <span>Total Amount:</span>
                <strong style={{ fontSize: "1.2rem", color: "#db2777" }}>
                  {Number(
                    selectedBookingForPay.bookedPrice ||
                      selectedBookingForPay.totalAmount ||
                      selectedBookingForPay.service?.price ||
                      selectedBookingForPay.price ||
                      0,
                  ).toLocaleString()}{" "}
                  ETB
                </strong>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  type="button"
                  onClick={() => setSelectedBookingForPay(null)}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "1px solid #ccc",
                    color: "#666",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processingPayment}
                  style={{ flex: 1, backgroundColor: "#db2777" }}
                >
                  {processingPayment ? "Processing..." : "Confirm & Pay"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
