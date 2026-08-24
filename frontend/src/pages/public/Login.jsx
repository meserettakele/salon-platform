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

      {/* ─── Centered Glass/Card Form ─── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--color-card)",
          borderRadius: "24px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          padding: "40px 36px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Top Brand Logo */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
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
                width: "48px",
                height: "48px",
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
          <h1
            style={{
              fontSize: "1.55rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.88rem", margin: 0 }}>
            Sign in to access your bookings and dashboard
          </p>
        </div>

        {redirectMessage && (
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              borderLeft: "4px solid var(--color-primary)",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "var(--color-dark)",
              fontSize: "0.85rem",
              marginBottom: "18px",
            }}
          >
            {redirectMessage}
          </div>
        )}

        {serverError && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderLeft: "4px solid #EF4444",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "#EF4444",
              fontSize: "0.85rem",
              marginBottom: "18px",
            }}
          >
            {serverError}
          </div>
        )}

        {/* ── Continue with Google button ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isSubmitting}
          style={{
            width: "100%",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            backgroundColor: "var(--color-card-subtle)",
            color: "var(--color-dark)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "0.92rem",
            fontWeight: "600",
            cursor: isGoogleLoading || isSubmitting ? "not-allowed" : "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Google "G" SVG logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {isGoogleLoading ? "Signing in with Google..." : "Continue with Google"}
        </button>

        {/* Google error message */}
        {googleError && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderLeft: "4px solid #EF4444",
              padding: "10px 14px",
              borderRadius: "8px",
              color: "#EF4444",
              fontSize: "0.82rem",
              marginTop: "12px",
            }}
          >
            {googleError}
          </div>
        )}

        {/* ── Divider ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "22px 0",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
          <span style={{ color: "var(--color-muted)", fontSize: "0.76rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            or with phone number
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
        </div>

        {/* ── Phone & Password Form ── */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: "600",
                marginBottom: "6px",
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
              placeholder="0912345678"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1.5px solid",
                borderColor: errors.phone ? "#EF4444" : "var(--color-border)",
                backgroundColor: "var(--color-card-subtle)",
                color: "var(--color-dark)",
                fontSize: "0.92rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <span style={{ color: "#EF4444", fontSize: "0.78rem", marginTop: "4px", display: "block" }}>
                {errors.phone}
              </span>
            )}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: "0.84rem",
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
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Forgot password?
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
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1.5px solid",
                borderColor: errors.password ? "#EF4444" : "var(--color-border)",
                backgroundColor: "var(--color-card-subtle)",
                color: "var(--color-dark)",
                fontSize: "0.92rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              disabled={isSubmitting}
            />
            {errors.password && (
              <span style={{ color: "#EF4444", fontSize: "0.78rem", marginTop: "4px", display: "block" }}>
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "13px",
              marginTop: "4px",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: "700",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(216, 69, 112, 0.35)",
              transition: "opacity 0.2s, transform 0.15s ease",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer switch */}
        <div style={{ marginTop: "22px", textAlign: "center", fontSize: "0.88rem" }}>
          <span style={{ color: "var(--color-muted)" }}>Don't have an account? </span>
          <Link
            to="/register"
            style={{
              color: "var(--color-primary)",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


