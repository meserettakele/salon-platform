import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validatePhone, validatePassword } from "../../utils/validation";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
