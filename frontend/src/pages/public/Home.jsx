// src/pages/public/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCalendar, FiCheckCircle, FiStar, FiMapPin, FiScissors, FiShield, FiClock, FiArrowRight } from "react-icons/fi";
import * as CommonComponents from "../../components/common/Button";
import * as CardComponents from "../../components/common/Card";
import * as LoaderComponents from "../../components/common/Loader";
import { salonService } from "../../services/salonService";
import { getImageUrl } from "../../services/api";

const Button = CommonComponents.Button || CommonComponents.default || "button";
const Card = CardComponents.Card || CardComponents.default || "div";
const Loader =
  LoaderComponents.Loader ||
  LoaderComponents.default ||
  (() => (
    <div style={{ textAlign: "center", padding: "60px" }}>Loading Veloura...</div>
  ));

/* ─── Stylesheet animations & effects ─── */
const css = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes floatGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
  50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.4; }
}
.veloura-hero-badge { animation: fadeUp .6s ease both; }
.veloura-hero-h1    { animation: fadeUp .6s .12s ease both; }
.veloura-hero-sub   { animation: fadeUp .6s .22s ease both; }
.veloura-hero-search{ animation: fadeUp .6s .32s ease both; }
.veloura-hero-stats { animation: fadeUp .6s .42s ease both; }

.salon-card-wrap {
  transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s cubic-bezier(.16,1,.3,1), border-color .35s ease;
}
.salon-card-wrap:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 50px -12px rgba(216, 69, 112, 0.16) !important;
  border-color: rgba(216, 69, 112, 0.3) !important;
}

.cat-card {
  transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1), border-color .3s ease;
}
.cat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px -8px rgba(216, 69, 112, 0.12) !important;
  border-color: rgba(216, 69, 112, 0.25) !important;
}

.feature-box {
  transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1);
}
.feature-box:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
}
`;

const EMOJI_MAP = {
  hair: "✂️", nail: "💅", makeup: "💄", skin: "🌿",
  facial: "🌸", spa: "🛁", brow: "👁️", lash: "✨",
  massage: "💆", wax: "🪷", color: "🎨", bridal: "👰",
};

const getCategoryEmoji = (name = "") => {
  const lower = name.toLowerCase();
  return Object.entries(EMOJI_MAP).find(([k]) => lower.includes(k))?.[1] ?? "💄";
};

export const Home = () => {
  const navigate = useNavigate();
  const [featuredSalons, setFeaturedSalons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const [salonsResult, categoriesResult] = await Promise.allSettled([
          salonService.getAllSalons(),
          salonService.getCategories(),
        ]);
        if (salonsResult.status === "fulfilled" && Array.isArray(salonsResult.value)) {
          setFeaturedSalons(salonsResult.value.slice(0, 3));
        }
        if (categoriesResult.status === "fulfilled" && Array.isArray(categoriesResult.value)) {
          setCategories(categoriesResult.value);
        }
      } catch (err) {
        console.error("Landing page load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/salons?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/salons");
    }
  };

  if (loading) return <Loader text="Preparing your Veloura experience..." fullPage />;

  return (
    <>
      <style>{css}</style>

      <div style={{ background: "var(--color-bg-warm)", minHeight: "100vh" }}>

        {/* ═══════════════════ LUXURY HERO SECTION ═══════════════════ */}
        <section
          style={{
            position: "relative",
            minHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundImage:
              "linear-gradient(180deg, rgba(16, 12, 18, 0.72) 0%, rgba(20, 14, 22, 0.82) 100%), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "80px 20px 100px",
          }}
        >
          {/* Ambient Brand Glow */}
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "650px",
              height: "650px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(216,69,112,0.3) 0%, rgba(197,160,89,0.12) 50%, transparent 70%)",
              pointerEvents: "none",
              animation: "floatGlow 8s ease-in-out infinite",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "880px",
              width: "100%",
              textAlign: "center",
              margin: "0 auto",
            }}
          >
            {/* Brand Emblem & Welcome Badge */}
            <div
              className="veloura-hero-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 22px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "0.85rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "28px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                src="/veloura-logo.png"
                alt="Veloura"
                style={{ width: "22px", height: "22px", borderRadius: "5px" }}
              />
              <span>Veloura Luxury Beauty Network</span>
            </div>

            {/* Headline */}
            <h1
              className="veloura-hero-h1"
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(2.8rem, 6vw, 4.6rem)",
                lineHeight: 1.1,
                fontWeight: "800",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
                marginBottom: "22px",
              }}
            >
              Where Elegance Meets<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #ff7ba4 0%, #ffd080 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Exceptional Salon Care
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="veloura-hero-sub"
              style={{
                color: "rgba(255, 255, 255, 0.88)",
                fontSize: "1.12rem",
                lineHeight: 1.7,
                maxWidth: "640px",
                margin: "0 auto 36px",
              }}
            >
              Discover premier salons in Addis Ababa, book certified specialists, and enjoy a seamless luxury experience from first touch to final look.
            </p>

            {/* Quick Interactive Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="veloura-hero-search"
              style={{
                maxWidth: "680px",
                margin: "0 auto 36px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-ios)",
                padding: "8px 10px 8px 20px",
                boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.35)",
                gap: "12px",
              }}
            >
              <FiSearch size={22} color="var(--color-primary)" />
              <input
                type="text"
                placeholder="Search salons, hair stylists, nail artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "1rem",
                  color: "var(--color-dark)",
                  backgroundColor: "transparent",
                  width: "100%",
                  padding: "6px 0",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "var(--radius-ui)",
                  padding: "14px 28px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "var(--transition-base)",
                  boxShadow: "0 6px 16px rgba(216, 69, 112, 0.35)",
                }}
              >
                Search
              </button>
            </form>

            {/* Trust Metric Stats Ribbon */}
            <div
              className="veloura-hero-stats"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "32px",
                flexWrap: "wrap",
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiCheckCircle color="#ff85ab" size={18} />
                <span>Verified Salons</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiStar color="#ffd080" size={18} />
                <span>Top Certified Stylists</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiCalendar color="#ff85ab" size={18} />
                <span>Instant Online Booking</span>
              </div>
            </div>
          </div>

          {/* Smooth Bottom Fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "90px",
              background: "linear-gradient(transparent, var(--color-bg-warm))",
              pointerEvents: "none",
            }}
          />
        </section>

        {/* ═══════════════════ CURATED CATEGORIES ═══════════════════ */}
        {categories.length > 0 && (
          <section style={{ padding: "80px 5% 40px", maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 16px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Curated Treatments
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                  fontWeight: "800",
                  color: "var(--color-dark)",
                  letterSpacing: "-0.02em",
                }}
              >
                Explore Beauty Categories
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "20px",
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="cat-card"
                  onClick={() => navigate(`/salons?categoryId=${cat.id}`)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "var(--radius-ios)",
                    padding: "28px 18px",
                    backgroundColor: "var(--color-card)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      margin: "0 auto 16px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(216,69,112,0.1) 0%, rgba(197,160,89,0.12) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      boxShadow: "0 6px 18px rgba(216, 69, 112, 0.1)",
                    }}
                  >
                    {getCategoryEmoji(cat.name)}
                  </div>

                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: "700",
                      color: "var(--color-dark)",
                      marginBottom: "6px",
                    }}
                  >
                    {cat.name}
                  </h3>

                  <p style={{ color: "var(--color-muted)", fontSize: "0.82rem", fontWeight: "500" }}>
                    Explore treatments →
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════ FEATURED SALONS ═══════════════════ */}
        <section style={{ padding: "60px 5% 90px", maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "38px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 16px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--color-secondary-light)",
                  color: "var(--color-secondary)",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Premier Destinations
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                  fontWeight: "800",
                  color: "var(--color-dark)",
                  letterSpacing: "-0.02em",
                }}
              >
                Featured Salons in Addis
              </h2>
            </div>

            <button
              onClick={() => navigate("/salons")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "var(--radius-ui)",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-primary)",
                fontWeight: "700",
                fontSize: "0.92rem",
                cursor: "pointer",
                boxShadow: "var(--shadow-xs)",
                transition: "var(--transition-base)",
              }}
            >
              <span>View All Salons</span>
              <FiArrowRight size={16} />
            </button>
          </div>

          {featuredSalons.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-muted)", padding: "60px 0" }}>
              No featured salons found at the moment.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "32px",
              }}
            >
              {featuredSalons.map((salon) => (
                <div
                  key={salon.id}
                  className="salon-card-wrap"
                  onClick={() => navigate(`/salons/${salon.id}`)}
                  style={{
                    borderRadius: "var(--radius-ios)",
                    overflow: "hidden",
                    backgroundColor: "var(--color-card)",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Hero Photo with Badge */}
                  <div style={{ position: "relative", height: "230px", overflow: "hidden" }}>
                    <img
                      src={
                        salon.logo
                          ? getImageUrl(salon.logo)
                          : salon.images?.[0]
                            ? getImageUrl(salon.images[0])
                            : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80"
                      }
                      alt={salon.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        left: "14px",
                        backgroundColor: "rgba(24, 24, 27, 0.75)",
                        backdropFilter: "blur(8px)",
                        color: "#FFFFFF",
                        padding: "4px 12px",
                        borderRadius: "var(--radius-pill)",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiStar color="#ffd080" size={13} />
                      <span>Verified Salon</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "700",
                        color: "var(--color-dark)",
                        marginBottom: "8px",
                      }}
                    >
                      {salon.name}
                    </h3>

                    <p
                      style={{
                        color: "var(--color-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiMapPin size={16} color="var(--color-primary)" />
                      <span>
                        {salon.subCity ? `${salon.subCity}, ${salon.city}` : salon.address || "Addis Ababa"}
                      </span>
                    </p>

                    <div style={{ marginTop: "auto" }}>
                      <button
                        type="button"
                        style={{
                          width: "100%",
                          padding: "13px 0",
                          borderRadius: "var(--radius-ui)",
                          border: "none",
                          backgroundColor: "var(--color-primary)",
                          color: "#FFFFFF",
                          fontWeight: "700",
                          fontSize: "0.92rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 6px 18px -4px rgba(216, 69, 112, 0.35)",
                          transition: "var(--transition-base)",
                        }}
                      >
                        <span>View Salon & Book</span>
                        <FiArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════ THE VELOURA ADVANTAGE ═══════════════════ */}
        <section
          style={{
            padding: "80px 5%",
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 56px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 16px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Why Veloura
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                  fontWeight: "800",
                  color: "var(--color-dark)",
                  letterSpacing: "-0.02em",
                  marginBottom: "14px",
                }}
              >
                A New Standard in Salon Booking
              </h2>
              <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
                Everything you need to discover, schedule, and indulge in top-tier beauty care without phone calls or queue lines.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "28px",
              }}
            >
              <div
                className="feature-box"
                style={{
                  padding: "32px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-bg-warm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FiScissors size={24} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                  Curated Stylists
                </h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Verified beauty specialists with authentic reviews, specialized portfolios, and certified experience.
                </p>
              </div>

              <div
                className="feature-box"
                style={{
                  padding: "32px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-bg-warm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: "var(--color-secondary-light)",
                    color: "var(--color-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FiClock size={24} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                  Live Slot Availability
                </h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Real-time calendar schedules adjusted dynamically for multi-service durations and specialist availability.
                </p>
              </div>

              <div
                className="feature-box"
                style={{
                  padding: "32px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-bg-warm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FiShield size={24} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                  Transparent ETB Pricing
                </h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Upfront pricing with zero hidden fees. Know exactly what you will pay before you confirm your appointment.
                </p>
              </div>

              <div
                className="feature-box"
                style={{
                  padding: "32px 24px",
                  borderRadius: "var(--radius-ios)",
                  backgroundColor: "var(--color-bg-warm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(14, 165, 233, 0.1)",
                    color: "#0ea5e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FiStar size={24} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>
                  Google & Fast Access
                </h3>
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  1-click Google registration and instant appointment confirmations right on your personal dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ READY FOR BEAUTY TRANSFORMATION CTA ═══════════════════ */}
        <section style={{ padding: "80px 5% 100px", maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              borderRadius: "var(--radius-ios)",
              padding: "56px 44px",
              background: "linear-gradient(135deg, #1c1622 0%, #2e1828 50%, #1f121e 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "32px",
              boxShadow: "0 24px 50px -12px rgba(216, 69, 112, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient subtle glow inside card */}
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(216,69,112,0.35) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ maxWidth: "640px", position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "rgba(216,69,112,0.2)",
                  color: "#ff85ab",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <span>✨ Ready for Your Next Look?</span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.7rem)",
                  fontWeight: "800",
                  color: "#FFFFFF",
                  marginBottom: "14px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Book Your Premier Salon Experience Today
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "1.05rem", lineHeight: 1.65 }}>
                Browse top-rated beauty salons across Addis Ababa, select your preferred specialists, and reserve your time slot in seconds with instant confirmation.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <button
                onClick={() => navigate("/salons")}
                style={{
                  padding: "16px 36px",
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
                  transition: "var(--transition-base)",
                }}
              >
                <span>Explore Salons Now</span>
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;


