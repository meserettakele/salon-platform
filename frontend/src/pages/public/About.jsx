// src/pages/public/About.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiHeart,
  FiShield,
  FiAward,
  FiUsers,
  FiClock,
  FiArrowRight,
  FiMapPin,
  FiStar,
} from "react-icons/fi";

export const About = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: "var(--color-bg-warm)", minHeight: "100vh" }}>
      {/* ─── Hero Section ─── */}
      <section
        style={{
          position: "relative",
          backgroundColor: "#1b1420",
          color: "#FFFFFF",
          padding: "80px 20px 90px",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(180deg, rgba(20, 14, 24, 0.88) 0%, rgba(27, 20, 32, 0.95) 100%), url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ maxWidth: "840px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "rgba(216, 69, 112, 0.25)",
              color: "#ff85ab",
              fontSize: "0.82rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            <span>👑 About Veloura</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
              fontWeight: "800",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              marginBottom: "18px",
              color: "#FFFFFF",
            }}
          >
            Redefining Beauty Care in Addis Ababa
          </h1>

          <p
            style={{
              fontSize: "1.12rem",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "1.7",
              maxWidth: "680px",
              margin: "0 auto 36px",
            }}
          >
            Veloura is Ethiopia's premier digital beauty destination—connecting clients with top-tier salons, verified specialists, and effortless appointment scheduling.
          </p>

          <button
            onClick={() => navigate("/salons")}
            style={{
              padding: "15px 34px",
              borderRadius: "var(--radius-ui)",
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 8px 24px rgba(216, 69, 112, 0.4)",
            }}
          >
            <span>Explore Premier Salons</span>
            <FiArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── Our Story ─── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 5% 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "50px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                fontSize: "0.8rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              Our Mission
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                fontWeight: "800",
                color: "var(--color-dark)",
                letterSpacing: "-0.02em",
                marginBottom: "18px",
                lineHeight: 1.25,
              }}
            >
              A Sanctuary for Elegance, Precision & Time
            </h2>
            <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "16px" }}>
              For too long, booking a trusted salon in Addis Ababa meant long waiting times, uncertain phone calls, and unpredictable stylist schedules.
            </p>
            <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "24px" }}>
              Veloura was founded to create an elegant, seamless bridge between discerning clients and certified salon artisans. From luxury balayage to rejuvenating spa facials and precision nail artistry, Veloura guarantees effortless reservation, verified excellence, and transparent ETB pricing.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
                <FiCheckCircle color="var(--color-primary)" size={20} />
                <span>100% Verified Salons</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
                <FiCheckCircle color="var(--color-primary)" size={20} />
                <span>Real-Time Scheduling</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
                <FiCheckCircle color="var(--color-primary)" size={20} />
                <span>Transparent Pricing</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", fontSize: "0.95rem" }}>
                <FiCheckCircle color="var(--color-primary)" size={20} />
                <span>Certified Specialists</span>
              </div>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
              alt="Veloura Luxury Salon"
              style={{
                width: "100%",
                borderRadius: "var(--radius-ios)",
                boxShadow: "var(--shadow-luxury)",
                border: "1px solid var(--color-border)",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "20px",
                backgroundColor: "#FFFFFF",
                padding: "16px 24px",
                borderRadius: "var(--radius-ui)",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                }}
              >
                ⭐
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-dark)" }}>
                  4.9 / 5.0 Rating
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                  Trusted by 10,000+ Clients
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Pillars ─── */}
      <section
        style={{
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          padding: "80px 5%",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 50px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--color-secondary-light)",
                color: "var(--color-secondary)",
                fontSize: "0.8rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              Our Core Pillars
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
              The Veloura Standard
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "28px",
            }}
          >
            <div
              style={{
                padding: "32px 24px",
                borderRadius: "var(--radius-ios)",
                backgroundColor: "var(--color-bg-warm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <FiAward size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                Vetted Excellence
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                We inspect every salon partner for hygiene protocols, quality of products, and stylist certification.
              </p>
            </div>

            <div
              style={{
                padding: "32px 24px",
                borderRadius: "var(--radius-ios)",
                backgroundColor: "var(--color-bg-warm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "var(--color-secondary-light)",
                  color: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <FiClock size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                Zero Waiting Time
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Reserve the exact chair and time that works for your day, without waiting in long salon queues.
              </p>
            </div>

            <div
              style={{
                padding: "32px 24px",
                borderRadius: "var(--radius-ios)",
                backgroundColor: "var(--color-bg-warm)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <FiUsers size={24} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                Client-Centric Care
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Read genuine client feedback, track your booking history, and manage appointments with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Location & Network ─── */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "80px 5% 100px", textAlign: "center" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiMapPin size={28} />
        </div>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "12px" }}>
          Proudly Rooted in Addis Ababa
        </h2>
        <p style={{ color: "var(--color-muted)", fontSize: "1.05rem", lineHeight: 1.65, maxWidth: "600px", margin: "0 auto 28px" }}>
          Serving clients across Bole, Kazanchis, CMC, Sarbet, Old Airport, and across the capital. Experience beauty at its finest.
        </p>
        <button
          onClick={() => navigate("/salons")}
          style={{
            padding: "14px 32px",
            borderRadius: "var(--radius-ui)",
            backgroundColor: "var(--color-primary)",
            color: "#FFFFFF",
            border: "none",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(216, 69, 112, 0.35)",
          }}
        >
          Find Salons Near You →
        </button>
      </section>
    </div>
  );
};

export default About;
