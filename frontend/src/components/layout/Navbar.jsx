// src/components/layout/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiHome, FiScissors, FiInfo, FiPhone, FiCompass, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

export const Navbar = ({ onToggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user?.role) return "/";
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: <FiHome size={18} /> },
    { to: "/salons", label: "Explore Salons", icon: <FiCompass size={18} /> },
    { to: "/services", label: "Services", icon: <FiScissors size={18} /> },
    { to: "/about", label: "About Us", icon: <FiInfo size={18} /> },
    { to: "/contact", label: "Contact", icon: <FiPhone size={18} /> },
  ];

  const handleHamburgerClick = () => {
    if (onToggleSidebar && isAuthenticated) {
      onToggleSidebar();
    } else {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  return (
    <>
      <nav
        className="glass-panel"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderRadius: "0 0 var(--radius-ui) var(--radius-ui)",
          borderTop: "none",
          padding: "12px 4%",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: "var(--glass-bg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1320px",
            margin: "0 auto",
          }}
        >
          {/* Brand & Left Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* 3-Line Hamburger Button */}
            <button
              onClick={handleHamburgerClick}
              aria-label="Toggle Navigation Menu"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.35rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                color: "var(--color-dark)",
                borderRadius: "var(--radius-sm)",
                transition: "background-color 0.2s",
              }}
            >
              <FiMenu size={22} />
            </button>

            {/* Veloura Brand Logo */}
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <img
                src="/veloura-logo.png"
                alt="Veloura Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(216, 69, 112, 0.15)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span
                  style={{
                    fontSize: "1.45rem",
                    fontWeight: "800",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.02em",
                    color: "var(--color-primary)",
                  }}
                >
                  Veloura
                </span>
                <span
                  style={{
                    fontSize: "0.66rem",
                    fontWeight: "700",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-secondary)",
                  }}
                >
                  Beauty Salon
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "none",
                alignItems: "center",
                gap: "24px",
                fontSize: "0.93rem",
                fontWeight: "600",
              }}
              className="desktop-nav-links"
            >
              {navLinks.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      textDecoration: "none",
                      color: isActive ? "var(--color-primary)" : "var(--color-dark)",
                      borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                      padding: "4px 0",
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isAuthenticated ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(getDashboardLink())}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Slide-out Drawer ─── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 998,
              transition: "opacity 0.3s ease",
            }}
          />

          {/* Drawer Panel */}
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "290px",
              backgroundColor: "var(--color-card)",
              zIndex: 999,
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-lg)",
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "18px",
                borderBottom: "1px solid var(--color-border)",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src="/veloura-logo.png"
                  alt="Veloura"
                  style={{ width: "36px", height: "36px", borderRadius: "8px" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "800",
                      color: "var(--color-primary)",
                      lineHeight: 1.1,
                    }}
                  >
                    Veloura
                  </div>
                  <div
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: "700",
                      color: "var(--color-secondary)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Beauty Salon
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--color-muted)",
                  padding: "4px",
                }}
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Navigation List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {navLinks.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-ui)",
                      textDecoration: "none",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
                      color: isActive ? "var(--color-primary)" : "var(--color-dark)",
                      transition: "var(--transition-base)",
                    }}
                  >
                    <span style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted)" }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Auth Section */}
            <div
              style={{
                paddingTop: "18px",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {isAuthenticated ? (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(getDashboardLink());
                    }}
                  >
                    My Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/register");
                    }}
                  >
                    Register Account
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Media Query Hook for Desktop Links */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav-links {
            display: flex !important;
          }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
