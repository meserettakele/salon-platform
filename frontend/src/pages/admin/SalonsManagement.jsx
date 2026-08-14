// src/pages/admin/SalonsManagement.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

// Centralized UI Components
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const SalonsManagement = () => {
  const location = useLocation();

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, APPROVED/ACTIVE, PENDING, SUSPENDED

  // Modal State for Registering New Salon
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Salon Info (phone & email reused from owner below)
    salonName: "",
    address: "",
    city: "",
    subCity: "",
    country: "Ethiopia",
    description: "",
    // Owner Info — these also serve as the salon's contact details
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
  });

  // Auto-open modal when navigated from Dashboard "Register Salon" quick action
  useEffect(() => {
    if (location.state?.openModal) {
      setShowAddModal(true);
      // Clear the state so it doesn't re-open on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch Salons
  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/salons");
      setSalons(res?.data?.data || res?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load salons list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create Owner Account -> Create Salon Shell -> Assign Owner to Salon
  const handleRegisterSalon = async (e) => {
    e.preventDefault();

    if (!formData.password || formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Register Owner Account (validateOwnerCreate)
      const ownerRes = await api.post("/admin/owners", {
        fullName: formData.ownerName,
        phone: formData.ownerPhone,
        email: formData.ownerEmail,
        password: formData.password,
      });

      const createdOwnerId = ownerRes?.data?.data?.id || ownerRes?.data?.id;

      // Step 2: Register Salon — reuse owner phone & email as salon contact
      const salonRes = await api.post("/admin/salons", {
        name: formData.salonName,
        phone: formData.ownerPhone,
        email: formData.ownerEmail,
        country: formData.country,
        city: formData.city,
        subCity: formData.subCity,
        address: formData.address,
        description: formData.description || "N/A",
      });

      const createdSalonId = salonRes?.data?.data?.id || salonRes?.data?.id;

      // Step 3: Assign Owner to Salon (validateAssignOwner)
      if (createdSalonId && createdOwnerId) {
        await api.post("/admin/salons/assign-owner", {
          salonId: createdSalonId,
          ownerId: createdOwnerId,
        });
      }

      alert("Salon and Owner account registered and linked successfully!");
      setShowAddModal(false);
      setFormData({
        salonName: "",
        address: "",
        city: "",
        subCity: "",
        country: "Ethiopia",
        description: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        password: "",
      });
      fetchSalons();
    } catch (err) {
      console.error(
        "❌ Register Salon Error Details:",
        err.response?.data || err,
      );
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      alert(
        backendMessage ||
          "Failed to register salon. Check console for details.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Action: Approve ("ACTIVE") / Suspend ("SUSPENDED")
  const handleStatusChange = async (salonId, newStatus) => {
    const displayStatus =
      newStatus === "ACTIVE" ? "APPROVED / ACTIVE" : newStatus;
    if (
      !window.confirm(
        `Are you sure you want to mark this salon as ${displayStatus}?`,
      )
    )
      return;
    try {
      // ✅ SENDS "ACTIVE", "SUSPENDED", or "PENDING"
      await api.patch(`/admin/salons/${salonId}/status`, { status: newStatus });
      fetchSalons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Filter Logic
  const filteredSalons = salons.filter((salon) => {
    const matchesSearch =
      salon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const rawStatus = (salon.status || "ACTIVE").toUpperCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      rawStatus === statusFilter ||
      (statusFilter === "APPROVED" && rawStatus === "ACTIVE");

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
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
              fontWeight: "700",
              color: "#111827",
              margin: 0,
            }}
          >
            🏢 Salons Management
          </h1>
          <p
            style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "4px" }}
          >
            Approve, manage, or onboard new salon partners.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          ➕ Register New Salon
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* SEARCH AND FILTERS CARD */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: "250px" }}>
            <Input
              placeholder="🔍 Search by salon name, owner, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "APPROVED", "PENDING", "SUSPENDED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  borderRadius: "20px",
                  border:
                    statusFilter === status ? "none" : "1px solid #e5e7eb",
                  backgroundColor:
                    statusFilter === status ? "#db2777" : "#ffffff",
                  color: statusFilter === status ? "#ffffff" : "#4b5563",
                  cursor: "pointer",
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* TABLE LISTING */}
      {loading ? (
        <Loader />
      ) : filteredSalons.length === 0 ? (
        <Card
          style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
        >
          No salons found matching your criteria.
        </Card>
      ) : (
        <Card padding="0">
          <table
            style={{
              width: "100%",
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
                <th style={thStyle}>Salon</th>
                <th style={thStyle}>Owner</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalons.map((salon) => {
                const status = (salon.status || "PENDING").toUpperCase();
                return (
                  <tr
                    key={salon.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={tdStyle}>
                      <strong>{salon.name}</strong>
                    </td>
                    <td style={tdStyle}>
                      {salon.ownerName || salon.owner?.fullName || "N/A"}
                    </td>
                    <td style={tdStyle}>{salon.city || "N/A"}</td>
                    <td style={tdStyle}>{salon.phone || "N/A"}</td>
                    <td style={tdStyle}>
                      <span style={getStatusBadgeStyle(status)}>{status}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        {status === "PENDING" && (
                          <Button
                            size="small"
                            onClick={
                              () => handleStatusChange(salon.id, "ACTIVE") // ✅ Fix: Send "ACTIVE" instead of "APPROVED"
                            }
                          >
                            Approve
                          </Button>
                        )}
                        {(status === "ACTIVE" || status === "APPROVED") && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              handleStatusChange(salon.id, "SUSPENDED")
                            }
                          >
                            Suspend
                          </Button>
                        )}
                        {status === "SUSPENDED" && (
                          <Button
                            size="small"
                            onClick={
                              () => handleStatusChange(salon.id, "ACTIVE") // ✅ Fix: Send "ACTIVE" instead of "APPROVED"
                            }
                          >
                            Re-activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* REGISTER NEW SALON MODAL */}
      {showAddModal && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "650px" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#111827" }}>
              Register New Salon
            </h2>
            <form onSubmit={handleRegisterSalon}>
              <h4 style={sectionHeaderStyle}>🏢 Salon Information</h4>
              <div style={formGridStyle}>
                <Input
                  label="Salon Name"
                  name="salonName"
                  value={formData.salonName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Sub-City"
                  name="subCity"
                  value={formData.subCity}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <p style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "4px", marginBottom: 0 }}>
                📞 The owner's phone &amp; email below will also be used as the salon's contact details.
              </p>

              <h4 style={sectionHeaderStyle}>👤 Owner Account Information</h4>
              <div style={formGridStyle}>
                <Input
                  label="Owner Full Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Owner Email"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Owner Phone (Login)"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Password (min 6 characters)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
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
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Create Salon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const thStyle = { padding: "12px 16px", color: "#4b5563", fontWeight: "600" };
const tdStyle = { padding: "12px 16px", color: "#111827" };
const sectionHeaderStyle = {
  fontSize: "0.9rem",
  color: "#db2777",
  margin: "16px 0 8px 0",
  borderBottom: "1px solid #f3f4f6",
  paddingBottom: "4px",
};
const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};
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
};
const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "12px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
};

const getStatusBadgeStyle = (status) => {
  const base = {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.7rem",
    fontWeight: "600",
  };
  if (status === "ACTIVE" || status === "APPROVED")
    return { ...base, backgroundColor: "#dcfce7", color: "#15803d" };
  if (status === "SUSPENDED")
    return { ...base, backgroundColor: "#fee2e2", color: "#b91c1c" };
  return { ...base, backgroundColor: "#fef3c7", color: "#b45309" };
};

export default SalonsManagement;
