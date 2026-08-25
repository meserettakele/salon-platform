import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { salonService } from "../../services/salonService";
import { getImageUrl } from "../../services/api";
import { useDateTime } from "../../context/DateTimeContext";
import * as CommonComponents from "../../components/common/Button";
import * as CardComponents from "../../components/common/Card";
import * as LoaderComponents from "../../components/common/Loader";

const Button = CommonComponents.Button || CommonComponents.default || "button";
const Card = CardComponents.Card || CardComponents.default || "div";
const Loader =
  LoaderComponents.Loader ||
  LoaderComponents.default ||
  (() => (
    <div style={{ textAlign: "center", padding: "60px" }}>Loading...</div>
  ));

export const SalonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { timeFormat, setTimeFormat, formatTime } = useDateTime();

  const [salon, setSalon] = useState(null);
  const [activeTab, setActiveTab] = useState("services");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await salonService.getSalonById(id);

        console.log("PUBLIC SALON DATA:", data);

        setSalon(data);
      } catch (err) {
        console.error("Error fetching salon details:", err);
        setError("Unable to load salon profile details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSalonDetails();
  }, [id]);

  const calculateAverageRating = (reviews = []) => {
    if (!reviews || reviews.length === 0) return null;
    const total = reviews.reduce(
      (acc, rev) => acc + (Number(rev.rating) || 0),
      0,
    );
    return (total / reviews.length).toFixed(1);
  };

  // BOOKING ACTION LOGIC
  const handleCreateAppointment = () => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");

    if (!token) {
      // Unauthenticated: Redirect to login with message
      navigate("/login", {
        state: {
          message:
            "Please log in or register to book an appointment and access your customer dashboard.",
        },
      });
    } else {
      // Authenticated: Direct straight to Customer Dashboard
      navigate("/customer/dashboard");
    }
  };

  if (loading) return <Loader />;

  if (error || !salon) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "60px auto",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <h2>Salon Not Found</h2>
        <p style={{ color: "#666", margin: "16px 0 24px" }}>
          {error || "The salon profile you're looking for doesn't exist."}
        </p>
        <Button
          onClick={() => navigate("/salons")}
          style={{
            padding: "10px 20px",
            background: "var(--color-primary, #e91e63)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Back to Directory
        </Button>
      </div>
    );
  }

  let parsedGallery = [];
  if (salon.gallery) {
    try {
      parsedGallery =
        typeof salon.gallery === "string"
          ? JSON.parse(salon.gallery)
          : salon.gallery;
    } catch (e) {
      console.error("Failed to parse gallery JSON", e);
    }
  }
  const mainImage = salon.logo
    ? getImageUrl(salon.logo)
    : Array.isArray(parsedGallery) && parsedGallery.length > 0
      ? getImageUrl(parsedGallery[0])
      : salon.images?.[0]
        ? getImageUrl(salon.images[0])
        : "";
  const avgRating = calculateAverageRating(salon.reviews);
  const reviewCount = salon.reviews?.length || 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 4%" }}>
      {/* HERO HEADER */}
      <div
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          background: "#111",
          color: "#fff",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "320px",
            width: "100%",
            position: "relative",
            background: "#222",
          }}
        >
          {mainImage ? (
            <img
              src={mainImage}
              alt={salon.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.8,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                fontSize: "3rem",
              }}
            >
              💈
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
              padding: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                {salon.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    style={{
                      background: "var(--color-primary, #e91e63)",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
              <h1
                style={{
                  fontSize: "2.2rem",
                  margin: "0 0 8px 0",
                  fontWeight: "700",
                }}
              >
                {salon.name}
              </h1>
              <p style={{ margin: 0, color: "#ddd", fontSize: "0.95rem" }}>
                📍{" "}
                {salon.address || `${salon.subCity || ""}, ${salon.city || ""}`}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "#ffb400",
                  marginBottom: "4px",
                }}
              >
                {avgRating ? `★ ${avgRating}` : "★ New"}
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "#ccc",
                    fontWeight: "normal",
                    marginLeft: "6px",
                  }}
                >
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ gridColumn: "span 2" }}>
          {/* TABS */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              borderBottom: "2px solid #eee",
              marginBottom: "24px",
              overflowX: "auto",
            }}
          >
            {["services", "hours", "staff", "gallery", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  background: "none",
                  borderBottom:
                    activeTab === tab
                      ? "3px solid var(--color-primary, #e91e63)"
                      : "3px solid transparent",
                  color:
                    activeTab === tab
                      ? "var(--color-primary, #e91e63)"
                      : "#666",
                  fontWeight: activeTab === tab ? "700" : "500",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "16px", color: "var(--color-dark, #111)" }}>
                Services & Pricing
              </h2>
              {salon.services && salon.services.length > 0 ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {salon.services.map((service) => {
                    const serviceImg = getImageUrl(service.image || service.imageUrl);
                    return (
                      <Card
                        key={service.id}
                        style={{
                          padding: "18px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--color-card, #fff)",
                          border: "1px solid var(--color-border, #eee)",
                          borderRadius: "12px",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 280px" }}>
                          {/* Service Image / Icon */}
                          <div
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "12px",
                              overflow: "hidden",
                              flexShrink: 0,
                              backgroundColor: "var(--color-primary-light, rgba(216, 69, 112, 0.08))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--color-border, #eee)",
                            }}
                          >
                            {serviceImg ? (
                              <img
                                src={serviceImg}
                                alt={service.name}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex";
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : null}
                            <span
                              style={{
                                display: serviceImg ? "none" : "flex",
                                fontSize: "1.6rem",
                              }}
                            >
                              💇‍♀️
                            </span>
                          </div>

                          {/* Service Details */}
                          <div style={{ minWidth: 0 }}>
                            <h3
                              style={{
                                margin: "0 0 4px 0",
                                fontSize: "1.1rem",
                                fontWeight: "700",
                                color: "var(--color-dark, #111)",
                              }}
                            >
                              {service.name}
                            </h3>
                            <p
                              style={{
                                margin: "0 0 6px 0",
                                fontSize: "0.85rem",
                                color: "var(--color-muted, #666)",
                                lineHeight: "1.4",
                              }}
                            >
                              {service.description || "Professional beauty service."}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  fontWeight: "600",
                                  color: "var(--color-muted, #888)",
                                  backgroundColor: "var(--color-card-subtle, #f5f5f5)",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                }}
                              >
                                ⏱️ {service.duration} mins
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & Booking */}
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                          <div
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "800",
                              color: "var(--color-primary, #e91e63)",
                            }}
                          >
                            {service.price} ETB
                          </div>
                          <Button
                            size="sm"
                            onClick={handleCreateAppointment}
                            style={{
                              padding: "6px 14px",
                              fontSize: "0.82rem",
                              fontWeight: "700",
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "var(--color-muted, #888)", fontStyle: "italic" }}>
                  No active services listed for this salon.
                </p>
              )}
            </div>
          )}

          {/* BUSINESS HOURS TAB */}
          {activeTab === "hours" && (
            <Card
              style={{
                padding: "24px",
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #eee",
              }}
            >
              {/* Header with Time Preference Switcher */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "20px",
                  paddingBottom: "14px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.3rem", margin: 0, fontWeight: "800", color: "#111827" }}>
                    Business Hours
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#6b7280" }}>
                    Operational schedule for this salon location
                  </p>
                </div>

                {/* Time Preference Switcher */}
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "8px",
                    padding: "2px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setTimeFormat("ETHIOPIAN_12H")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: timeFormat === "ETHIOPIAN_12H" ? "#18181B" : "transparent",
                      color: timeFormat === "ETHIOPIAN_12H" ? "#FFFFFF" : "#6B7280",
                      transition: "all 0.15s ease",
                    }}
                  >
                    🇪🇹 Ethiopian
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat("STANDARD_12H")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: timeFormat === "STANDARD_12H" ? "#18181B" : "transparent",
                      color: timeFormat === "STANDARD_12H" ? "#FFFFFF" : "#6B7280",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ⏰ 12H (AM/PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat("STANDARD_24H")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: timeFormat === "STANDARD_24H" ? "#18181B" : "transparent",
                      color: timeFormat === "STANDARD_24H" ? "#FFFFFF" : "#6B7280",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ⏱️ 24H
                  </button>
                </div>
              </div>

              {salon?.businessHours && salon.businessHours.length > 0 ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  {salon.businessHours.map((hour) => {
                    const dayName = hour.day || hour.dayOfWeek || "";
                    const openTime = hour.openingTime || hour.openTime || "";
                    const closeTime = hour.closingTime || hour.closeTime || "";
                    const isClosed =
                      hour.isClosed === true ||
                      hour.isClosed === 1 ||
                      hour.isClosed === "true";

                    const formattedDay =
                      dayName.charAt(0).toUpperCase() +
                      dayName.slice(1).toLowerCase();

                    const amharicDays = {
                      Monday: "ሰኞ",
                      Tuesday: "ማክሰኞ",
                      Wednesday: "ረቡዕ",
                      Thursday: "ሐሙስ",
                      Friday: "ዓርብ",
                      Saturday: "ቅዳሜ",
                      Sunday: "እሑድ",
                    };
                    const amDay = amharicDays[formattedDay] || "";

                    return (
                      <div
                        key={hour.id || dayName}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #f9fafb",
                          padding: "8px 4px",
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>
                            {formattedDay}
                          </span>
                          {amDay && (
                            <span style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: "600", marginLeft: "6px" }}>
                              ({amDay})
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            color: isClosed ? "#dc2626" : "#374151",
                            fontWeight: isClosed ? "800" : "700",
                            fontSize: "0.9rem",
                            backgroundColor: isClosed ? "#fee2e2" : "transparent",
                            padding: isClosed ? "2px 8px" : "0",
                            borderRadius: "6px",
                          }}
                        >
                          {isClosed ? "Closed (ዝግ ነው)" : `${formatTime(openTime)} – ${formatTime(closeTime)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  Business hours not specified.
                </p>
              )}
            </Card>
          )}
          {/* STAFF TAB */}
          {activeTab === "staff" && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>
                Stylists & Staff
              </h2>
              {salon.employees && salon.employees.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {salon.employees.map((emp) => (
                    <Card
                      key={emp.id}
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        background: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          margin: "0 auto 12px",
                          overflow: "hidden",
                          background: "#f0f0f0",
                        }}
                      >
                        {emp.image ? (
                          <img
                            src={getImageUrl(emp.image)}
                            alt={emp.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{ fontSize: "2rem", lineHeight: "70px" }}
                          >
                            👤
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: "0 0 4px 0" }}>{emp.name}</h4>
                      <p
                        style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}
                      >
                        {emp.position || "Staff"}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  No staff members listed.
                </p>
              )}
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>
                Gallery
              </h2>
              {(Array.isArray(parsedGallery) && parsedGallery.length > 0) ||
              (salon.images && salon.images.length > 0) ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {Array.isArray(parsedGallery) &&
                    parsedGallery.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt="Gallery"
                        style={{
                          width: "100%",
                          height: "160px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ))}
                  {!parsedGallery.length &&
                    salon.images &&
                    salon.images.map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={getImageUrl(img)}
                        alt="Gallery"
                        style={{
                          width: "100%",
                          height: "160px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ))}
                </div>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  No uploaded images.
                </p>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <Card
              style={{
                padding: "24px",
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>
                Customer Reviews
              </h2>
              {salon.reviews && salon.reviews.length > 0 ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {salon.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        paddingBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <strong>
                          {rev.customer?.fullName || "Anonymous Customer"}
                        </strong>
                        <span style={{ color: "#ffb400", fontWeight: "bold" }}>
                          ★ {rev.rating}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          color: "#555",
                          fontSize: "0.9rem",
                        }}
                      >
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  No reviews submitted yet.
                </p>
              )}
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: CONTACT & BOOKING */}
        <div>
          <Card
            style={{
              padding: "24px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eee",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              position: "sticky",
              top: "20px",
            }}
          >
            <h3
              style={{ marginTop: 0, marginBottom: "16px", fontSize: "1.2rem" }}
            >
              Contact Info
            </h3>

            <p
              style={{
                fontSize: "0.9rem",
                color: "#555",
                marginBottom: "12px",
              }}
            >
              📞 <strong>Phone:</strong> {salon.phone || "N/A"}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#555",
                marginBottom: "20px",
              }}
            >
              ✉️ <strong>Email:</strong> {salon.email || "N/A"}
            </p>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #eee",
                margin: "20px 0",
              }}
            />

            <h3
              style={{ marginTop: 0, marginBottom: "12px", fontSize: "1.1rem" }}
            >
              Book Appointment
            </h3>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#777",
                marginBottom: "16px",
              }}
            >
              Click below to proceed to your customer dashboard to select your
              preferred salon, service, and time.
            </p>

            <Button
              onClick={handleCreateAppointment}
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--color-primary, #e91e63)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Create Appointment
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalonDetails;
