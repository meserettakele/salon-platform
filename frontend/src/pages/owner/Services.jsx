// src/pages/owner/Services.jsx
import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiScissors } from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

export const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Direct photo file state for cute uploads
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: 30,
    categoryId: "",
    imageUrl: "",
    assignedEmployeeIds: [],
  });

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const prefix = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
    return `${prefix}/${url}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [servicesRes, categoriesRes, employeesRes] = await Promise.all([
        api.get("/owner/services").catch((err) => {
          console.error("Services fetch error:", err);
          return null;
        }),
        api.get("/owner/categories").catch((err) => {
          console.error("Categories fetch error:", err);
          return null;
        }),
        api.get("/owner/employees").catch((err) => {
          console.error("Employees fetch error:", err);
          return null;
        }),
      ]);

      // 1. EXTRACT SERVICES
      if (servicesRes?.data) {
        console.log("Services raw API response:", servicesRes.data);
        const rawServices =
          servicesRes.data.data ||
          servicesRes.data.services ||
          servicesRes.data;
        setServices(Array.isArray(rawServices) ? rawServices : []);
      }

      // 2. EXTRACT CATEGORIES
      if (categoriesRes?.data) {
        const rawCategories =
          categoriesRes.data.data ||
          categoriesRes.data.categories ||
          categoriesRes.data;
        setCategories(Array.isArray(rawCategories) ? rawCategories : []);
      }

      // 3. EXTRACT EMPLOYEES
      if (employeesRes?.data) {
        console.log("Employees raw API response:", employeesRes.data);
        const rawEmployees =
          employeesRes.data.data ||
          employeesRes.data.employees ||
          employeesRes.data;
        setEmployees(Array.isArray(rawEmployees) ? rawEmployees : []);
      }
    } catch (err) {
      console.error("Failed to load services data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: 30,
      categoryId: categories.length > 0 ? categories[0].id : "",
      imageUrl: "",
      assignedEmployeeIds: [],
    });
    setImageFile(null);
    setImagePreviewUrl("");
    setShowModal(true);
  };

  const handleOpenEditModal = (srv) => {
    // 1. Safely extract ID regardless of property key
    const serviceId = srv.id || srv.serviceId || srv._id;

    console.log("Edit clicked! Captured Service ID:", serviceId); // 👈 Check browser console to confirm it's a number!

    setEditingId(serviceId);

    // 2. Extract employee IDs
    const rawEmployees =
      srv.employees || srv.Employees || srv.assignedEmployees || [];
    const assigned = rawEmployees.map((e) =>
      typeof e === "object" ? e.id || e._id : e,
    );

    const imgUrl = srv.imageUrl || srv.image || "";
    setFormData({
      name: srv.name || "",
      description: srv.description || "",
      price: srv.price || "",
      duration: srv.duration || 30,
      categoryId: srv.categoryId || (categories[0] ? categories[0].id : ""),
      imageUrl: imgUrl,
      assignedEmployeeIds: assigned,
    });
    setImageFile(null);
    setImagePreviewUrl(imgUrl ? getImageUrl(imgUrl) : "");

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Please select a category.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Format employee IDs
      const formattedEmployeeIds = (formData.assignedEmployeeIds || []).map(
        (emp) => (typeof emp === "object" ? emp.id : emp),
      );

      // 2. Build payload
      const payload = {
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration, 10) || 30,
        categoryId: parseInt(formData.categoryId, 10),
        image: formData.imageUrl || formData.image || "",
        employeeIds: formattedEmployeeIds,
      };

      // 3. Extract clean target ID
      const targetId =
        typeof editingId === "object"
          ? editingId?.id || editingId?.serviceId
          : editingId;

      console.log("Executing request with targetId:", targetId);

      let savedService;
      // Make sure targetId exists AND is not literally "undefined"
      if (targetId && targetId !== "undefined") {
        const response = await api.put(`/owner/services/${targetId}`, payload);
        savedService = response.data || response;
      } else {
        const response = await api.post("/owner/services", payload);
        savedService = response.data || response;
      }

      // 4. Upload photo if selected
      const serviceId = targetId || savedService?.id || savedService?.serviceId || savedService?.data?.id || savedService?.data?.serviceId;
      if (imageFile && serviceId) {
        const fileFormData = new FormData();
        fileFormData.append("photo", imageFile);
        await api.put(`/owner/services/${serviceId}/photo`, fileFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Save service error details:", err.response?.data || err);
      alert(err?.response?.data?.message || "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      await api.delete(`/owner/services/${id}`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete service");
    }
  };

  const toggleEmployeeAssignment = (empId) => {
    setFormData((prev) => {
      const exists = prev.assignedEmployeeIds.includes(empId);
      const updated = exists
        ? prev.assignedEmployeeIds.filter((id) => id !== empId)
        : [...prev.assignedEmployeeIds, empId];
      return { ...prev, assignedEmployeeIds: updated };
    });
  };

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
              fontFamily: "Manrope, sans-serif",
            }}
          >
            Salon Services Catalog
          </h1>
          <p
            style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "4px" }}
          >
            Manage offered beauty treatments, pricing in ETB, service duration,
            and assigned specialists.
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <FiPlus /> Add Service
        </Button>
      </div>

      {/* SERVICES TABLE CARD */}
      <Card padding="0" style={{ overflow: "hidden" }}>
        {services.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <FiScissors
              style={{
                fontSize: "2.5rem",
                color: "#d1d5db",
                marginBottom: "12px",
              }}
            />
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No services created yet. Click "+ Add Service" to add your first
              menu item.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#fafafa",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={thStyle}>Image</th>
                  <th style={thStyle}>Service Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Price (ETB)</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Assigned Staff</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((srv) => {
                  const categoryName = srv.category?.name || "Beauty";
                  const assignedStaff = srv.employees || [];

                  return (
                    <tr
                      key={srv.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            backgroundColor: "#fce7f3",
                            color: "#e91e63",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            overflow: "hidden",
                          }}
                        >
                          {srv.imageUrl || srv.image ? (
                            <img
                              src={getImageUrl(srv.imageUrl || srv.image)}
                              alt={srv.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <FiScissors />
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#111827", display: "block" }}>
                          {srv.name}
                        </strong>
                        {srv.description && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            {srv.description}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "8px",
                            backgroundColor: "#f3f4f6",
                            fontSize: "0.72rem",
                            fontWeight: "600",
                          }}
                        >
                          {categoryName}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#059669" }}>
                          {srv.price} ETB
                        </strong>
                      </td>
                      <td style={tdStyle}>⏱️ {srv.duration} mins</td>
                      <td style={tdStyle}>
                        {assignedStaff.length === 0 ? (
                          <span
                            style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                          >
                            All Staff
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                            }}
                          >
                            {assignedStaff.map((emp) => (
                              <span
                                key={emp.id}
                                style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "#eff6ff",
                                  color: "#2563eb",
                                  padding: "2px 6px",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                {emp.name || emp.fullName}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleOpenEditModal(srv)}
                            style={actionBtnStyle}
                            title="Edit Service"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(srv.id)}
                            style={{ ...actionBtnStyle, color: "#dc2626" }}
                            title="Delete Service"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
                {editingId ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* CUTE IMAGE PICKER AT THE TOP */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 0 15px 0",
                  borderBottom: "1px dashed #f5d0e3",
                  marginBottom: "8px"
                }}
              >
                <label
                  style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid #fce7f3",
                    boxShadow: "0 8px 20px rgba(233, 30, 99, 0.12)",
                    backgroundColor: "#fdf2f8",
                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05) rotate(2deg)";
                    e.currentTarget.style.borderColor = "#e91e63";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor = "#fce7f3";
                  }}
                >
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Service Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#e91e63" }}>
                      <FiScissors style={{ fontSize: "1.8rem", marginBottom: "4px" }} />
                      <span style={{ fontSize: "0.65rem", fontWeight: "800", letterSpacing: "0.5px" }}>ADD PHOTO</span>
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(233, 30, 99, 0.8)",
                      color: "#ffffff",
                      fontSize: "0.6rem",
                      fontWeight: "700",
                      textAlign: "center",
                      padding: "2px 0",
                    }}
                  >
                    SELECT
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#e91e63",
                    fontWeight: "600",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  📸 Tap circle to upload service image
                </span>
              </div>

              {/* SERVICE NAME */}
              <Input
                label="🌸 Service Name"
                required
                placeholder="e.g. Silk Press, Balayage, Manicure..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{
                  borderRadius: "12px",
                  padding: "12px 16px"
                }}
              />

              {/* PRICE & DURATION GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <Input
                  label="💵 Price (ETB)"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 450"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
                <Input
                  label="⏱️ Duration (minutes)"
                  type="number"
                  required
                  placeholder="e.g. 60"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
              </div>

              {/* CATEGORY SELECTOR */}
              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  📂 Category
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontSize: "0.95rem"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e91e63"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                >
                  <option value="">Select Category</option>
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      No categories found in database
                    </option>
                  )}
                </select>
              </div>

              {/* DESCRIPTION */}
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
                  📝 Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe treatment procedures & special details..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.92rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e91e63"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              {/* ASSIGNED EMPLOYEES CHECKBOX LIST */}
              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  👥 Assign Staff Specialists
                </label>
                {employees.length === 0 ? (
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    No employees added yet.
                  </span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      backgroundColor: "#fdfbf7",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid #eae8e4"
                    }}
                  >
                    {employees.map((emp) => {
                      const isSelected = formData.assignedEmployeeIds.includes(
                        emp.id,
                      );
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleEmployeeAssignment(emp.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            border: isSelected
                              ? "1px solid #e91e63"
                              : "1px solid #eae8e4",
                            backgroundColor: isSelected ? "#fce7f3" : "#ffffff",
                            color: isSelected ? "#e91e63" : "#4b5563",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 2px 6px rgba(233,30,99,0.1)" : "none",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = "#d4af37";
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = "#eae8e4";
                          }}
                        >
                          {isSelected ? "✨ " : "+ "} {emp.name || emp.fullName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sticky bottom buttons so they never get hidden */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "12px",
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "#ffffff",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px 16px",
  color: "#4b5563",
  fontWeight: "700",
  fontSize: "0.78rem",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 16px",
  color: "#111827",
};

const actionBtnStyle = {
  padding: "6px",
  backgroundColor: "#f3f4f6",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  color: "#374151",
  fontSize: "0.9rem",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "16px",
};

// FIXED: Added max-height + overflowY so the modal content can scroll cleanly
const modalContent = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "480px",
  width: "100%",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

export default Services;
