import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiScissors,
  FiStar,
  FiClock,
  FiDollarSign,
  FiArrowRight,
  FiSearch,
  FiCheckCircle,
} from "react-icons/fi";
import { salonService } from "../../services/salonService";
import Loader from "../../components/common/Loader";

const POPULAR_SERVICES = [
  {
    id: "hair-styling",
    title: "Signature Haircut & Styling",
    category: "Hair",
    icon: "✂️",
    duration: "45 - 60 min",
    priceRange: "400 - 1,200 ETB",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80",
    description:
      "Precision cut tailored to your face shape, followed by luxury wash, blow-dry, and professional styling.",
    benefits: ["Custom hair consultation", "Deep conditioning treatment", "Long-lasting finish"],
  },
  {
    id: "hair-coloring",
    title: "Balayage & Color Transformation",
    category: "Hair",
    icon: "🎨",
    duration: "120 - 180 min",
    priceRange: "1,500 - 4,500 ETB",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80",
    description:
      "Hand-painted balayage, highlights, or full color using ammonia-free, hair-nourishing premium pigments.",
    benefits: ["Seamless color blending", "Gloss toner included", "Bond-protecting treatment"],
  },
  {
    id: "braids-locs",
    title: "Luxury Braids, Twists & Locs",
    category: "Hair",
    icon: "✨",
    duration: "180 - 300 min",
    priceRange: "800 - 2,800 ETB",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=700&q=80",
    description:
      "Traditional and modern Ethiopian braided hairstyles, knotless box braids, passion twists, and loc maintenance.",
    benefits: ["Scalp-friendly gentle tension", "Premium synthetic or human hair", "Clean parting precision"],
  },
  {
    id: "manicure-pedicure",
    title: "Gel Manicure & Luxury Spa Pedicure",
    category: "Nails",
    icon: "💅",
    duration: "60 - 90 min",
    priceRange: "500 - 1,500 ETB",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80",
    description:
      "Cuticle refinement, exfoliation scrub, hot towel massage, and high-shine gel polish lasting 3+ weeks.",
    benefits: ["Chip-resistant gel coat", "Relaxing foot soak & scrub", "Nourishing cuticle oil"],
  },
  {
    id: "facial-skincare",
    title: "Hydrating & Rejuvenating Facial",
    category: "Skin",
    icon: "🌸",
    duration: "60 - 75 min",
    priceRange: "1,000 - 3,000 ETB",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
    description:
      "Deep pore ultrasonic cleansing, steam extraction, botanical mask, and lymphatic drainage massage.",
    benefits: ["Instant radiance glow", "Custom serum infusion", "Pore tightening & hydration"],
  },
  {
    id: "makeup-glam",
    title: "Bridal & Evening Glam Makeup",
    category: "Makeup",
    icon: "💄",
    duration: "60 - 90 min",
    priceRange: "1,200 - 3,500 ETB",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80",
    description:
      "Flawless HD foundation application, defined eye makeup, contouring, and 16-hour setting spray finish.",
    benefits: ["Customized bridal consultations", "Includes mink lashes", "Water-resistant formula"],
  },
  {
    id: "massage-spa",
    title: "Aromatherapy Full Body Massage",
    category: "Spa",
    icon: "🛁",
    duration: "60 - 90 min",
    priceRange: "1,200 - 2,500 ETB",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80",
    description:
      "Therapeutic body massage using pure essential botanical oils to relieve muscle tension and restore peace.",
    benefits: ["Custom essential oil blends", "Relieves muscle stress", "Total mind & body renewal"],
  },
  {
    id: "lashes-brows",
    title: "Lash Extensions & Brow Lamination",
    category: "Brows",
    icon: "👁️",
    duration: "45 - 90 min",
    priceRange: "600 - 1,800 ETB",
    image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=700&q=80",
    description:
      "Featherlight classic or volume eyelash extensions alongside brow shaping, tinting, and lamination.",
    benefits: ["Custom lash mapping", "Semi-permanent waterproof", "Defined natural arch"],
  },
];

export const Services = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const res = await salonService.getCategories();
        if (Array.isArray(res)) {
          setCategories(res);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const allCategoryTags = [
    "All",
    "Hair",
    "Nails",
    "Skin",
    "Makeup",
    "Spa",
    "Brows",
  ];

  const filteredServices = POPULAR_SERVICES.filter((srv) => {
    const matchesCategory =
      selectedCategory === "All" || srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      srv.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "var(--color-bg-warm)", minHeight: "100vh" }}>
      {/* ─── Hero Banner ─── */}
      <section
        style={{
          position: "relative",
          backgroundColor: "#1c1622",
          color: "#FFFFFF",
          padding: "70px 20px 80px",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(180deg, rgba(20, 14, 24, 0.85) 0%, rgba(28, 22, 34, 0.95) 100%), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span
            style={{
              display: "inline-block",
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
            ✨ The Veloura Service Menu
          </span>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: "800",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              color: "#FFFFFF",
            }}
          >
            Luxury Beauty & Wellness Treatments
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "1.6",
              maxWidth: "640px",
              margin: "0 auto 32px",
            }}
          >
            Explore our curated menu of salon and spa treatments available across top-rated salons in Addis Ababa.
          </p>

          {/* Quick Search inside Services Hero */}
          <div
            style={{
              maxWidth: "540px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-ios)",
              padding: "6px 10px 6px 18px",
              boxShadow: "0 16px 36px rgba(0,0,0,0.3)",
              gap: "10px",
            }}
          >
            <FiSearch size={20} color="var(--color-primary)" />
            <input
              type="text"
              placeholder="Search treatments (e.g., Balayage, Gel Nails, Facial)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "0.95rem",
                width: "100%",
                backgroundColor: "transparent",
                color: "var(--color-dark)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── Category Filter Chips ─── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 5% 20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
          className="no-scrollbar"
        >
          {allCategoryTags.map((tag) => {
            const isSelected = selectedCategory === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedCategory(tag)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "var(--radius-pill)",
                  border: isSelected
                    ? "1px solid var(--color-primary)"
                    : "1px solid var(--color-border)",
                  backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-card)",
                  color: isSelected ? "#FFFFFF" : "var(--color-dark)",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? "0 4px 14px rgba(216, 69, 112, 0.3)"
                    : "var(--shadow-xs)",
                  transition: "var(--transition-base)",
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Services Grid ─── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 5% 90px" }}>
        {filteredServices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-muted)" }}>
            <p style={{ fontSize: "1.1rem" }}>No treatments found matching "{searchFilter}".</p>
            <button
              onClick={() => {
                setSearchFilter("");
                setSelectedCategory("All");
              }}
              style={{
                marginTop: "16px",
                padding: "8px 20px",
                borderRadius: "var(--radius-ui)",
                border: "1px solid var(--color-primary)",
                color: "var(--color-primary)",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "30px",
            }}
          >
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                style={{
                  backgroundColor: "var(--color-card)",
                  borderRadius: "var(--radius-ios)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "var(--transition-premium)",
                }}
                className="luxury-card"
              >
                {/* Photo & Tag */}
                <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                  <img
                    src={srv.image}
                    alt={srv.title}
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
                    <span>{srv.icon}</span>
                    <span>{srv.category}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      color: "var(--color-dark)",
                      marginBottom: "8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {srv.title}
                  </h3>

                  <p
                    style={{
                      color: "var(--color-muted)",
                      fontSize: "0.88rem",
                      lineHeight: "1.55",
                      marginBottom: "18px",
                    }}
                  >
                    {srv.description}
                  </p>

                  {/* Highlights */}
                  <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {srv.benefits.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.82rem",
                          color: "var(--color-dark)",
                        }}
                      >
                        <FiCheckCircle size={14} color="var(--color-primary)" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Metadata Chips */}
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.84rem", color: "var(--color-muted)" }}>
                      <FiClock size={15} color="var(--color-primary)" />
                      <span>{srv.duration}</span>
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        color: "var(--color-primary)",
                      }}
                    >
                      {srv.priceRange}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    onClick={() => navigate("/salons")}
                    style={{
                      width: "100%",
                      padding: "12px 0",
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
                      boxShadow: "0 4px 14px rgba(216, 69, 112, 0.3)",
                      transition: "var(--transition-base)",
                    }}
                  >
                    <span>Find Salons for This Service</span>
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Veloura Guarantee Banner ─── */}
      <section
        style={{
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid var(--color-border)",
          padding: "60px 5%",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "12px" }}>
            Experience the Veloura Difference
          </h2>
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "24px" }}>
            Every salon in the Veloura network is inspected for certified professionals, clean hygienic tools, authentic product usage, and warm hospitality.
          </p>
          <button
            onClick={() => navigate("/salons")}
            style={{
              padding: "14px 32px",
              borderRadius: "var(--radius-ui)",
              backgroundColor: "var(--color-secondary)",
              color: "#FFFFFF",
              border: "none",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(197, 160, 89, 0.35)",
            }}
          >
            Explore All Salons →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;
