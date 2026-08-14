// src/pages/customer/CustomerProfile.jsx

import React, { useEffect, useState } from "react";
import { FiCamera, FiCheck, FiLock, FiBell, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../services/api";

export const CustomerProfile = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatar, setAvatar] = useState("");

  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const imageBaseUrl = "http://localhost:5000";

  // =========================================================
  // LOAD CUSTOMER PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/customer/profile");

        console.log("Customer profile response:", response.data);

        // Supports:
        // { success: true, data: {...} }
        // and also directly returned {...}
        const data = response.data?.data || response.data;

        if (!data || !data.fullName) {
          throw new Error("Customer profile data was not returned.");
        }

        // Store complete profile
        setProfile(data);

        // IMPORTANT:
        // Load existing database information into the inputs
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");

        // Load existing profile image
        if (data.profileImage) {
          setAvatar(`${imageBaseUrl}${data.profileImage}`);
        } else {
          setAvatar("");
        }

        // Keep AuthContext synchronized
        if (updateUser) {
          updateUser(data);
        }
      } catch (err) {
        console.error("Customer profile error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load your profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [updateUser]);

  // =========================================================
  // SAVE PROFILE DETAILS
  // =========================================================

  const handleProfileSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/customer/profile", {
        fullName,
        phone,
        email,
      });

      const updatedProfile = response.data?.data || response.data;

      // Update displayed profile
      setProfile((prev) => ({
        ...prev,
        ...updatedProfile,
      }));

      // Keep updated values in inputs
      setFullName(updatedProfile.fullName || fullName);
      setPhone(updatedProfile.phone || phone);
      setEmail(updatedProfile.email || email);

      // Update AuthContext/sidebar
      if (updateUser) {
        updateUser(updatedProfile);
      }

      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Update customer profile error:", err);

      setError(
        err?.response?.data?.message || "Failed to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/customer/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedProfile = response.data?.data || response.data;

      setProfile((prev) => ({
        ...prev,
        ...updatedProfile,
      }));

      if (updatedProfile?.profileImage) {
        setAvatar(
          `${imageBaseUrl}${updatedProfile.profileImage}?t=${Date.now()}`,
        );
      }

      if (updateUser) {
        updateUser(updatedProfile);
      }

      setMessage("Profile photo updated successfully.");
    } catch (err) {
      console.error("Update customer profile image error:", err);

      setError(
        err?.response?.data?.message || "Failed to update profile photo.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PASSWORD
  // =========================================================

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      await api.put("/customer/profile/password", {
        oldPassword,
        newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Password updated successfully.");
    } catch (err) {
      console.error("Update customer password error:", err);

      setError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // AVATAR DISPLAY
  // =========================================================

  const displayedAvatar =
    avatar ||
    (profile?.profileImage ? `${imageBaseUrl}${profile.profileImage}` : "") ||
    (user?.profileImage ? `${imageBaseUrl}${user.profileImage}` : "");

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "40px",
          textAlign: "center",
          color: "var(--color-muted)",
        }}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* PAGE HEADER */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "8px",
          }}
        >
          My Profile
        </h2>

        <p style={{ color: "var(--color-muted)" }}>
          Manage your personal information, security, and preferences.
        </p>
      </div>

      {/* CUSTOMER HERO CARD */}
      <Card
        style={{
          marginBottom: "24px",
          padding: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            flexWrap: "wrap",
          }}
        >
          {/* AVATAR */}
          <div style={{ position: "relative" }}>
            {displayedAvatar ? (
              <img
                src={displayedAvatar}
                alt="Customer avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-primary)",
                  color: "white",
                  fontSize: "2rem",
                }}
              >
                <FiUser />
              </div>
            )}

            <label
              htmlFor="customer-avatar"
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-primary)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <FiCamera size={17} />

              <input
                id="customer-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* CUSTOMER SUMMARY */}
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: "7px",
                letterSpacing: "0.08em",
              }}
            >
              VALUED CUSTOMER
            </div>

            <h3 style={{ margin: "0 0 8px" }}>
              {profile?.fullName || "Customer"}
            </h3>

            <p
              style={{
                margin: 0,
                color: "var(--color-muted)",
              }}
            >
              {profile?.completedAppointments || 0} completed appointments
            </p>
          </div>
        </div>
      </Card>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <Button type="button" onClick={() => setActiveTab("profile")}>
          <FiUser /> Profile Details
        </Button>

        <Button type="button" onClick={() => setActiveTab("security")}>
          <FiLock /> Security
        </Button>

        <Button type="button" onClick={() => setActiveTab("preferences")}>
          <FiBell /> Preferences
        </Button>
      </div>

      {/* MESSAGES */}
      {message && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
          }}
        >
          <FiCheck /> {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {/* PROFILE DETAILS */}

      {activeTab === "profile" && (
        <Card>
          <h3 style={{ marginBottom: "22px" }}>Customer Profile Details</h3>

          <form onSubmit={handleProfileSave}>
            <Input
              label="Full Name"
              value={fullName}
              disabled={!isEditing}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Phone Number"
              value={phone}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              disabled={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);

                      setFullName(profile?.fullName || "");
                      setPhone(profile?.phone || "");
                      setEmail(profile?.email || "");
                    }}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* SECURITY */}

      {activeTab === "security" && (
        <Card>
          <h3 style={{ marginBottom: "22px" }}>Security & Password</h3>

          <form onSubmit={handlePasswordChange}>
            <Input
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </Card>
      )}

      {/* PREFERENCES */}

      {activeTab === "preferences" && (
        <Card>
          <h3 style={{ marginBottom: "22px" }}>Preferences & Notifications</h3>

          <PreferenceRow
            title="Booking confirmations"
            description="Receive notifications when your booking is confirmed."
            checked={bookingNotifications}
            onChange={setBookingNotifications}
          />

          <PreferenceRow
            title="Booking reminders"
            description="Receive reminders about upcoming appointments."
            checked={reminders}
            onChange={setReminders}
          />

          <PreferenceRow
            title="Promotional offers"
            description="Receive salon promotions and special offers."
            checked={promotions}
            onChange={setPromotions}
          />

          <PreferenceRow
            title="Dark theme"
            description="Use the dark theme for your profile."
            checked={darkTheme}
            onChange={setDarkTheme}
          />
        </Card>
      )}
    </div>
  );
};

const PreferenceRow = ({ title, description, checked, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "16px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div>
        <strong>{title}</strong>

        <p
          style={{
            margin: "5px 0 0",
            color: "var(--color-muted)",
          }}
        >
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
};

export default CustomerProfile;
