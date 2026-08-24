import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)",
        color: "var(--color-dark)",
        padding: "70px 5% 30px",
        marginTop: "auto",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "40px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <img
              src="/veloura-logo.png"
              alt="Veloura"
              style={{ width: "36px", height: "36px", borderRadius: "8px" }}
            />
            <span
              style={{
                color: "var(--color-primary)",
                fontSize: "1.6rem",
                fontWeight: "800",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Veloura
            </span>
          </div>

          <p
            style={{
              lineHeight: "1.7",
              color: "var(--color-muted)",
              fontSize: "0.92rem",
              maxWidth: "320px",
            }}
          >
            Addis Ababa's premier digital beauty destination. Discover verified salons, explore curated services, and schedule appointments effortlessly.
          </p>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: "700",
              marginBottom: "18px",
              color: "var(--color-dark)",
            }}
          >
            Explore
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem" }}>
            <Link to="/" style={{ textDecoration: "none", color: "var(--color-muted)", transition: "color 0.2s" }}>
              Home
            </Link>
            <Link to="/salons" style={{ textDecoration: "none", color: "var(--color-muted)", transition: "color 0.2s" }}>
              Explore Salons
            </Link>
            <Link to="/services" style={{ textDecoration: "none", color: "var(--color-muted)", transition: "color 0.2s" }}>
              Our Services Menu
            </Link>
            <Link to="/about" style={{ textDecoration: "none", color: "var(--color-muted)", transition: "color 0.2s" }}>
              About Veloura
            </Link>
            <Link to="/contact" style={{ textDecoration: "none", color: "var(--color-muted)", transition: "color 0.2s" }}>
              Contact & Concierge
            </Link>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: "700",
              marginBottom: "18px",
              color: "var(--color-dark)",
            }}
          >
            Client Care
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem", color: "var(--color-muted)" }}>
            <p style={{ margin: 0 }}>📍 Bole Road, Addis Ababa, Ethiopia</p>
            <p style={{ margin: 0 }}>✉️ support@veloura.com</p>
            <p style={{ margin: 0 }}>☎️ +251 920 573 291</p>
            <p style={{ margin: 0 }}>🕒 Mon – Sun: 8:00 AM – 8:00 PM</p>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "50px",
          paddingTop: "24px",
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          color: "var(--color-muted)",
          fontSize: "0.85rem",
        }}
      >
        © {new Date().getFullYear()} Veloura Beauty Salon. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

