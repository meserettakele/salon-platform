// src/pages/public/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as CommonComponents from "../../components/common/Button";
import * as CardComponents from "../../components/common/Card";
import * as LoaderComponents from "../../components/common/Loader";
import { salonService } from "../../services/salonService";

const Button = CommonComponents.Button || CommonComponents.default || "button";
const Card = CardComponents.Card || CardComponents.default || "div";
const Loader =
  LoaderComponents.Loader ||
  LoaderComponents.default ||
  (() => (
    <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
  ));

const IMAGE_BASE_URL = "http://localhost:5000/uploads/";

/* ─── tiny inline stylesheet ─────────────────────────────────── */
const css = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%,100% { opacity:.7; } 50% { opacity:1; }
}
.home-hero-badge   { animation: fadeUp .7s ease both; }
.home-hero-h1      { animation: fadeUp .7s .12s ease both; }
.home-hero-sub     { animation: fadeUp .7s .22s ease both; }
.home-hero-btns    { animation: fadeUp .7s .32s ease both; }

.salon-card-wrap:hover { transform: translateY(-6px); box-shadow: 0 24px 56px rgba(233,30,99,.13) !important; }
.salon-card-wrap       { transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s cubic-bezier(.16,1,.3,1); }

.cat-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(233,30,99,.10) !important; }
.cat-card       { transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1); }

.view-btn:hover { background: #c2185b !important; transform: scale(1.03); }
.view-btn       { transition: background .25s, transform .2s; }
`;

/* ─── category emoji map ─────────────────────────────────────── */
const EMOJI_MAP = {
  hair: "✂️", nail: "💅", makeup: "💄", skin: "🌿",
  facial: "🌸", spa: "🛁", brow: "👁️", lash: "👁️",
  massage: "💆", wax: "🪷", color: "🎨",
};
const getCategoryEmoji = (name = "") => {
  const lower = name.toLowerCase();
  return Object.entries(EMOJI_MAP).find(([k]) => lower.includes(k))?.[1] ?? "💄";
};

/* ─── component ──────────────────────────────────────────────── */
export const Home = () => {
  const navigate = useNavigate();
  const [featuredSalons, setFeaturedSalons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const [salonsResult, categoriesResult] = await Promise.allSettled([
          salonService.getAllSalons(),
          salonService.getCategories(),
        ]);
        if (salonsResult.status === "fulfilled" && Array.isArray(salonsResult.value))
          setFeaturedSalons(salonsResult.value.slice(0, 3));
        if (categoriesResult.status === "fulfilled" && Array.isArray(categoriesResult.value))
          setCategories(categoriesResult.value);
      } catch (err) {
        console.error("Landing page load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  const getImageUrl = (imageObj) => {
    if (!imageObj) return "";
    const url = typeof imageObj === "string" ? imageObj : imageObj.imageUrl;
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    let cleanUrl = url.replace(/\\/g, "/").replace(/^\/+/, "");
    if (cleanUrl.startsWith("uploads/")) cleanUrl = cleanUrl.substring(8);
    return `${IMAGE_BASE_URL}${cleanUrl}`;
  };

  if (loading) return <Loader />;

  return (
    <>
      {/* inject keyframes */}
      <style>{css}</style>

      <div style={{ background: "var(--color-bg-warm)", minHeight: "100vh" }}>

        {/* ═══════════════════ HERO ═══════════════════ */}
        <section
          style={{
            position: "relative",
            minHeight: "88vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundImage:
              "linear-gradient(rgba(10,8,15,0.60), rgba(10,8,15,0.50)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* decorative glow */}
          <div style={{
            position: "absolute", top: "30%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "520px", height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(233,30,99,.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* content */}
          <div style={{
            position: "relative", zIndex: 2,
            maxWidth: "720px", width: "90%",
            textAlign: "center", padding: "0 20px",
          }}>
            {/* badge */}
            <div className="home-hero-badge" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "7px 20px",
              borderRadius: "30px",
              background: "rgba(233,30,99,.14)",
              border: "1px solid rgba(233,30,99,.35)",
              backdropFilter: "blur(12px)",
              color: "#f9a8c9",
              fontWeight: "600", fontSize: ".82rem",
              letterSpacing: ".06em", textTransform: "uppercase",
              marginBottom: "28px",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e91e63", animation: "shimmer 2s ease infinite", display: "inline-block" }} />
              Trusted · Professional · Elegant
            </div>

            {/* headline */}
            <h1 className="home-hero-h1" style={{
              color: "#fff",
              fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)",
              lineHeight: 1.08,
              fontWeight: "800",
              marginBottom: "22px",
            }}>
              Discover Your Next<br />
              <span style={{
                background: "linear-gradient(135deg, #e91e63, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Beauty Experience
              </span>
            </h1>

            {/* subtext */}
            <p className="home-hero-sub" style={{
              color: "rgba(255,255,255,.78)",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              maxWidth: "520px",
              margin: "0 auto 38px",
            }}>
              Find trusted beauty salons, explore premium services, and book
              appointments with confidence — all in one place.
            </p>

            {/* CTAs */}
            <div className="home-hero-btns" style={{
              display: "flex", gap: "14px",
              justifyContent: "center", flexWrap: "wrap",
            }}>
              <button
                onClick={() => navigate("/salons")}
                style={{
                  padding: "14px 34px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #e91e63, #c2185b)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 8px 28px rgba(233,30,99,.38)",
                  letterSpacing: ".01em",
                }}
              >
                Explore Salons →
              </button>

              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "14px 34px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,.28)",
                  background: "rgba(255,255,255,.09)",
                  backdropFilter: "blur(12px)",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  letterSpacing: ".01em",
                }}
              >
                Join Today
              </button>
            </div>
          </div>

          {/* bottom fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "100px",
            background: "linear-gradient(transparent, var(--color-bg-warm))",
            pointerEvents: "none",
          }} />
        </section>

        {/* ═══════════════════ CATEGORIES ═══════════════════ */}
        {categories.length > 0 && (
          <section style={{ padding: "72px 5%", maxWidth: "1200px", margin: "0 auto" }}>
            {/* section header */}
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              <span style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: "20px",
                background: "rgba(233,30,99,.08)",
                color: "#e91e63",
                fontSize: ".8rem",
                fontWeight: "700",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}>
                Browse by Type
              </span>
              <h2 style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: "800",
                color: "var(--color-dark)",
              }}>
                Beauty Categories
              </h2>
            </div>

            {/* grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "20px",
            }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="cat-card"
                  onClick={() => navigate(`/salons?categoryId=${cat.id}`)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "18px",
                    padding: "32px 20px",
                    background: "#fff",
                    textAlign: "center",
                    boxShadow: "0 6px 24px rgba(0,0,0,.06)",
                    border: "1px solid rgba(0,0,0,.04)",
                  }}
                >
                  <div style={{
                    width: "60px", height: "60px",
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #fde7ef, #fce4ec)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    boxShadow: "0 4px 16px rgba(233,30,99,.12)",
                  }}>
                    {getCategoryEmoji(cat.name)}
                  </div>

                  <h3 style={{
                    fontSize: ".95rem",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    marginBottom: "6px",
                  }}>
                    {cat.name}
                  </h3>

                  <p style={{
                    color: "#999",
                    fontSize: ".78rem",
                    fontWeight: "500",
                  }}>
                    Explore salons
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════ FEATURED SALONS ═══════════════════ */}
        <section style={{
          padding: "0 5% 100px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          {/* section header */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "36px",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div>
              <span style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: "20px",
                background: "rgba(212,175,55,.10)",
                color: "#b8972a",
                fontSize: ".8rem",
                fontWeight: "700",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}>
                Top Picks
              </span>
              <h2 style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: "800",
                color: "var(--color-dark)",
              }}>
                Featured Salons
              </h2>
            </div>

            <button
              onClick={() => navigate("/salons")}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "1.5px solid rgba(233,30,99,.25)",
                background: "transparent",
                color: "#e91e63",
                fontWeight: "600",
                fontSize: ".9rem",
                cursor: "pointer",
              }}
            >
              View All →
            </button>
          </div>

          {featuredSalons.length === 0 ? (
            <p style={{
              textAlign: "center",
              color: "var(--color-muted)",
              padding: "60px 0",
            }}>
              No featured salons available yet.
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "28px",
            }}>
              {featuredSalons.map((salon) => (
                <div
                  key={salon.id}
                  className="salon-card-wrap"
                  onClick={() => navigate(`/salons/${salon.id}`)}
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(0,0,0,.07)",
                    border: "1px solid rgba(0,0,0,.04)",
                  }}
                >
                  {/* image */}
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img
                      src={
                        salon.logo
                          ? getImageUrl(salon.logo)
                          : salon.images?.[0]
                            ? getImageUrl(salon.images[0])
                            : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={salon.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* gradient overlay */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: "80px",
                      background: "linear-gradient(transparent, rgba(0,0,0,.3))",
                    }} />
                  </div>

                  {/* content */}
                  <div style={{ padding: "22px 24px 24px" }}>
                    <h3 style={{
                      fontSize: "1.05rem",
                      fontWeight: "700",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                    }}>
                      {salon.name}
                    </h3>

                    <p style={{
                      color: "#888",
                      fontSize: ".88rem",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}>
                      📍
                      {salon.subCity
                        ? `${salon.subCity}, ${salon.city}`
                        : salon.address}
                    </p>

                    <button
                      className="view-btn"
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        borderRadius: "10px",
                        border: "none",
                        background: "#e91e63",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: ".9rem",
                        cursor: "pointer",
                      }}
                    >
                      View Salon →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  );
};

export default Home;
