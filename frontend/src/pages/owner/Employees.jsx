// src/pages/owner/Employees.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiChevronDown, FiChevronUp, FiDollarSign } from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

export const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Expandable activity row
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);

  // Direct image file state for cute profile uploads
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const prefix = import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "");
    return `${prefix}/${url}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    gender: "Female",
    position: "",
    specialization: "",
    experience: "1",
    phone: "",
    email: "",
    biography: "",
    photoUrl: "",
    status: "ACTIVE",
    serviceIds: [],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [empRes, srvRes, txnRes] = await Promise.all([
        api.get("/owner/employees"),
        api.get("/owner/services").catch(() => ({ data: [] })),
        api.get("/owner/transactions").catch(() => ({ data: null })),
      ]);

      const empList = Array.isArray(empRes?.data)
        ? empRes.data
        : empRes?.data?.data || empRes?.data?.employees || [];

      const srvList = Array.isArray(srvRes?.data)
        ? srvRes.data
        : srvRes?.data?.data || srvRes?.data?.services || [];

      const txnList = txnRes?.data?.transactions || txnRes?.data?.data || [];

      setEmployees(empList);
      setAvailableServices(srvList);
      setAllTransactions(txnList);
    } catch (err) {
      console.error("Error loading employees/services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/owner/employees");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || res?.data?.employees || [];
      setEmployees(list);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    const defaultSpec = availableServices[0]?.name || "hair stylist";
    setFormData({
      name: "",
      gender: "Female",
      position: defaultSpec,
      specialization: defaultSpec,
      experience: "1",
      phone: "",
      email: "",
      biography: "",
      photoUrl: "",
      status: "ACTIVE",
      serviceIds: availableServices[0] ? [availableServices[0].id] : [],
    });
    setImageFile(null);
    setImagePreviewUrl("");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingId(emp.id);

    const rawServices = emp.services || emp.Services || [];
    const currentServiceIds = rawServices.map((s) =>
      typeof s === "object" ? s.id : s,
    );
    const empSpec =
      emp.specialization ||
      emp.position ||
      availableServices[0]?.name ||
      "hair stylist";
    const expVal =
      emp.experience !== undefined && emp.experience !== null
        ? String(emp.experience)
        : emp.experienceYears !== undefined && emp.experienceYears !== null
          ? String(emp.experienceYears)
          : "1";

    const imgUrl = emp.image || emp.photoUrl || "";
    setFormData({
      name: emp.name || emp.fullName || "",
      gender: emp.gender || "Female",
      position: empSpec,
      specialization: empSpec,
      experience: expVal,
      phone: emp.phone || "",
      email: emp.email || "",
      biography: emp.biography || emp.bio || "",
      photoUrl: imgUrl,
      // Convert isAvailable (boolean) back to status string for the form select
      status: emp.isAvailable === false ? "INACTIVE" : "ACTIVE",
      serviceIds: currentServiceIds,
    });
    setImageFile(null);
    setImagePreviewUrl(imgUrl ? getImageUrl(imgUrl) : "");
    setShowFormModal(true);
  };

  const handleServiceCheckbox = (serviceId) => {
    setFormData((prev) => {
      const exists = prev.serviceIds.includes(serviceId);
      if (exists) {
        return {
          ...prev,
          serviceIds: prev.serviceIds.filter((id) => id !== serviceId),
        };
      } else {
        return { ...prev, serviceIds: [...prev.serviceIds, serviceId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const specValue =
        formData.specialization || formData.position || "Specialist";

      const expNum = parseInt(formData.experience, 10) || 0;

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),

        position: formData.position || specValue,
        specialization: specValue,
        experienceYears: expNum,

        // Backend uses isAvailable boolean — not status string
        isAvailable: formData.status === "ACTIVE",
      };

      // Only include email if provided (optional on Employee model via userAccount)
      if (formData.email && formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      let targetEmployeeId = editingId;

      // ==============================
      // UPDATE
      // ==============================
      if (editingId) {
        const response = await api.put(
          `/owner/employees/${editingId}`,
          payload,
        );

        console.log("Employee updated:", response.data);
      }

      // ==============================
      // CREATE
      // ==============================
      else {
        const response = await api.post("/owner/employees", payload);

        console.log("Employee created:", response.data);

        // IMPORTANT:
        // Backend returns:
        // data: {
        //   employee: {...},
        //   account: {...}
        // }

        targetEmployeeId =
          response?.data?.data?.employee?.id ||
          response?.data?.employee?.id ||
          response?.data?.data?.id;

        // Show temporary password if backend generated one
        const temporaryPassword =
          response?.data?.data?.account?.temporaryPassword;

        if (temporaryPassword) {
          alert(
            `Employee created successfully!\n\n` +
              `Login phone: ${formData.phone}\n` +
              `Temporary password: ${temporaryPassword}\n\n` +
              `Please give these login details to the employee.`,
          );
        }
      }

      // ==============================
      // UPLOAD PROFILE PHOTO IF SELECTED
      // ==============================
      if (imageFile && targetEmployeeId) {
        const fileFormData = new FormData();
        fileFormData.append("photo", imageFile);
        await api.put(`/owner/employees/${targetEmployeeId}/photo`, fileFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // ==============================
      // ASSIGN SERVICES
      // ==============================
      if (targetEmployeeId && formData.serviceIds.length > 0) {
        try {
          await api.put(`/owner/employees/${targetEmployeeId}/services`, {
            serviceIds: formData.serviceIds,
          });
        } catch (serviceErr) {
          console.error(
            "Service assignment failed:",
            serviceErr?.response?.data || serviceErr,
          );
        }
      }

      setShowFormModal(false);

      await fetchEmployees();
    } catch (err) {
      console.error("Employee save error:", err?.response?.data || err);

      alert(err?.response?.data?.message || "Failed to save employee.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?"))
      return;
    try {
      await api.delete(`/owner/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert("Failed to delete employee");
    }
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
            Employees Roster
          </h1>
          <p
            style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "4px" }}
          >
            Manage staff details, experience, specialization, and assigned
            services.
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <FiPlus /> Add Employee
        </Button>
      </div>

      {/* EMPLOYEES TABLE */}
      <Card padding="0" style={{ overflow: "hidden" }}>
        {employees.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No employee records found. Click "+ Add Employee" to create one.
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
                  <th style={thStyle}>Photo</th>
                  <th style={thStyle}>Name & Exp</th>
                  <th style={thStyle}>Specialization</th>
                  <th style={thStyle}>Assigned Services</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const empName = emp.name || emp.fullName || "Staff Member";
                  // Backend stores isAvailable (boolean), not status (string)
                  const isActive = emp.isAvailable !== false; // default true if undefined
                  const statusLabel = isActive ? "ACTIVE" : "INACTIVE";
                  const empServices = emp.services || emp.Services || [];
                  const expValue = emp.experienceYears ?? emp.experience ?? 0;

                  return (
                    <React.Fragment key={emp.id}>
                    <tr
                      onClick={() =>
                        setExpandedEmployeeId(
                          expandedEmployeeId === emp.id ? null : emp.id
                        )
                      }
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        backgroundColor: expandedEmployeeId === emp.id ? "#fff5f8" : "transparent",
                      }}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            backgroundColor: "#fce7f3",
                            color: "#e91e63",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.9rem",
                            overflow: "hidden",
                          }}
                        >
                          {emp.image || emp.photoUrl ? (
                            <img
                              src={getImageUrl(emp.image || emp.photoUrl)}
                              alt={empName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            empName.charAt(0).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#111827", display: "block" }}>
                          {empName}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {expValue} yrs exp
                        </span>
                      </td>

                      {/* Specialization */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "600", color: "#374151" }}>
                          {emp.specialization || emp.position || "Specialist"}
                        </span>
                      </td>

                      {/* Assigned Services List */}
                      <td style={tdStyle}>
                        {empServices.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                            }}
                          >
                            {empServices.map((srv) => (
                              <span
                                key={srv.id}
                                style={{
                                  backgroundColor: "#f3e8ff",
                                  color: "#7e22ce",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.72rem",
                                  fontWeight: "600",
                                }}
                              >
                                {srv.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span
                            style={{ color: "#9ca3af", fontSize: "0.78rem" }}
                          >
                            No assigned services
                          </span>
                        )}
                      </td>

                      <td style={tdStyle}>{emp.phone || "N/A"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "8px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
                            color: isActive ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {statusLabel}
                        </span>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(emp);
                              setShowViewModal(true);
                            }}
                            title="View Employee Profile"
                            style={actionBtnStyle}
                          >
                            <FiEye />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(emp);
                            }}
                            title="Edit Employee"
                            style={actionBtnStyle}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(emp.id);
                            }}
                            title="Delete Employee"
                            style={{ ...actionBtnStyle, color: "#dc2626" }}
                          >
                            <FiTrash2 />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedEmployeeId(
                                expandedEmployeeId === emp.id ? null : emp.id
                              );
                            }}
                            title={expandedEmployeeId === emp.id ? "Collapse Activity" : "View Activity & Earnings"}
                            style={{
                              ...actionBtnStyle,
                              color: expandedEmployeeId === emp.id ? "#e91e63" : "#6b7280",
                              backgroundColor: expandedEmployeeId === emp.id ? "#fce7f3" : "transparent",
                            }}
                          >
                            {expandedEmployeeId === emp.id ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE ACTIVITY ROW */}
                    {expandedEmployeeId === emp.id && (() => {
                      const empTxns = allTransactions.filter(
                        (t) => t.employee?.id === emp.id || t.employeeId === emp.id
                      );
                      return (
                        <tr key={`${emp.id}-activity`}>
                          <td
                            colSpan={7}
                            style={{
                              padding: 0,
                              background: "linear-gradient(135deg, #fdf2f8, #fce7f3)",
                              borderBottom: "2px solid #e91e63",
                            }}
                          >
                            <div style={{ padding: "16px 20px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "0.88rem",
                                    color: "#e91e63",
                                  }}
                                >
                                  📋 Activity & Earnings for {emp.name || emp.fullName}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    background: "#e91e63",
                                    color: "#fff",
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    fontWeight: "700",
                                  }}
                                >
                                  {empTxns.length} Jobs
                                </span>
                              </div>

                              {empTxns.length === 0 ? (
                                <p
                                  style={{
                                    fontSize: "0.82rem",
                                    color: "#9ca3af",
                                    margin: 0,
                                    fontStyle: "italic",
                                  }}
                                >
                                  No completed bookings found for this employee.
                                </p>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    maxHeight: "220px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {empTxns.map((txn) => {
                                    const custName = txn.customer?.fullName || "Customer";
                                    const srvName = txn.service?.name || "Service";
                                    const dateStr = txn.appointmentDate
                                      ? new Date(txn.appointmentDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                      : "—";
                                    const amt = txn.payment?.amount
                                      ? `$${Number(txn.payment.amount).toFixed(2)}`
                                      : "—";
                                    const pStatus = (txn.payment?.paymentStatus || txn.bookingStatus || "").toUpperCase();
                                    const isPaid = pStatus === "PAID" || pStatus === "COMPLETED";

                                    return (
                                      <div
                                        key={txn.id}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          backgroundColor: "#fff",
                                          borderRadius: "10px",
                                          padding: "10px 14px",
                                          boxShadow: "0 1px 4px rgba(233,30,99,0.08)",
                                        }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                          <div
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                              borderRadius: "50%",
                                              background: isPaid
                                                ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                                                : "linear-gradient(135deg, #fef3c7, #fde68a)",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              flexShrink: 0,
                                            }}
                                          >
                                            <FiDollarSign
                                              style={{
                                                fontSize: "0.85rem",
                                                color: isPaid ? "#059669" : "#d97706",
                                              }}
                                            />
                                          </div>
                                          <div>
                                            <strong style={{ fontSize: "0.82rem", color: "#111827", display: "block" }}>
                                              {srvName} — {custName}
                                            </strong>
                                            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                                              {dateStr}
                                            </span>
                                          </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                          <strong
                                            style={{
                                              fontSize: "0.88rem",
                                              color: isPaid ? "#059669" : "#374151",
                                              display: "block",
                                            }}
                                          >
                                            {amt}
                                          </strong>
                                          <span
                                            style={{
                                              fontSize: "0.68rem",
                                              padding: "2px 6px",
                                              borderRadius: "6px",
                                              backgroundColor: isPaid ? "#dcfce7" : "#fef3c7",
                                              color: isPaid ? "#15803d" : "#b45309",
                                              fontWeight: "700",
                                            }}
                                          >
                                            {isPaid ? "PAID" : "PENDING"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* FORM MODAL (ADD / EDIT) */}
      {showFormModal && (
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
                {editingId ? "Edit Employee" : "Add New Employee"}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
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
              {/* CUTE EMPLOYEE PROFILE PHOTO PICKER AT TOP */}
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
                      alt="Employee Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#e91e63" }}>
                      <span style={{ fontSize: "2rem", fontWeight: "700", lineHeight: 1 }}>
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "👤"}
                      </span>
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
                  📸 Tap circle to upload profile photo
                </span>
              </div>

              {/* NAME */}
              <Input
                label="👤 Full Name"
                required
                placeholder="e.g. Martha Kebede"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{
                  borderRadius: "12px",
                  padding: "12px 16px"
                }}
              />

              {/* EMAIL & PHONE GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <Input
                  label="📞 Phone Number"
                  required
                  placeholder="e.g. 0911223344"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
                <Input
                  label="📧 Email"
                  type="email"
                  placeholder="e.g. martha@salon.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
              </div>

              {/* SPECIALIZATION SELECTOR */}
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
                  ✨ Specialization Focus
                </label>
                {availableServices.length > 0 ? (
                  <select
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                        position: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      outline: "none",
                      fontSize: "0.95rem"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#e91e63"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  >
                    {availableServices.map((srv) => (
                      <option key={srv.id} value={srv.name}>
                        {srv.name}
                      </option>
                    ))}

                    {formData.specialization &&
                      !availableServices.some(
                        (srv) => srv.name === formData.specialization,
                      ) && (
                        <option value={formData.specialization}>
                          {formData.specialization}
                        </option>
                      )}
                  </select>
                ) : (
                  <Input
                    placeholder="e.g. Hair stylist, manicure, massage specialist"
                    required
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                        position: e.target.value,
                      })
                    }
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px"
                    }}
                  />
                )}
              </div>

              {/* ASSIGNED SERVICES CHECKBOXES */}
              {availableServices.length > 0 && (
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
                    ✂️ Assign Workable Services
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      maxHeight: "140px",
                      overflowY: "auto",
                      border: "1px solid #eae8e4",
                      backgroundColor: "#fdfbf7",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  >
                    {availableServices.map((srv) => (
                      <label
                        key={srv.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.82rem",
                          fontWeight: "500",
                          color: "#4b5563",
                          cursor: "pointer",
                          userSelect: "none"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceIds.includes(srv.id)}
                          onChange={() => handleServiceCheckbox(srv.id)}
                          style={{
                            accentColor: "#e91e63",
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        />
                        {srv.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* GENDER & EXPERIENCE GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
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
                    👩‍🎤 Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      outline: "none",
                      fontSize: "0.95rem"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#e91e63"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <Input
                  label="🏆 Experience (Years)"
                  type="number"
                  min="0"
                  required
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  style={{
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
              </div>

              {/* BIOGRAPHY */}
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
                  📝 Biography / Short Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell customers about their qualifications & background..."
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({ ...formData, biography: e.target.value })
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

              {/* STATUS */}
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
                  🔔 Active Availability Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                    outline: "none",
                    fontSize: "0.95rem"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e91e63"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                >
                  <option value="ACTIVE">Active (Available for appointments)</option>
                  <option value="INACTIVE">Inactive (Temporarily unavailable)</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "12px",
                  marginTop: "8px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Save Changes" : "Create Employee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && selectedEmployee && (
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
                Employee Profile
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
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

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#fce7f3",
                  color: "#e91e63",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                {selectedEmployee.image || selectedEmployee.photoUrl ? (
                  <img
                    src={getImageUrl(selectedEmployee.image || selectedEmployee.photoUrl)}
                    alt={selectedEmployee.name || selectedEmployee.fullName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  (selectedEmployee.name || selectedEmployee.fullName || "E")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <h4
                style={{
                  margin: "8px 0 2px 0",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                }}
              >
                {selectedEmployee.name || selectedEmployee.fullName}
              </h4>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                {selectedEmployee.specialization ||
                  selectedEmployee.position ||
                  "Specialist"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "0.88rem",
                color: "#374151",
              }}
            >
              <div>
                <strong>Gender:</strong> {selectedEmployee.gender || "Female"}
              </div>
              <div>
                <strong>Experience:</strong>{" "}
                {selectedEmployee.experience ??
                  selectedEmployee.experienceYears ??
                  0}{" "}
                Years
              </div>
              <div>
                <strong>Phone:</strong> {selectedEmployee.phone || "N/A"}
              </div>
              <div>
                <strong>Email:</strong> {selectedEmployee.email || "N/A"}
              </div>
              <div>
                <strong>Assigned Services:</strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    marginTop: "4px",
                  }}
                >
                  {(
                    selectedEmployee.services ||
                    selectedEmployee.Services ||
                    []
                  ).map((s) => (
                    <span
                      key={s.id}
                      style={{
                        backgroundColor: "#f3e8ff",
                        color: "#7e22ce",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Biography:</strong>{" "}
                {selectedEmployee.biography ||
                  selectedEmployee.bio ||
                  "No biography added."}
              </div>
              <div>
                <strong>Status:</strong> {selectedEmployee.status || "ACTIVE"}
              </div>
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                onClick={() => setShowViewModal(false)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
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
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "16px",
};

const modalContent = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "520px",
  width: "100%",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

export default Employees;
