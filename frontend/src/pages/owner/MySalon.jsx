// src/pages/owner/MySalon.jsx
import { useState, useEffect, useRef } from "react";
import {
  FiUpload,
  FiImage,
  FiSave,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTag,
  FiX,
} from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import api from "../../services/api";
const IMAGE_BASE_URL = "http://localhost:5000/";
export const MySalon = () => {
  const getImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith("http")) return url;

    return `http://localhost:5000/${url}`;
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [message, setMessage] = useState(null);

  const [categoriesList, setCategoriesList] = useState([]);

  const [salon, setSalon] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    logoUrl: "",
    coverImageUrl: "",
    gallery: [],
    categories: [], // Array of category IDs or objects
  });

  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    fetchSalonData();
  }, []);

  const fetchSalonData = async () => {
    try {
      setLoading(true);
      const [salonRes, categoriesRes] = await Promise.all([
        api.get("/owner/salon").catch(() => null),
        api.get("/owner/categories").catch(() => null),
      ]);

      if (salonRes?.data) {
        const data = salonRes.data.data || salonRes.data.salon || salonRes.data;

        // Map initial categories (supports array of IDs or array of objects with id)
        const selectedCategories = (data.categories || []).map((cat) =>
          typeof cat === "object" ? cat.id : cat,
        );

        setSalon({
          name: data.name || "",
          description: data.description || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          logoUrl: data.logoUrl || data.logo || "",
          coverImageUrl: data.coverImageUrl || data.coverImage || "",
          gallery: Array.isArray(data.gallery)
            ? data.gallery
            : data.images || [],
          categories: selectedCategories,
        });
      }

      if (categoriesRes?.data) {
        const catList = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.data || [];
        setCategoriesList(catList);
      }
    } catch (err) {
      console.error("Failed to load salon details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Category selection
  const handleCategoryToggle = (categoryId) => {
    setSalon((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      const updatedCategories = isSelected
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];

      return { ...prev, categories: updatedCategories };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Correct REST payload including categories and current media
      await api.put("/owner/salon", {
        name: salon.name,
        description: salon.description,
        phone: salon.phone,
        email: salon.email,
        address: salon.address,
        city: salon.city,
        logoUrl: salon.logoUrl,
        coverImageUrl: salon.coverImageUrl,
        gallery: salon.gallery,
        categories: salon.categories, // Send category IDs to backend
      });

      setMessage({
        type: "success",
        text: "Salon information updated successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update salon profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await api.put("/owner/salon/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const logoUrl =
        res.data?.data?.logo ||
        res.data?.data?.logoUrl ||
        res.data?.logo ||
        res.data?.logoUrl;

      if (!logoUrl) {
        throw new Error("Logo path not returned from server");
      }

      setSalon((prev) => ({
        ...prev,
        logoUrl: logoUrl,
      }));

      setMessage({
        type: "success",
        text: "Salon logo uploaded successfully!",
      });
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    const formData = new FormData();
    formData.append("gallery", file);

    try {
      const res = await api.post("/owner/salon/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("FULL RESPONSE:", res);
      console.log("FULL GALLERY RESPONSE:", res.data);
      const updatedSalon = res.data;

      console.log("UPDATED SALON:", updatedSalon);
      console.log("UPDATED GALLERY:", updatedSalon.gallery);

      setSalon((prev) => ({
        ...prev,
        gallery: (updatedSalon.gallery || []).filter(Boolean),
      }));

      setMessage({
        type: "success",
        text: "Gallery image uploaded successfully!",
      });
    } catch (err) {
      alert("Failed to upload gallery image.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = async (img, index) => {
    console.log("IMAGE TO DELETE:", img);
    try {
      await api.delete("/owner/salon/gallery", {
        data: {
          imagePath: img,
        },
      });

      setSalon((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((_, idx) => idx !== index),
      }));

      setMessage({
        type: "success",
        text: "Gallery image deleted successfully!",
      });
    } catch (err) {
      console.error("Delete gallery error:", err.response?.data || err);
      setMessage({
        type: "error",
        text: "Failed to delete gallery image.",
      });
    }
  };
  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            color: "#111827",
            margin: 0,
            fontFamily: "Manrope, sans-serif",
          }}
        >
          My Salon Profile
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "4px" }}>
          Manage your salon brand identity, basic contact details, logo,
          categories, and photo gallery.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "0.88rem",
            fontWeight: "600",
            backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
            color: message.type === "success" ? "#15803d" : "#b91c1c",
            border:
              message.type === "success"
                ? "1px solid #bbf7d0"
                : "1px solid #fecaca",
          }}
        >
          {message.text}
        </div>
      )}

      {/* 1. MEDIA BANNER & LOGO SECTION */}
      <Card style={{ padding: "24px", marginBottom: "28px" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            color: "#111827",
            margin: "0 0 16px 0",
          }}
        >
          Brand Media & Imagery
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {/* Logo Container */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "20px",
                backgroundColor: "#fce7f3",
                color: "#e91e63",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "2rem",
                overflow: "hidden",
                margin: "0 auto 12px auto",
                border: "2px dashed #f472b6",
              }}
            >
              {salon.logoUrl ? (
                <img
                  src={getImageUrl(salon.logoUrl)}
                  alt="Salon Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : salon.name ? (
                salon.name.charAt(0).toUpperCase()
              ) : (
                "S"
              )}
            </div>

            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              style={{ fontSize: "0.78rem", padding: "6px 12px" }}
            >
              <FiUpload /> {uploadingLogo ? "Uploading..." : "Upload Logo"}
            </Button>
          </div>

          {/* Gallery Section */}
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "#374151",
                }}
              >
                Gallery Showcase
              </span>
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                style={{
                  fontSize: "0.78rem",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#e91e63",
                }}
              >
                + Add Photo
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                paddingBottom: "8px",
              }}
            >
              {salon.gallery.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#fafafa",
                    borderRadius: "10px",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                  }}
                >
                  No showcase gallery images uploaded yet.
                </div>
              ) : (
                salon.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid #e5e7eb",
                      position: "relative",
                    }}
                  >
                    {img && (
                      <img
                        src={getImageUrl(img)}
                        alt={`Gallery ${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <button
                      type="button"
                      disabled={!img}
                      onClick={() => handleRemoveGalleryImage(img, idx)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: "rgba(220,38,38,0.9)",
                        color: "white",
                        display: img ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 20,
                        padding: 0,
                      }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. BASIC INFORMATION FORM */}
      <Card style={{ padding: "24px" }}>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: "#111827",
              margin: "0 0 8px 0",
            }}
          >
            Basic Salon Details
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <Input
              label="Salon Name"
              required
              value={salon.name}
              onChange={(e) => setSalon({ ...salon, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              required
              value={salon.phone}
              onChange={(e) => setSalon({ ...salon, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={salon.email}
              onChange={(e) => setSalon({ ...salon, email: e.target.value })}
            />
            <Input
              label="City"
              required
              value={salon.city}
              onChange={(e) => setSalon({ ...salon, city: e.target.value })}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Full Address
            </label>
            <textarea
              rows={2}
              placeholder="Building, street, neighborhood..."
              value={salon.address}
              onChange={(e) => setSalon({ ...salon, address: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontFamily: "sans-serif",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Description & Specializations
            </label>
            <textarea
              rows={4}
              placeholder="Tell customers about your salon services and luxury experience..."
              value={salon.description}
              onChange={(e) =>
                setSalon({ ...salon, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontFamily: "sans-serif",
              }}
            />
          </div>

          {/* Clickable Categories Selection */}
          {categoriesList.length > 0 && (
            <div>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Select Salon Categories (Click to toggle)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {categoriesList.map((cat) => {
                  const isSelected = salon.categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      style={{
                        fontSize: "0.78rem",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: isSelected
                          ? "1px solid #e91e63"
                          : "1px solid #e5e7eb",
                        backgroundColor: isSelected ? "#e91e63" : "#f3f4f6",
                        color: isSelected ? "#ffffff" : "#374151",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>🏷️ {cat.name}</span>
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button type="submit" disabled={saving}>
              <FiSave /> {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MySalon;
