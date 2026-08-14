// src/pages/owner/OwnerProfile.jsx

import { useEffect, useState } from "react";
import {
  FiUser,
  FiLock,
  FiSettings,
  FiCamera,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../services/api";

export const OwnerProfile = () => {
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profileImage: user?.profileImage || "",
  });

  const [salonData, setSalonData] = useState({
    name: "",
    address: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState({
    theme: localStorage.getItem("ownerTheme") || "system",
    language: localStorage.getItem("ownerLanguage") || "English",
    notifications: localStorage.getItem("ownerNotifications") !== "false",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/owner/profile");
      const data = res?.data?.data || res?.data;

      if (data) {
        setProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          profileImage: data.profileImage || "",
        });

        if (data.salon) {
          setSalonData({
            name: data.salon.name || "",
            address: data.salon.address || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load owner profile:", err);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const baseURL = api.defaults.baseURL || "";

    return `${baseURL.replace(/\/api\/v1\/?$/, "")}/${imagePath.replace(
      /^\/+/,
      "",
    )}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
    setProfileMsg(null);

    const previewUrl = URL.createObjectURL(file);

    setProfileData((prev) => ({
      ...prev,
      profileImage: previewUrl,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const formData = new FormData();

      formData.append("fullName", profileData.fullName);
      formData.append("phone", profileData.phone);

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const res = await api.put("/owner/profile", formData);

      const updatedUser = res?.data;

      if (updatedUser) {
        setProfileData((prev) => ({
          ...prev,
          fullName: updatedUser.fullName || prev.fullName,
          email: updatedUser.email || prev.email,
          phone: updatedUser.phone || prev.phone,
          profileImage: updatedUser.profileImage || prev.profileImage,
        }));

        if (setUser) {
          setUser((prev) => ({
            ...prev,
            ...updatedUser,
          }));
        }
      }

      setSelectedImage(null);

      setProfileMsg({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setSavingPassword(true);
    setPasswordMsg(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "New passwords do not match.",
      });

      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });

      setSavingPassword(false);
      return;
    }

    try {
      await api.put("/owner/profile/password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMsg({
        type: "success",
        text: "Password changed successfully!",
      });

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "theme") {
      localStorage.setItem("ownerTheme", value);
    }

    if (key === "language") {
      localStorage.setItem("ownerLanguage", value);
    }

    if (key === "notifications") {
      localStorage.setItem("ownerNotifications", value);
    }
  };

  const avatarImage = getImageUrl(profileData.profileImage);

  return (
    <div
      style={{
        padding: "16px 20px 48px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* OWNER HERO CARD */}
      <Card
        style={{
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "82px",
              height: "82px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                backgroundColor: "#e91e63",
                color: "#ffffff",
                fontSize: "2rem",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt="Owner"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                (profileData.fullName || "O").charAt(0).toUpperCase()
              )}
            </div>

            <label
              htmlFor="owner-profile-image"
              style={{
                position: "absolute",
                right: "-2px",
                bottom: "-2px",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "#111827",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "3px solid #ffffff",
              }}
              title="Change profile photo"
            >
              <FiCamera size={14} />
            </label>

            <input
              id="owner-profile-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: "#111827",
                margin: 0,
              }}
            >
              {profileData.fullName || "Salon Owner"}
            </h1>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "999px",
                  backgroundColor: "#fce7f3",
                  color: "#be185d",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                }}
              >
                SALON OWNER
              </span>

              {salonData.name && (
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "999px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                  }}
                >
                  {salonData.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          padding: "5px",
          backgroundColor: "#f3f4f6",
          borderRadius: "10px",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          style={{
            flex: 1,
            minWidth: "150px",
            border: "none",
            borderRadius: "7px",
            padding: "11px 14px",
            cursor: "pointer",
            backgroundColor:
              activeTab === "profile" ? "#ffffff" : "transparent",
            color: activeTab === "profile" ? "#111827" : "#6b7280",
            fontWeight: "700",
          }}
        >
          <FiUser style={{ marginRight: "7px" }} />
          Profile Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          style={{
            flex: 1,
            minWidth: "150px",
            border: "none",
            borderRadius: "7px",
            padding: "11px 14px",
            cursor: "pointer",
            backgroundColor:
              activeTab === "security" ? "#ffffff" : "transparent",
            color: activeTab === "security" ? "#111827" : "#6b7280",
            fontWeight: "700",
          }}
        >
          <FiLock style={{ marginRight: "7px" }} />
          Security
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          style={{
            flex: 1,
            minWidth: "150px",
            border: "none",
            borderRadius: "7px",
            padding: "11px 14px",
            cursor: "pointer",
            backgroundColor:
              activeTab === "settings" ? "#ffffff" : "transparent",
            color: activeTab === "settings" ? "#111827" : "#6b7280",
            fontWeight: "700",
          }}
        >
          <FiSettings style={{ marginRight: "7px" }} />
          Settings
        </button>
      </div>

      {/* TAB 1 — OWNER PROFILE DETAILS */}
      {activeTab === "profile" && (
        <Card style={{ padding: "24px" }}>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: "1.15rem",
              fontWeight: "800",
            }}
          >
            Owner Profile Details
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              fontSize: "0.84rem",
              color: "#6b7280",
            }}
          >
            Manage your personal information and profile photo.
          </p>

          {profileMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                fontWeight: "600",
                backgroundColor:
                  profileMsg.type === "success" ? "#dcfce7" : "#fee2e2",
                color: profileMsg.type === "success" ? "#15803d" : "#b91c1c",
              }}
            >
              {profileMsg.text}
            </div>
          )}

          <form
            onSubmit={handleUpdateProfile}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <Input
                label="Full Name"
                required
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    fullName: e.target.value,
                  })
                }
              />

              <Input
                label="Phone Number"
                required
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <Input label="Email Address" value={profileData.email} disabled />

            <div
              style={{
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "#6b7280",
                  marginBottom: "5px",
                }}
              >
                ASSIGNED SALON
              </div>

              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                {salonData.name || "No salon assigned"}
              </div>

              <div
                style={{
                  fontSize: "0.84rem",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                {salonData.address || "No address available"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <Button type="submit" disabled={savingProfile}>
                <FiSave />
                {savingProfile ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2 — SECURITY */}
      {activeTab === "security" && (
        <Card style={{ padding: "24px" }}>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: "1.15rem",
              fontWeight: "800",
            }}
          >
            Security & Password
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              fontSize: "0.84rem",
              color: "#6b7280",
            }}
          >
            Verify your current password before creating a new one.
          </p>

          {passwordMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                fontWeight: "600",
                backgroundColor:
                  passwordMsg.type === "success" ? "#dcfce7" : "#fee2e2",
                color: passwordMsg.type === "success" ? "#15803d" : "#b91c1c",
              }}
            >
              {passwordMsg.text}
            </div>
          )}

          <form
            onSubmit={handleChangePassword}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Input
              label="Current Password"
              type="password"
              required
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
            />

            <Input
              label="New Password"
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <Button
                type="submit"
                variant="secondary"
                disabled={savingPassword}
              >
                <FiLock />
                {savingPassword ? "Updating Password..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3 — SALON & APP SETTINGS */}
      {activeTab === "settings" && (
        <Card style={{ padding: "24px" }}>
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: "1.15rem",
              fontWeight: "800",
            }}
          >
            Salon & App Settings
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              fontSize: "0.84rem",
              color: "#6b7280",
            }}
          >
            Customize your application preferences.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div
              style={{
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: "#111827",
                }}
              >
                Theme Mode
              </label>

              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: "#111827",
                }}
              >
                Language
              </label>

              <select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="English">English</option>
                <option value="Amharic">Amharic</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Salon Notifications
                </div>

                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "#6b7280",
                    marginTop: "3px",
                  }}
                >
                  Receive alerts about salon activity.
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  handleSettingChange("notifications", e.target.checked)
                }
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "#15803d",
              }}
            >
              <FiCheckCircle />
              Settings saved automatically.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OwnerProfile;
