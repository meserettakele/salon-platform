import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { Loader } from "../../components/common/Loader";
import api from "../../services/api";

export const AdminProfile = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "ADMIN",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState({
    theme: "light",
    language: "en",
    emailNotifications: true,
    systemNotifications: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const imageBaseUrl = "http://localhost:5000";

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "ADMIN",
      });

      if (user.profileImage) {
        setAvatarPreview(`${imageBaseUrl}${user.profileImage}`);
      } else {
        setAvatarPreview("");
      }
    }
  }, [user]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        localStorage.removeItem("adminSettings");
      }
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();

      formData.append("fullName", profileData.fullName);
      formData.append("phone", profileData.phone);
      formData.append("email", profileData.email);

      if (avatarFile) {
        formData.append("profileImage", avatarFile);
      }

      const res = await api.patch("/admin/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUserData = res.data.data;

      if (updateUser && updatedUserData) {
        updateUser(updatedUserData);
      }

      if (updatedUserData?.profileImage) {
        setAvatarPreview(`${imageBaseUrl}${updatedUserData.profileImage}`);
      }

      setAvatarFile(null);
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    if (!passwords.newPassword.trim()) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.patch("/admin/profile", {
        password: passwords.newPassword,
      });

      setPasswords({
        newPassword: "",
        confirmPassword: "",
      });

      setSuccessMsg("Password changed successfully.");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setSuccessMsg("Settings saved successfully.");
    } catch {
      setErrorMsg("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    return profileData.fullName?.charAt(0)?.toUpperCase() || "A";
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "800",
            color: "var(--color-dark)",
          }}
        >
          Admin Profile
        </h1>

        <p
          style={{
            marginTop: "6px",
            color: "var(--color-muted)",
            fontSize: "14px",
          }}
        >
          Manage your profile, security, and preferences.
        </p>
      </div>

      {/* Telegram-Style Header Card */}
      <Card>
        <div
          style={{
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              position: "relative",
              width: "96px",
              height: "96px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "800",
                border: "3px solid rgba(233, 30, 99, 0.15)",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Admin profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getInitial()
              )}
            </div>

            {/* Online Status */}
            <span
              style={{
                position: "absolute",
                right: "3px",
                bottom: "5px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                border: "3px solid var(--color-card)",
              }}
            />

            {/* Camera */}
            <label
              htmlFor="profile-image-upload"
              style={{
                position: "absolute",
                right: "-6px",
                bottom: "-8px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              }}
              title="Change profile picture"
            >
              📷
              <input
                id="profile-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Profile Summary */}
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "800",
                color: "var(--color-dark)",
              }}
            >
              {profileData.fullName || "Administrator"}
            </h2>

            <p
              style={{
                margin: "5px 0",
                color: "var(--color-muted)",
                fontSize: "14px",
              }}
            >
              {profileData.email || "No email available"}
            </p>

            <span
              style={{
                display: "inline-block",
                marginTop: "5px",
                padding: "5px 10px",
                borderRadius: "20px",
                backgroundColor: "rgba(233, 30, 99, 0.1)",
                color: "var(--color-primary)",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.05em",
              }}
            >
              ADMINISTRATOR
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          {[
            { id: "profile", label: "👤 My Profile" },
            { id: "password", label: "🔒 Security" },
            { id: "settings", label: "⚙️ Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                backgroundColor:
                  activeTab === tab.id
                    ? "rgba(233, 30, 99, 0.1)"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "var(--color-primary)"
                    : "var(--color-muted)",
                fontWeight: activeTab === tab.id ? "700" : "500",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <div style={{ padding: "0 24px" }}>
          {errorMsg && <ErrorMessage message={errorMsg} />}

          {successMsg && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                fontSize: "14px",
              }}
            >
              {successMsg}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: "20px" }}>
            <Loader />
          </div>
        )}

        {/* My Profile */}
        {activeTab === "profile" && !loading && (
          <form onSubmit={handleSaveProfile} style={{ padding: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <Input
                label="Full Name"
                value={profileData.fullName}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    fullName: e.target.value,
                  })
                }
              />

              <Input
                label="Phone Number"
                value={profileData.phone}
                disabled={!isEditing}
                placeholder="Enter phone number"
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phone: e.target.value,
                  })
                }
              />

              <Input label="Email Address" value={profileData.email} disabled />

              <Input label="Role" value={profileData.role} disabled />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(0,0,0,0.08)",
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
                      setAvatarFile(null);

                      if (user?.profileImage) {
                        setAvatarPreview(`${imageBaseUrl}${user.profileImage}`);
                      } else {
                        setAvatarPreview("");
                      }
                    }}
                  >
                    Cancel
                  </Button>

                  <Button type="submit">Save Changes</Button>
                </>
              )}
            </div>
          </form>
        )}

        {/* Security */}
        {activeTab === "password" && !loading && (
          <form
            onSubmit={handleChangePassword}
            style={{
              padding: "24px",
              maxWidth: "520px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--color-dark)",
                }}
              >
                Change Password
              </h3>

              <p
                style={{
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "var(--color-muted)",
                }}
              >
                Enter and confirm your new administrator password.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Input
                type="password"
                label="New Password"
                required
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
              />

              <Input
                type="password"
                label="Confirm New Password"
                required
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        )}

        {/* Settings */}
        {activeTab === "settings" && !loading && (
          <div
            style={{
              padding: "24px",
              maxWidth: "620px",
            }}
          >
            {/* Theme */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--color-dark)",
                }}
              >
                Theme
              </label>

              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-dark)",
                }}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            {/* Language */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--color-dark)",
                }}
              >
                Language
              </label>

              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    language: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-dark)",
                }}
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="fr">French</option>
              </select>
            </div>

            {/* Notifications */}
            <div
              style={{
                borderTop: "1px solid rgba(0,0,0,0.08)",
                paddingTop: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--color-dark)",
                }}
              >
                Notification Preferences
              </h3>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "12px 0",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--color-dark)",
                    }}
                  >
                    Email Alerts
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-muted)",
                      marginTop: "3px",
                    }}
                  >
                    Receive important updates by email.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailNotifications: e.target.checked,
                    })
                  }
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "12px 0",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--color-dark)",
                    }}
                  >
                    System Alerts
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--color-muted)",
                      marginTop: "3px",
                    }}
                  >
                    Receive alerts inside the platform.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.systemNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      systemNotifications: e.target.checked,
                    })
                  }
                />
              </label>
            </div>

            {/* Save Settings */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Button type="button" onClick={handleSaveSettings}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminProfile;
