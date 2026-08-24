// src/components/common/DateTimeQuickToggle.jsx
import React, { useState, useRef, useEffect } from "react";
import { useDateTime } from "../../context/DateTimeContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export const DateTimeQuickToggle = () => {
  const {
    calendarType,
    setCalendarType,
    timeFormat,
    setTimeFormat,
    formatDate,
    formatTime,
  } = useDateTime();

  const { theme, setTheme, isDark } = useTheme();
  const { currentLang, setLanguage: setAppLang, supportedLanguages, currentLanguageInfo, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const now = new Date();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: isDark ? "#1E293B" : "#F3F4F6",
          border: "1px solid var(--color-border)",
          borderRadius: "20px",
          padding: "5px 12px",
          fontSize: "0.78rem",
          fontWeight: "700",
          color: "var(--color-dark)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
        }}
        title="Quick App Settings & Calendar"
      >
        <span>{calendarType === "ETHIOPIAN" ? "🇪🇹" : "🌍"}</span>
        <span>{formatDate(now)}</span>
        <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
          {isDark ? "🌙" : "☀️"}
        </span>
        <span style={{ fontSize: "0.65rem", color: "var(--color-muted)" }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: "8px",
            width: "300px",
            backgroundColor: "var(--color-card)",
            borderRadius: "16px",
            boxShadow: "0 18px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--color-border)",
            border: "1px solid var(--color-border)",
            padding: "16px",
            zIndex: 1100,
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: "800", color: "var(--color-dark)" }}>
              ⚡ Quick Preferences
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--color-primary)", fontWeight: "700" }}>
              {currentLanguageInfo.flag} {currentLanguageInfo.name}
            </span>
          </div>

          {/* Theme Quick Toggle */}
          <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              {t("theme")}
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
              <button
                type="button"
                onClick={() => setTheme("light")}
                style={{
                  padding: "5px 6px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: theme === "light" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: theme === "light" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                style={{
                  padding: "5px 6px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: theme === "dark" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: theme === "dark" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                🌙 Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                style={{
                  padding: "5px 6px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: theme === "system" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: theme === "system" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                💻 Auto
              </button>
            </div>
          </div>

          {/* Language Quick Toggle */}
          <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              {t("language")}
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setAppLang(lang.code)}
                  style={{
                    padding: "5px 4px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: currentLang === lang.code ? "var(--color-primary)" : "var(--color-primary-light)",
                    color: currentLang === lang.code ? "#FFFFFF" : "var(--color-dark)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={lang.name}
                >
                  {lang.flag} {lang.nativeName.slice(0, 7)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar System Quick Switch */}
          <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              🗓️ Calendar System
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setCalendarType("ETHIOPIAN")}
                style={{
                  padding: "6px 8px",
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: calendarType === "ETHIOPIAN" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: calendarType === "ETHIOPIAN" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                🇪🇹 Ethiopian (ዓ.ም.)
              </button>
              <button
                type="button"
                onClick={() => setCalendarType("GREGORIAN")}
                style={{
                  padding: "6px 8px",
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: calendarType === "GREGORIAN" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: calendarType === "GREGORIAN" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                🌍 European (G.C.)
              </button>
            </div>
          </div>

          {/* Time System Quick Switch */}
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              🕒 Time System
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setTimeFormat("ETHIOPIAN_12H")}
                style={{
                  padding: "5px 4px",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: timeFormat === "ETHIOPIAN_12H" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: timeFormat === "ETHIOPIAN_12H" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                🇪🇹 Eth 12H
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat("STANDARD_12H")}
                style={{
                  padding: "5px 4px",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: timeFormat === "STANDARD_12H" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: timeFormat === "STANDARD_12H" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                ⏰ 12H AM/PM
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat("STANDARD_24H")}
                style={{
                  padding: "5px 4px",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: timeFormat === "STANDARD_24H" ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: timeFormat === "STANDARD_24H" ? "#FFFFFF" : "var(--color-dark)",
                }}
              >
                ⏱️ 24H
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeQuickToggle;
