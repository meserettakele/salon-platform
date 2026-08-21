// src/pages/customer/PaymentSuccessPage.jsx
// This page is shown after Chapa redirects the customer back to the app.
// It reads ?status=success|failed&tx_ref=... from the URL.
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status"); // "success" or "failed"
  const txRef = searchParams.get("tx_ref") || "";

  const isSuccess = status === "success";

  // Auto-redirect after 6 seconds
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(isSuccess ? "/customer/appointments" : "/customer/transactions");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSuccess, navigate]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "48px 32px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>
          {isSuccess ? "✅" : "❌"}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            color: isSuccess ? "#16a34a" : "#dc2626",
            margin: "0 0 12px 0",
          }}
        >
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: "0.95rem",
            color: "#6b7280",
            margin: "0 0 24px 0",
            lineHeight: "1.6",
          }}
        >
          {isSuccess
            ? "Your payment was confirmed by Chapa. Your appointment is booked and ready. You will receive a notification shortly."
            : "Something went wrong with your payment. Please try again from the Transactions page."}
        </p>

        {/* Transaction Reference */}
        {txRef && (
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px 16px",
              marginBottom: "24px",
              fontSize: "0.8rem",
              color: "#6b7280",
            }}
          >
            Transaction Ref:{" "}
            <strong style={{ color: "#111827", wordBreak: "break-all" }}>
              {txRef}
            </strong>
          </div>
        )}

        {/* Auto-redirect notice */}
        <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "20px" }}>
          Redirecting in {countdown}s...
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {isSuccess ? (
            <button
              onClick={() => navigate("/customer/appointments")}
              style={{
                padding: "10px 24px",
                backgroundColor: "#db2777",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              View My Appointments
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/customer/transactions")}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#db2777",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/customer/dashboard")}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Back to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
