// src/pages/admin/CategoriesManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";

// Centralized UI Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State (Handles both Add & Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch Categories from Backend API (Updated to hit /admin/categories)
  // Fetch Categories with full response structure detection and logging
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin/categories");

      // 🔍 Open Browser Console (F12) to inspect this output!
      console.log("📦 Categories API Response:", res.data);

      // Extract array from any possible structure returned by Sequelize/Express
      const rawData = res.data;
      const categoriesArray = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(rawData?.data?.categories)
            ? rawData.data.categories
            : Array.isArray(rawData?.categories)
              ? rawData.categories
              : Array.isArray(rawData?.rows)
                ? rawData.rows // Sequelize findAndCountAll returns { rows, count }
                : [];

      console.log("Parsed Categories Array:", categoriesArray);
      setCategories(categoriesArray);
    } catch (err) {
      console.error("❌ Fetch Categories Error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  // Open Modal for Creating Category
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  // Open Modal for Editing Category
  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    setShowModal(true);
  };

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update Category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        // Update Category: PUT /admin/categories/:id
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
        alert("Category updated successfully!");
      } else {
        // Create Category: POST /admin/categories
        await api.post("/admin/categories", formData);
        alert("Category created successfully!");
      }

      setShowModal(false);
      fetchCategories(); // Re-fetch to update list
    } catch (err) {
      console.error("❌ Category Save Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async (categoryId, categoryName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${categoryName}"? Salons linked to this category may be affected.`,
      )
    ) {
      return;
    }

    try {
      // Delete Category: DELETE /admin/categories/:id
      await api.delete(`/admin/categories/${categoryId}`);
      alert("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category.");
    }
  };

  // Filter Categories by Search Term
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "1200px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ flex: "1 1 280px" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
            }}
          >
            🏷️ Service Categories
          </h1>
          <p
            style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}
          >
            Organize service offerings across all salons (Hair, Makeup, Nails,
            Spa, etc.).
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          style={{ width: "auto", whiteSpace: "nowrap" }}
        >
          ➕ Add Category
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* SEARCH BAR CARD */}
      <Card style={{ marginBottom: "20px", padding: "16px" }}>
        <Input
          placeholder="🔍 Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* CATEGORIES TABLE LISTING */}
      {loading ? (
        <Loader />
      ) : filteredCategories.length === 0 ? (
        <Card
          style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
        >
          No categories found. Click <strong>"➕ Add Category"</strong> above to
          create one.
        </Card>
      ) : (
        <Card padding="0" style={{ overflow: "hidden" }}>
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "500px",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={thStyle}>Category Name</th>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={tdStyle}>
                      <strong>{category.name}</strong>
                    </td>
                    <td style={{ ...tdStyle, color: "#4b5563" }}>
                      {category.description || "—"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleOpenEditModal(category)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          size="small"
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            borderColor: "#ef4444",
                          }}
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={modalBackdropStyle}>
          <div
            style={{ ...modalContentStyle, maxWidth: "500px", width: "92%" }}
          >
            <h2 style={{ marginTop: 0, fontSize: "1.2rem", color: "#111827" }}>
              {editingCategory ? "✏️ Edit Category" : "➕ Add Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Input
                  label="Category Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Hair, Makeup, Nails, Spa"
                  required
                />
                <Input
                  label="Description (Optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description of services..."
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingCategory
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Component Styles
const thStyle = {
  padding: "12px 16px",
  color: "#4b5563",
  fontWeight: "600",
  whiteSpace: "nowrap",
};
const tdStyle = { padding: "12px 16px", color: "#111827" };

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "16px",
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  maxHeight: "85vh",
  overflowY: "auto",
};

export default CategoriesManagement;
