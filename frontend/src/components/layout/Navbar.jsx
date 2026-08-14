// src/components/layout/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

export const Navbar = ({ onToggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user?.role) return "/";
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="glass-panel"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderRadius: "0 0 var(--radius-ui) var(--radius-ui)",
        borderTop: "none",
        padding: "16px 4%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Hamburger Toggle Button (Shows when logged in to bring up sidebar) */}
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar Navigation"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justify: "center",
                padding: "4px 8px",
                color: "var(--color-dark)",
                borderRadius: "var(--radius-ui)",
              }}
            >
              ☰
            </button>
          )}

          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: "800",
                fontFamily: "Manrope",
                color: "var(--color-primary)",
              }}
            >
              Beauty
              <span style={{ color: "var(--color-secondary)" }}> span </span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div
            style={{
              display: "flex",
              gap: "24px",
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          >
            <Link to="/" style={{ textDecoration: "none" }}>
              Home
            </Link>
            <Link to="/salons" style={{ textDecoration: "none" }}>
              Salons
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                  }}
                >
                  Dashboard
                </Link>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  style={{ padding: "10px 20px" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/login")}
                  style={{ padding: "10px 20px" }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate("/register")}
                  style={{ padding: "10px 20px" }}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
