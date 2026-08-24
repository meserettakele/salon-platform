import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!identifier.trim()) {
      setError("Please enter your registered phone number or email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/forgot-password", {
        identifier: identifier.trim(),
      });

      if (response.success) {
        setSuccess(
          `Reset code generated successfully. Your reset code is: ${response.data.resetCode}`,
        );
        setStep(2);
      } else {
        setError(response.message || "Unable to generate reset code.");
      }
    } catch (err) {
      setError(err.message || "Unable to generate reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!resetCode.trim()) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (!/^\d{6}$/.test(resetCode.trim())) {
      setError("Reset code must be exactly 6 digits.");
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/reset-password", {
        identifier: identifier.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      });

      if (response.success) {
        setSuccess("Password reset successfully. Redirecting to login...");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        setError(response.message || "Unable to reset password.");
      }
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Blurred Luxury Background Image ─── */}
      <div
        style={{
          position: "fixed",
          inset: "-20px",
          backgroundImage:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.75) 100%), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(12px)",
          transform: "scale(1.05)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "460px",
          borderRadius: "24px",
          padding: "38px 34px",
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Top Brand Logo */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <img
              src="/veloura-logo.png"
              alt="Veloura"
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                boxShadow: "0 8px 18px rgba(216, 69, 112, 0.3)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: "800",
                  fontFamily: "var(--font-display)",
                  color: "var(--color-dark)",
                  lineHeight: 1.1,
                }}
              >
                Veloura
              </div>
              <div
                style={{
                  fontSize: "0.66rem",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  marginTop: "2px",
                }}
              >
                Beauty Salon Network
              </div>
            </div>
          </Link>
        </div>

        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.55rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              margin: "0 0 6px",
            }}
          >
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </h2>

          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "0.95rem",
              lineHeight: "1.5",
            }}
          >
            {step === 1
              ? "Enter your registered phone number or email to receive a reset code."
              : "Enter the 6-digit code and choose a new password."}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(211, 47, 47, 0.06)",
              borderLeft: "4px solid var(--color-error)",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "var(--color-error)",
              fontSize: "0.9rem",
              marginBottom: "24px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "rgba(76, 175, 80, 0.08)",
              borderLeft: "4px solid #4caf50",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "#2e7d32",
              fontSize: "0.9rem",
              marginBottom: "24px",
              lineHeight: "1.5",
            }}
          >
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="identifier"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--color-dark)",
                }}
              >
                Phone Number or Email
              </label>

              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError("");
                }}
                placeholder="Enter phone number or email"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-ui)",
                fontSize: "1rem",
                letterSpacing: "0.02em",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 8px 20px -6px rgba(233, 30, 99, 0.3)",
              }}
            >
              {isSubmitting ? "Generating Code..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="resetCode"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--color-dark)",
                }}
              >
                6-Digit Reset Code
              </label>

              <input
                type="text"
                id="resetCode"
                value={resetCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setResetCode(value);
                  setError("");
                }}
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                maxLength={6}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="newPassword"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--color-dark)",
                }}
              >
                New Password
              </label>

              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                disabled={isSubmitting}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--color-dark)",
                }}
              >
                Confirm New Password
              </label>

              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                placeholder="Confirm new password"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-ui)",
                fontSize: "1rem",
                letterSpacing: "0.02em",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 8px 20px -6px rgba(233, 30, 99, 0.3)",
              }}
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: "28px",
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          <Link
            to="/login"
            style={{
              color: "var(--color-primary)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
