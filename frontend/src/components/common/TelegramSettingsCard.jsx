// src/components/common/TelegramSettingsCard.jsx
import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import api from "../../services/api";

export const TelegramSettingsCard = () => {
  const [status, setStatus] = useState({
    isConnected: false,
    telegramUsername: null,
    telegramNotifyEnabled: true,
    botUsername: "VelouraBeautyBot",
  });
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/telegram/status");
      const data = res?.data?.data || res?.data || {};
      setStatus(data);
    } catch (err) {
      console.warn("Failed to fetch Telegram status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Poll for connection completion after user clicks Connect
  useEffect(() => {
    let interval = null;
    if (linking && !status.isConnected) {
      interval = setInterval(async () => {
        try {
          const res = await api.get("/telegram/status");
          const data = res?.data?.data || res?.data || {};
          if (data.isConnected) {
            setStatus(data);
            setLinking(false);
            setMessage({ type: "success", text: "🎉 Telegram linked successfully!" });
            clearInterval(interval);
          }
        } catch (e) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [linking, status.isConnected]);

  const handleConnect = async () => {
    try {
      setLinking(true);
      setMessage(null);
      const res = await api.get("/telegram/link-token");
      const data = res?.data?.data || res?.data || {};

      if (data.telegramLink) {
        window.open(data.telegramLink, "_blank");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to generate Telegram connection link." });
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm("Are you sure you want to disconnect your Telegram notifications?")) {
      return;
    }
    try {
      setUnlinking(true);
      setMessage(null);
      await api.post("/telegram/unlink");
      setStatus((prev) => ({ ...prev, isConnected: false, telegramUsername: null }));
      setMessage({ type: "success", text: "Telegram account unlinked." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to unlink Telegram account." });
    } finally {
      setUnlinking(false);
    }
  };

  const handleToggleNotifications = async (e) => {
    const enabled = e.target.checked;
    setStatus((prev) => ({ ...prev, telegramNotifyEnabled: enabled }));
    try {
      await api.post("/telegram/toggle-notifications", { enabled });
    } catch (err) {
      console.error("Failed to toggle Telegram notifications:", err);
    }
  };

  return (
    <Card
      style={{
        marginTop: "20px",
        border: "1.5px solid var(--color-border)",
        borderRadius: "16px",
        backgroundColor: "var(--color-card)",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#229ED9",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.3rem",
              flexShrink: 0,
            }}
          >
            ✈️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--color-dark)" }}>
              Telegram Notifications
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--color-muted)" }}>
              Receive instant alerts, reminders, and manage bookings directly on Telegram.
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "700",
            padding: "4px 10px",
            borderRadius: "999px",
            backgroundColor: status.isConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(156, 163, 175, 0.15)",
            color: status.isConnected ? "#10B981" : "var(--color-muted)",
            border: status.isConnected ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--color-border)",
          }}
        >
          {status.isConnected ? "● Connected" : "○ Not Connected"}
        </span>
      </div>

      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "14px",
            fontSize: "0.85rem",
            fontWeight: "600",
            backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(225, 29, 72, 0.1)",
            color: message.type === "success" ? "#10B981" : "#E11D48",
            border: message.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(225, 29, 72, 0.2)",
          }}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>Checking Telegram status...</div>
      ) : status.isConnected ? (
        /* CONNECTED STATE */
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              backgroundColor: "var(--color-card-subtle)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-dark)" }}>
                Linked Account: <span style={{ color: "#229ED9" }}>@{status.telegramUsername || "Telegram User"}</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: "2px" }}>
                Bot: @{status.botUsername || "VelouraBeautyBot"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <a
                href={`https://t.me/${status.botUsername || "VelouraBeautyBot"}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#229ED9",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Open Bot ↗
              </a>
              <button
                type="button"
                onClick={handleUnlink}
                disabled={unlinking}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "1px solid #E11D48",
                  backgroundColor: "transparent",
                  color: "#E11D48",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {unlinking ? "Unlinking..." : "Disconnect"}
              </button>
            </div>
          </div>

          {/* Toggle Push Notifications */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
            }}
          >
            <div>
              <div style={{ fontSize: "0.86rem", fontWeight: "700", color: "var(--color-dark)" }}>
                Receive Push Notifications
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--color-muted)" }}>
                Get booking confirmations, approval alerts, and schedule changes in Telegram.
              </div>
            </div>
            <input
              type="checkbox"
              checked={status.telegramNotifyEnabled}
              onChange={handleToggleNotifications}
              style={{ width: "20px", height: "20px", accentColor: "var(--color-primary)", cursor: "pointer" }}
            />
          </div>
        </div>
      ) : (
        /* DISCONNECTED STATE */
        <div>
          <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "var(--color-muted)", lineHeight: "1.5" }}>
            Connect your Telegram account to receive real-time push alerts when appointments are requested, accepted, or updated. Salon owners can even <strong>Accept or Decline bookings directly inside Telegram</strong>!
          </p>

          <button
            type="button"
            onClick={handleConnect}
            disabled={linking}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              backgroundColor: "#229ED9",
              color: "#FFFFFF",
              fontWeight: "700",
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(34, 158, 217, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            <span>✈️</span>
            <span>{linking ? "Opening Telegram..." : "Connect Telegram"}</span>
          </button>
          {linking && (
            <p style={{ marginTop: "8px", fontSize: "0.78rem", color: "var(--color-muted)" }}>
              Waiting for you to click <strong>Start</strong> in Telegram...
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default TelegramSettingsCard;
