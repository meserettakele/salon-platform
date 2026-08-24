// src/pages/owner/BusinessHours.jsx
import { useState, useEffect, useMemo } from "react";
import { FiSave, FiClock, FiCheck, FiCopy } from "react-icons/fi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useDateTime } from "../../context/DateTimeContext";
import { formatEthiopianTime, formatStandard12H, formatStandard24H } from "../../utils/ethiopianDate";
import api from "../../services/api";

const DAYS = [
  { en: "Monday", am: "ሰኞ" },
  { en: "Tuesday", am: "ማክሰኞ" },
  { en: "Wednesday", am: "ረቡዕ" },
  { en: "Thursday", am: "ሐሙስ" },
  { en: "Friday", am: "ዓርብ" },
  { en: "Saturday", am: "ቅዳሜ" },
  { en: "Sunday", am: "እሑድ" },
];

export const BusinessHours = () => {
  const { timeFormat, setTimeFormat, language, formatTime } = useDateTime();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [schedule, setSchedule] = useState(
    DAYS.map((d) => ({
      dayOfWeek: d.en, // Matches DB ENUM ("Monday", "Tuesday"...)
      dayLabel: d.en,
      dayAmharic: d.am,
      openTime: "08:30",
      closeTime: "18:00",
      isOpen: d.en !== "Sunday",
    })),
  );

  // Generate all 30-minute interval options from 05:00 to 23:30
  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 5; h <= 23; h++) {
      for (let m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const val = `${hh}:${mm}`;

        let displayLabel = val;
        if (timeFormat === "ETHIOPIAN_12H") {
          displayLabel = formatEthiopianTime(val, language);
        } else if (timeFormat === "STANDARD_12H") {
          displayLabel = formatStandard12H(val);
        } else {
          displayLabel = formatStandard24H(val);
        }

        options.push({ value: val, label: displayLabel });
      }
    }
    return options;
  }, [timeFormat, language]);

  // Dynamic presets based on chosen time format
  const presets = useMemo(() => {
    const list = [
      {
        title: "Standard Salon",
        open: "08:30",
        close: "18:00",
      },
      {
        title: "Extended Hours",
        open: "08:00",
        close: "20:00",
      },
      {
        title: "Morning Shift",
        open: "07:00",
        close: "17:00",
      },
      {
        title: "Full Day",
        open: "07:00",
        close: "21:00",
      },
    ];

    return list.map((p) => ({
      ...p,
      timeText: `${formatTime(p.open)} – ${formatTime(p.close)}`,
    }));
  }, [formatTime, timeFormat]);

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  const fetchBusinessHours = async () => {
    try {
      setLoading(true);
      const res = await api.get("/owner/salon");
      const salonData = res?.data?.data || res?.data;
      const rawHours =
        salonData?.businessHours ||
        salonData?.BusinessHours ||
        salonData?.hours ||
        [];

      if (Array.isArray(rawHours) && rawHours.length > 0) {
        const mapped = DAYS.map((d) => {
          const found = rawHours.find(
            (bh) =>
              (bh.dayOfWeek || bh.day || "").toUpperCase() ===
              d.en.toUpperCase(),
          );

          if (found) {
            const isClosedVal =
              found.isClosed !== undefined
                ? Boolean(found.isClosed)
                : found.isOpen !== undefined
                  ? !found.isOpen
                  : false;

            return {
              dayOfWeek: d.en,
              dayLabel: d.en,
              dayAmharic: d.am,
              openTime: found.openingTime || found.openTime || "08:30",
              closeTime: found.closingTime || found.closeTime || "18:00",
              isOpen: !isClosedVal,
            };
          }

          return {
            dayOfWeek: d.en,
            dayLabel: d.en,
            dayAmharic: d.am,
            openTime: "08:30",
            closeTime: "18:00",
            isOpen: d.en !== "Sunday",
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

  const handleApplyPreset = (open, close) => {
    const updated = schedule.map((item) => {
      if (item.isOpen) {
        return { ...item, openTime: open, closeTime: close };
      }
      return item;
    });
    setSchedule(updated);
    setMessage({
      type: "success",
      text: `Applied (${formatTime(open)} – ${formatTime(close)}) to all open days! Click "Save Business Hours" to save.`,
    });
  };

  const handleCopyMondayToWeekdays = () => {
    const monday = schedule.find((s) => s.dayOfWeek === "Monday");
    if (!monday) return;

    const updated = schedule.map((item) => {
      if (["Tuesday", "Wednesday", "Thursday", "Friday"].includes(item.dayOfWeek)) {
        return {
          ...item,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          isOpen: monday.isOpen,
        };
      }
      return item;
    });
    setSchedule(updated);
    setMessage({
      type: "success",
      text: "Monday hours copied to Tuesday – Friday. Click 'Save Business Hours' to save.",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const formattedHours = schedule.map((item) => ({
      day: item.dayOfWeek,
      openingTime: item.openTime,
      closingTime: item.closeTime,
      isClosed: !item.isOpen,
    }));

    try {
      await api.put("/owner/business-hours", { businessHours: formattedHours });
      setMessage({
        type: "success",
        text: "Business hours updated successfully!",
      });
    } catch (err) {
      try {
        await api.put("/owner/business-hours", formattedHours);
        setMessage({
          type: "success",
          text: "Business hours updated successfully!",
        });
      } catch (err2) {
        try {
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
    <div style={{ padding: "16px 20px 48px", maxWidth: "900px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "1.75rem" }}>🕒</span>
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  color: "var(--color-dark)",
                  margin: 0,
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                Business Hours Schedule
              </h1>
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--color-muted)", margin: 0, lineHeight: "1.5" }}>
              Set opening and closing operational times. Times adapt to your active time format setting.
            </p>
          </div>

          {/* Time System Selector (Linked with User Settings) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--color-card-subtle)",
              borderRadius: "10px",
              padding: "3px",
              gap: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => setTimeFormat("ETHIOPIAN_12H")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: timeFormat === "ETHIOPIAN_12H" ? "#18181B" : "transparent",
                color: timeFormat === "ETHIOPIAN_12H" ? "#FFFFFF" : "#6B7280",
                transition: "all 0.15s ease",
              }}
            >
              🇪🇹 Ethiopian
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat("STANDARD_12H")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: timeFormat === "STANDARD_12H" ? "#18181B" : "transparent",
                color: timeFormat === "STANDARD_12H" ? "#FFFFFF" : "#6B7280",
                transition: "all 0.15s ease",
              }}
            >
              ⏰ 12-Hour
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat("STANDARD_24H")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: timeFormat === "STANDARD_24H" ? "#18181B" : "transparent",
                color: timeFormat === "STANDARD_24H" ? "#FFFFFF" : "#6B7280",
                transition: "all 0.15s ease",
              }}
            >
              ⏱️ 24-Hour
            </button>
          </div>
        </div>
      </div>

      {/* Quick Setup Presets Card */}
      <div
        style={{
          backgroundColor: "#FFF5F8",
          border: "1px solid #FBCFE8",
          borderRadius: "14px",
          padding: "16px 18px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: "800",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              letterSpacing: "0.06em",
            }}
          >
            ⚡ Quick Hours Presets
          </span>
          <button
            type="button"
            onClick={handleCopyMondayToWeekdays}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid var(--color-primary)",
              backgroundColor: "#FFFFFF",
              color: "var(--color-primary)",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <FiCopy size={13} /> Copy Monday to Weekdays (Tue–Fri)
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p.open, p.close)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "0.84rem", fontWeight: "800", color: "var(--color-dark)", marginBottom: "3px" }}>
                {p.title}
              </div>
              <div style={{ fontSize: "0.76rem", fontWeight: "700", color: "var(--color-primary)" }}>
                {p.timeText}
              </div>
            </button>
          ))}
        </div>
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

      <Card style={{ padding: "20px 24px", borderRadius: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {schedule.map((item, index) => (
            <div
              key={item.dayLabel}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: "12px",
                backgroundColor: item.isOpen ? "var(--color-card)" : "var(--color-card-subtle)",
                border: "1px solid var(--color-border)",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              {/* Day Label with Amharic & English */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: "120px",
                }}
              >
                <span
                  style={{
                    fontWeight: "800",
                    fontSize: "0.98rem",
                    color: item.isOpen ? "var(--color-dark)" : "var(--color-muted-light)",
                  }}
                >
                  {item.dayLabel}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    color: item.isOpen ? "var(--color-primary)" : "var(--color-muted-light)",
                  }}
                >
                  {item.dayAmharic}
                </span>
              </div>

              {/* Open / Closed Toggle Checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={item.isOpen}
                  onChange={() => handleToggleOpen(index)}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "var(--color-primary)",
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: item.isOpen ? "#15803d" : "#dc2626",
                  }}
                >
                  {item.isOpen ? "Open for Booking" : "Closed / Day Off"}
                </span>
              </label>

              {/* Time Dropdown Selection linked with Chosen Time Format */}
              {item.isOpen ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {/* Opens At Dropdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-muted)" }}>
                      Opens At
                    </span>
                    <select
                      value={item.openTime}
                      onChange={(e) => handleTimeChange(index, "openTime", e.target.value)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        border: "1.5px solid var(--color-border)",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        backgroundColor: "var(--color-card)",
                        color: "var(--color-dark)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {timeOptions.map((opt) => (
                        <option key={`open-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-muted)", marginTop: "14px" }}>
                    —
                  </span>

                  {/* Closes At Dropdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-muted)" }}>
                      Closes At
                    </span>
                    <select
                      value={item.closeTime}
                      onChange={(e) => handleTimeChange(index, "closeTime", e.target.value)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        border: "1.5px solid var(--color-border)",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        backgroundColor: "var(--color-card)",
                        color: "var(--color-dark)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {timeOptions.map((opt) => (
                        <option key={`close-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: "800",
                    color: "#DC2626",
                    backgroundColor: "#FEE2E2",
                    padding: "6px 14px",
                    borderRadius: "8px",
                  }}
                >
                  CLOSED (ዝግ ነው)
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
          <Button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px" }}>
            <FiSave /> {saving ? "Saving Hours..." : "Save Business Hours"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BusinessHours;
