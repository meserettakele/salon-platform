// src/pages/owner/BusinessHours.jsx
import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const BusinessHours = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [schedule, setSchedule] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day, // Keep as "Monday", "Tuesday" etc. — must match DB ENUM
      dayLabel: day,
      openTime: "08:30",
      closeTime: "18:00",
      isOpen: day !== "Sunday", // true if open for booking
    })),
  );

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  const fetchBusinessHours = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/salon");
      const salonData = res?.data?.data || res?.data;
      console.log("OWNER SALON RESPONSE:", salonData);
      console.log(
        "OWNER BUSINESS HOURS DETAILS:",
        JSON.stringify(salonData.businessHours, null, 2),
      );
      const rawHours =
        salonData?.businessHours ||
        salonData?.BusinessHours ||
        salonData?.hours ||
        [];

      if (Array.isArray(rawHours) && rawHours.length > 0) {
        const mapped = DAYS.map((day) => {
          const found = rawHours.find(
            (bh) =>
              (bh.dayOfWeek || bh.day || "").toUpperCase() ===
              day.toUpperCase(),
          );

          if (found) {
            // Determine if open safely regardless of model naming
            const isClosedVal =
              found.isClosed !== undefined
                ? Boolean(found.isClosed)
                : found.isOpen !== undefined
                  ? !found.isOpen
                  : false;

            return {
              dayOfWeek: day, // title case e.g. "Monday" — matches DB ENUM
              dayLabel: day,
              openTime: found.openingTime || found.openTime || "08:30",
              closeTime: found.closingTime || found.closeTime || "18:00",
              isOpen: !isClosedVal,
            };
          }

          return {
            dayOfWeek: day, // title case
            dayLabel: day,
            openTime: "08:30",
            closeTime: "18:00",
            isOpen: day !== "Sunday",
          };
        });
        setSchedule(mapped);
      }
    } catch (err) {
      console.error("Failed to load business hours:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = (index) => {
    const updated = [...schedule];
    updated[index].isOpen = !updated[index].isOpen;
    setSchedule(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Send both "day" and "dayOfWeek" in title-case to match DB ENUM ("Monday" etc.)
    const formattedHours = schedule.map((item) => ({
      day: item.dayOfWeek,
      openingTime: item.openTime,
      closingTime: item.closeTime,
      isClosed: !item.isOpen,
    }));

    try {
      // Primary API Attempt
      await api.put("/owner/business-hours", { businessHours: formattedHours });
      setMessage({
        type: "success",
        text: "Business hours updated successfully!",
      });
    } catch (err) {
      try {
        // Fallback 1: Direct Array Payload
        await api.put("/owner/business-hours", formattedHours);
        setMessage({
          type: "success",
          text: "Business hours updated successfully!",
        });
      } catch (err2) {
        try {
          // Fallback 2: Direct Salon Update Route
          await api.put("/owner/salon", { businessHours: formattedHours });
          setMessage({
            type: "success",
            text: "Business hours updated successfully!",
          });
        } catch (err3) {
          console.error("Save error details:", err3?.response?.data || err3);
          setMessage({
            type: "error",
            text:
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              "Failed to update business hours",
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div
      style={{ padding: "16px 20px 48px", maxWidth: "800px", margin: "0 auto" }}
    >
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
          Business Hours Schedule
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "4px" }}>
          Configure opening and closing operational times for each day of the
          week.
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

      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {schedule.map((item, index) => (
            <div
              key={item.dayLabel}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: item.isOpen ? "#ffffff" : "#fafafa",
                border: "1px solid #f3f4f6",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  minWidth: "140px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    color: "#111827",
                  }}
                >
                  {item.dayLabel}
                </span>
              </div>

              {/* CHECKBOX CORRECTED: Checking means Open for Booking */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={item.isOpen}
                  onChange={() => handleToggleOpen(index)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#e91e63",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: item.isOpen ? "#15803d" : "#dc2626",
                  }}
                >
                  {item.isOpen ? "Open for Booking" : "Closed / Day Off"}
                </span>
              </label>

              {item.isOpen ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="time"
                    value={item.openTime}
                    onChange={(e) =>
                      handleTimeChange(index, "openTime", e.target.value)
                    }
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    to
                  </span>
                  <input
                    type="time"
                    value={item.closeTime}
                    onChange={(e) =>
                      handleTimeChange(index, "closeTime", e.target.value)
                    }
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  />
                </div>
              ) : (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: "#dc2626",
                    backgroundColor: "#fee2e2",
                    padding: "4px 12px",
                    borderRadius: "8px",
                  }}
                >
                  CLOSED
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={handleSave} disabled={saving}>
            <FiSave /> {saving ? "Saving Hours..." : "Save Business Hours"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BusinessHours;
