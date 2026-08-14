// src/pages/public/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { validateRegisterForm } from "../../utils/validation";

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const formErrors = validateRegisterForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        role: "CUSTOMER",
      };

      const response = await authService.register(payload);

      if (response.success) {
        setSuccessMessage(
          "Account created successfully! Redirecting to security login...",
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setServerError(
        err.message ||
          "Registration request processing exception. Please try again.",
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
            Create Account
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "0.95rem" }}>
            Join our luxury beauty platform ecosystem
          </p>
        </div>

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

        {successMessage && (
          <div
            style={{
              backgroundColor: "rgba(56, 142, 60, 0.06)",
              borderLeft: "4px solid var(--color-success)",
              padding: "12px 16px",
              borderRadius: "8px",
              color: "var(--color-success)",
              fontSize: "0.9rem",
              marginBottom: "24px",
            }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--color-dark)",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., Almaz Kebede"
              style={{
                borderColor: errors.fullName
                  ? "var(--color-error)"
                  : "var(--color-border)",
              }}
              disabled={isSubmitting || !!successMessage}
            />
            {errors.fullName && (
              <span
                style={{
                  color: "var(--color-error)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.fullName}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--color-dark)",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., almaz@example.com"
              style={{
                borderColor: errors.email
                  ? "var(--color-error)"
                  : "var(--color-border)",
              }}
              disabled={isSubmitting || !!successMessage}
            />
            {errors.email && (
              <span
                style={{
                  color: "var(--color-error)",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.email}
              </span>
            )}
          </div>

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
              disabled={isSubmitting || !!successMessage}
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
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--color-dark)",
              }}
            >
              Password
            </label>
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
              disabled={isSubmitting || !!successMessage}
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
            disabled={isSubmitting || !!successMessage}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              borderRadius: "var(--radius-ui)",
              fontSize: "1rem",
              letterSpacing: "0.02em",
              opacity: isSubmitting || !!successMessage ? 0.7 : 1,
              boxShadow: "0 8px 20px -6px rgba(233, 30, 99, 0.3)",
            }}
          >
            {isSubmitting ? "Processing..." : "Register Account"}
          </button>
        </form>

        <div
          style={{ marginTop: "28px", textAlign: "center", fontSize: "0.9rem" }}
        >
          <span style={{ color: "var(--color-muted)" }}>
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            style={{
              color: "var(--color-primary)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
