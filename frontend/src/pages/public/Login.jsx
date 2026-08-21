import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validatePhone, validatePassword } from "../../utils/validation";

export const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const from = location.state?.from?.pathname;
  const redirectMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    if (phoneError || passwordError) {
      setErrors({ phone: phoneError, password: passwordError });
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const response = await login(formData.phone, formData.password);

      if (response.success) {
        const userRole = response.data.user?.role;

        const pendingBookingRaw = localStorage.getItem("pendingBooking");

        if (pendingBookingRaw) {
          try {
            const pendingBooking = JSON.parse(pendingBookingRaw);
            localStorage.removeItem("pendingBooking");

            if (pendingBooking.salonId && pendingBooking.serviceId) {
              navigate(
                `/booking/${pendingBooking.salonId}?serviceId=${pendingBooking.serviceId}`,
                { replace: true },
              );
              return;
            }
          } catch (pErr) {
            console.error("Error parsing pending booking data:", pErr);
          }
        }

        if (from) {
          navigate(from, { replace: true });
        } else {
          const destinations = {
            CUSTOMER: "/customer/dashboard",
            OWNER: "/owner/dashboard",
            ADMIN: "/admin/dashboard",
          };
          navigate(destinations[userRole] || "/", { replace: true });
        }
      }
    } catch (err) {
      setServerError(
        err.message ||
          "Invalid telephone credentials or security key matching error.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGoogleError("");
    try {
      const response = await loginWithGoogle();

      if (response && response.success) {
        const userRole = response.data.user?.role;

        const pendingBookingRaw = localStorage.getItem("pendingBooking");
        if (pendingBookingRaw) {
          try {
            const pendingBooking = JSON.parse(pendingBookingRaw);
            localStorage.removeItem("pendingBooking");
            if (pendingBooking.salonId && pendingBooking.serviceId) {
              navigate(
                `/booking/${pendingBooking.salonId}?serviceId=${pendingBooking.serviceId}`,
                { replace: true }
              );
              return;
            }
          } catch (pErr) {
            console.error("Error parsing pending booking data:", pErr);
          }
        }

        if (from) {
          navigate(from, { replace: true });
        } else {
          const destinations = {
            CUSTOMER: "/customer/dashboard",
            OWNER: "/owner/dashboard",
            ADMIN: "/admin/dashboard",
            EMPLOYEE: "/employee/dashboard",
          };
          navigate(destinations[userRole] || "/", { replace: true });
        }
      }
    } catch (err) {
      // User cancelled the popup — no error shown
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        return;
      }
      setGoogleError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "var(--color-bg-warm)",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "var(--radius-ios)",
          padding: "40px",
          backgroundColor: "var(--color-card)",
        }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.85rem",
              color: "var(--color-dark)",
              marginBottom: "8px",
            }}
          >
            Welcome Back
          </h2>

          <p style={{ color: "var(--color-muted)", fontSize: "0.95rem" }}>
            Access your personalized salon dashboard
          </p>
        </div>

        {redirectMessage && (
          <div
            style={{
              backgroundColor: "rgba(233, 30, 99, 0.08)",
              borderLeft: "4px solid var(--color-primary, #e91e63)",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "var(--color-dark)",
              fontSize: "0.9rem",
              marginBottom: "24px",
              lineHeight: "1.4",
            }}
          >
            {redirectMessage}
          </div>
        )}

        {serverError && (
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
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--color-dark)",
              }}
            >
              Phone Number
            </label>

            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 0912345678"
              style={{
                borderColor: errors.phone
                  ? "var(--color-error)"
                  : "var(--color-border)",
              }}
              disabled={isSubmitting}
            />

            {errors.phone && (
              <span
                style={{
                  color: "var(--color-error)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.phone}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--color-dark)",
                }}
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                style={{
                  color: "var(--color-primary)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                borderColor: errors.password
                  ? "var(--color-error)"
                  : "var(--color-border)",
              }}
              disabled={isSubmitting}
            />

            {errors.password && (
              <span
                style={{
                  color: "var(--color-error)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.password}
              </span>
            )}
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
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* ── OR divider ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
          <span style={{ color: "var(--color-muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            or
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
        </div>

        {/* ── Google error message ── */}
        {googleError && (
          <div
            style={{
              backgroundColor: "rgba(211, 47, 47, 0.06)",
              borderLeft: "4px solid var(--color-error)",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "var(--color-error)",
              fontSize: "0.9rem",
              marginBottom: "16px",
            }}
          >
            {googleError}
          </div>
        )}

        {/* ── Continue with Google button ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isSubmitting}
          style={{
            width: "100%",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            backgroundColor: "#ffffff",
            color: "#3c4043",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-ui)",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: isGoogleLoading || isSubmitting ? "not-allowed" : "pointer",
            opacity: isGoogleLoading || isSubmitting ? 0.7 : 1,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            transition: "box-shadow 0.2s",
          }}
        >
          {/* Google "G" SVG logo */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {isGoogleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div
          style={{ marginTop: "28px", textAlign: "center", fontSize: "0.9rem" }}
        >
          <span style={{ color: "var(--color-muted)" }}>
            Don't have an account?{" "}
          </span>
          <Link
            to="/register"
            style={{
              color: "var(--color-primary)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
