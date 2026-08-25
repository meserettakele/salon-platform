// src/pages/employee/EmployeeProfile.jsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiAward,
  FiLock,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { DateTimeSettingsCard } from "../../components/common/DateTimeSettingsCard";
import api, { getImageUrl } from "../../services/api";

export const EmployeeProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    experienceYears: "",
    password: "",
  });

  // =====================================================
  // FETCH EMPLOYEE PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/employee/profile");

      const employee = response?.data?.data || response?.data;

      setProfile(employee);

      setFormData({
        fullName: employee?.name || employee?.userAccount?.fullName || "",
        email: employee?.userAccount?.email || "",
        phone: employee?.phone || employee?.userAccount?.phone || "",
        specialization: employee?.specialization || "",
        experienceYears: employee?.experienceYears ?? "",
        password: "",
      });
    } catch (error) {
      console.error("Failed to fetch employee profile:", error);

      alert(
        error?.response?.data?.message || "Failed to load employee profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        experienceYears:
          formData.experienceYears === ""
            ? 0
            : Number(formData.experienceYears),
      };

      // Only send password if employee entered one
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await api.put("/employee/profile", updateData);

      const updatedEmployee = response?.data?.data || response?.data;

      setProfile(updatedEmployee);

      setFormData((previous) => ({
        ...previous,
        password: "",
      }));

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update employee profile:", error);

      alert(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loader />;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* PAGE HEADER */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: "24px" }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "1.8rem",
            fontWeight: "800",
            color: "var(--color-dark)",
          }}
        >
          My Profile
        </h1>

        <p
          style={{
            margin: "6px 0 0",
            color: "var(--color-muted)",
            fontSize: "0.9rem",
          }}
        >
          Manage your employee information and account details.
        </p>
      </motion.div>

      {/* PROFILE HEADER CARD */}

      <Card
        style={{
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          {/* PROFILE IMAGE / INITIAL */}

          <div
            style={{
              width: "82px",
              height: "82px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "800",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {profile?.image ? (
              <img
                src={getImageUrl(profile.image)}
                alt={profile?.name || "Employee"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              (profile?.name || "E").charAt(0).toUpperCase()
            )}
          </div>

          {/* PROFILE SUMMARY */}

          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: "800",
                color: "var(--color-dark)",
              }}
            >
              {profile?.name || "Employee"}
            </h2>

            <p
              style={{
                margin: "5px 0",
                color: "var(--color-muted)",
                fontSize: "0.9rem",
              }}
            >
              {profile?.position || "Specialist"}
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              <span style={badgeStyle}>EMPLOYEE</span>

              {profile?.isAvailable !== false && (
                <span
                  style={{
                    ...badgeStyle,
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                  }}
                >
                  <FiCheckCircle />
                  Available
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* EDIT PROFILE CARD */}

      <Card style={{ padding: "24px" }}>
        <form onSubmit={handleSubmit}>
          <h3
            style={{
              margin: "0 0 20px",
              fontSize: "1.05rem",
              fontWeight: "800",
              color: "var(--color-dark)",
            }}
          >
            Personal Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {/* FULL NAME */}

            <div>
              <label style={labelStyle}>
                <FiUser />
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* EMAIL */}

            <div>
              <label style={labelStyle}>
                <FiMail />
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* PHONE */}

            <div>
              <label style={labelStyle}>
                <FiPhone />
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            {/* SPECIALIZATION */}

            <div>
              <label style={labelStyle}>
                <FiBriefcase />
                Specialization
              </label>

              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Hair Stylist"
                style={inputStyle}
              />
            </div>

            {/* EXPERIENCE */}

            <div>
              <label style={labelStyle}>
                <FiAward />
                Experience Years
              </label>

              <input
                type="number"
                name="experienceYears"
                min="0"
                value={formData.experienceYears}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label style={labelStyle}>
                <FiLock />
                New Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty to keep current"
                style={inputStyle}
              />
            </div>
          </div>

          {/* SALON INFORMATION */}

          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#f9fafb",
              border: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                fontWeight: "600",
                marginBottom: "5px",
              }}
            >
              WORKING AT
            </div>

            <div
              style={{
                fontSize: "0.95rem",
                color: "var(--color-dark)",
                fontWeight: "700",
              }}
            >
              {profile?.salon?.name || "Assigned Salon"}
            </div>

            {profile?.salon?.address && (
              <div
                style={{
                  marginTop: "3px",
                  fontSize: "0.8rem",
                  color: "var(--color-muted)",
                }}
              >
                {profile.salon.address}
              </div>
            )}
          </div>

          {/* SAVE BUTTON */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <Button type="submit" disabled={saving}>
                <FiSave />

                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        <DateTimeSettingsCard />
      </div>
    );
  };

// =====================================================
// STYLES
// =====================================================

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.8rem",
  fontWeight: "700",
  color: "var(--color-dark)",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-card)",
  color: "var(--color-dark)",
  fontSize: "0.9rem",
  outline: "none",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 10px",
  borderRadius: "12px",
  backgroundColor: "var(--color-primary-light)",
  color: "var(--color-primary)",
  fontSize: "0.72rem",
  fontWeight: "700",
};

export default EmployeeProfile;
