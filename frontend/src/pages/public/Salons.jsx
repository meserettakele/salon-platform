import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as CardComponents from "../../components/common/Card";
import * as InputComponents from "../../components/common/Input";
import * as LoaderComponents from "../../components/common/Loader";
import { salonService } from "../../services/salonService";
import { getImageUrl } from "../../services/api";

const Card = CardComponents.Card || CardComponents.default || "div";
const Input = InputComponents.Input || InputComponents.default || "input";
const Loader =
  LoaderComponents.Loader ||
  LoaderComponents.default ||
  (() => (
    <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
  ));

export const Salons = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || "All",
  );
  const [subCity, setSubCity] = useState("");

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const res = await salonService.getCategories();
        setCategories(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error(
          "Could not load lookup categories from server context",
          err,
        );
      }
    };
    fetchCategoriesData();
  }, []);

  useEffect(() => {
    const loadSalons = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = {};
        if (search.trim()) queryParams.search = search.trim();
        if (categoryId && categoryId !== "All")
          queryParams.categoryId = categoryId;
        if (subCity.trim()) queryParams.location = subCity.trim();

        const response = await salonService.getAllSalons(queryParams);
        setSalons(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Failed loading salons:", err);
        setError(
          "Failed to securely synchronize records with the live instance.",
        );
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => loadSalons(), 300);
    return () => clearTimeout(debounceTimer);
  }, [search, categoryId, subCity]);

  const handleCategoryClick = (id) => {
    setCategoryId(id);
    if (id === "All") {
      searchParams.delete("categoryId");
    } else {
      searchParams.set("categoryId", id);
    }
    setSearchParams(searchParams);
  };

  const handleClear = () => {
    setSearch("");
    setSubCity("");
    setCategoryId("All");
    setSearchParams({});
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4%" }}>
      {/* FILTER SEARCH PANEL */}
      <div
        className="glass-panel"
        style={{
          padding: "32px",
          borderRadius: "8px",
          marginBottom: "40px",
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "var(--color-muted)",
                display: "block",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Search Salon
            </label>
            <Input
              placeholder="Enter salon name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "var(--color-muted)",
                display: "block",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Sub-City Zone
            </label>
            <Input
              placeholder="Enter sub-city..."
              value={subCity}
              onChange={(e) => setSubCity(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
        </div>

        {(search || subCity || categoryId !== "All") && (
          <div style={{ marginBottom: "20px", textAlign: "right" }}>
            <button
              onClick={handleClear}
              style={{
                padding: "6px 14px",
                fontSize: "0.8rem",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                cursor: "pointer",
                color: "var(--color-muted)",
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* CATEGORY FILTER BUTTONS */}
        {categories.length > 0 && (
          <div>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "var(--color-muted)",
                display: "block",
                marginBottom: "12px",
                textTransform: "uppercase",
              }}
            >
              Categories
            </label>
            <div
              className="no-scrollbar"
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "8px",
              }}
            >
              <button
                onClick={() => handleCategoryClick("All")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  background:
                    categoryId === "All"
                      ? "var(--color-primary, #e91e63)"
                      : "var(--color-card)",
                  color: categoryId === "All" ? "#FFFFFF" : "var(--color-dark)",
                  border: "1px solid var(--color-border)",
                  cursor: "pointer",
                }}
              >
                All Services
              </button>
              {categories.map((cat) => {
                const active = String(categoryId) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      background: active
                        ? "var(--color-primary, #e91e63)"
                        : "var(--color-card)",
                      color: active ? "#FFFFFF" : "var(--color-dark)",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SALON CARDS GRID */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--color-error, red)",
          }}
        >
          {error}
        </div>
      ) : salons.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--color-muted)" }}>
          No salons matched your search metrics.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "32px",
          }}
        >
          {salons.map((salon) => {
            let parsedGallery = [];
            if (salon.gallery) {
              try {
                parsedGallery = typeof salon.gallery === "string"
                  ? JSON.parse(salon.gallery)
                  : salon.gallery;
              } catch (e) {
                console.error("Failed to parse gallery JSON", e);
              }
            }
            const coverImage = salon.logo
              ? getImageUrl(salon.logo)
              : (Array.isArray(parsedGallery) && parsedGallery.length > 0
                ? getImageUrl(parsedGallery[0])
                : (salon.images?.[0] ? getImageUrl(salon.images[0]) : ""));

            return (
              <Card
                key={salon.id}
                onClick={() => navigate(`/salons/${salon.id}`)}
                style={{
                  padding: "0px",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "var(--color-card, #fff)",
                  border: "1px solid var(--color-border, #eee)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  transition: "transform 0.2s ease",
                }}
              >
                {/* SALON COVER IMAGE */}
                <div
                  style={{
                    height: "210px",
                    overflow: "hidden",
                    background: "var(--color-border, #f0f0f0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={salon.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "2.5rem" }}>💈</span>
                  )}
                  {/* Rating Badge Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(0,0,0,0.75)",
                      color: "#ffb400",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    ★ {salon.rating ? Number(salon.rating).toFixed(1) : "4.8"}
                  </div>
                </div>

                {/* CARD BODY DETAILS */}
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px 0" }}>
                    {salon.name}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-muted, #666)",
                      margin: "0 0 12px 0",
                    }}
                  >
                    📍{" "}
                    {salon.subCity
                      ? `${salon.subCity}, ${salon.city}`
                      : salon.address || "Location unavailable"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: "16px",
                    }}
                  >
                    <span>🟢 Open Today</span>
                    <span>📞 {salon.phone || "+251 91 123 4567"}</span>
                  </div>

                  {/* FOOTER: CATEGORY BADGE & CTA */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--color-border, #eee)",
                      paddingTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "var(--color-primary, #e91e63)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {salon.categories?.[0]?.name || "HAIR & STYLING"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        color: "#222",
                      }}
                    >
                      View Details →
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Salons;
