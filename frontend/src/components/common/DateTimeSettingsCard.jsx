// src/components/common/DateTimeSettingsCard.jsx
import React from "react";
import { useDateTime } from "../../context/DateTimeContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { Card } from "./Card";
import { TelegramSettingsCard } from "./TelegramSettingsCard";

export const DateTimeSettingsCard = () => {
  const {
    calendarType,
    setCalendarType,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    formatDate,
    formatTime,
  } = useDateTime();

  const { theme, setTheme } = useTheme();
  const { currentLang, setLanguage: setAppLang, supportedLanguages, t } = useLanguage();

  const now = new Date();

  return (
    <>
    <Card
      style={{
        marginTop: "24px",
        border: "1.5px solid var(--color-border)",
        borderRadius: "16px",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: "var(--color-card)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "1.5rem" }}>⚙️</span>
          <h3
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              overflowWrap: "break-word",
            }}
          >
            {t("preferences")}
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--color-muted)",
            lineHeight: "1.5",
            overflowWrap: "break-word",
          }}
        >
          Customize theme appearance, interface language, Ethiopian/Gregorian calendars, and time systems across your Veloura account.
        </p>
      </div>

      {/* Live Preview Box */}
      <div
        style={{
          backgroundColor: "var(--color-primary-light)",
          border: "1px solid rgba(216, 69, 112, 0.2)",
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div style={{ minWidth: "0", flex: "1 1 200px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              letterSpacing: "0.06em",
              display: "block",
            }}
          >
            Live Preview
          </span>
          <div
            style={{
              fontSize: "1.02rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              marginTop: "3px",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {formatDate(now, { includeWeekday: true })} · {formatTime(now)}
          </div>
        </div>
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: "700",
            backgroundColor: "var(--color-card)",
            padding: "4px 10px",
            borderRadius: "999px",
            border: "1px solid rgba(216, 69, 112, 0.3)",
            color: "var(--color-primary)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {calendarType === "ETHIOPIAN" ? "🇪🇹 Ethiopian System" : "🌍 European System"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "22px", width: "100%", boxSizing: "border-box" }}>
        {/* 1. Theme Mode Selection */}
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              marginBottom: "8px",
            }}
          >
            1. {t("theme")}
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => setTheme("light")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: theme === "light" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: theme === "light" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                color: "var(--color-dark)",
                fontWeight: "700",
                fontSize: "0.85rem",
              }}
            >
              <span>☀️</span>
              <span>{t("lightTheme")}</span>
              {theme === "light" && <span style={{ marginLeft: "auto", color: "var(--color-primary)" }}>✓</span>}
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: theme === "dark" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: theme === "dark" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                color: "var(--color-dark)",
                fontWeight: "700",
                fontSize: "0.85rem",
              }}
            >
              <span>🌙</span>
              <span>{t("darkTheme")}</span>
              {theme === "dark" && <span style={{ marginLeft: "auto", color: "var(--color-primary)" }}>✓</span>}
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: theme === "system" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: theme === "system" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                color: "var(--color-dark)",
                fontWeight: "700",
                fontSize: "0.85rem",
              }}
            >
              <span>💻</span>
              <span>{t("systemTheme")}</span>
              {theme === "system" && <span style={{ marginLeft: "auto", color: "var(--color-primary)" }}>✓</span>}
            </button>
          </div>
        </div>

        {/* 2. Language Selection */}
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              marginBottom: "8px",
            }}
          >
            2. {t("language")}
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {supportedLanguages.map((langItem) => {
              const isSelected = currentLang === langItem.code;
              return (
                <button
                  key={langItem.code}
                  type="button"
                  onClick={() => setAppLang(langItem.code)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                    backgroundColor: isSelected ? "var(--color-primary-light)" : "var(--color-card)",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{langItem.flag}</span>
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--color-dark)", whiteSpace: "nowrap" }}>
                      {langItem.nativeName}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ marginLeft: "auto", color: "var(--color-primary)", fontWeight: "bold", fontSize: "0.85rem" }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Calendar System Selection */}
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              marginBottom: "8px",
            }}
          >
            3. Calendar System
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => setCalendarType("ETHIOPIAN")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "14px 16px",
                borderRadius: "12px",
                border: calendarType === "ETHIOPIAN" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: calendarType === "ETHIOPIAN" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-dark)" }}>
                  🇪🇹 Ethiopian Calendar
                </span>
                {calendarType === "ETHIOPIAN" && (
                  <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>✓</span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-muted)",
                  marginTop: "6px",
                  lineHeight: "1.4",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  display: "block",
                  width: "100%",
                }}
              >
                13 Months (መስከረም — ጳጉሜ), Ge'ez leap year rules (ዓ.ም.)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCalendarType("GREGORIAN")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "14px 16px",
                borderRadius: "12px",
                border: calendarType === "GREGORIAN" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: calendarType === "GREGORIAN" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-dark)" }}>
                  🌍 European / Gregorian
                </span>
                {calendarType === "GREGORIAN" && (
                  <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>✓</span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-muted)",
                  marginTop: "6px",
                  lineHeight: "1.4",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  display: "block",
                  width: "100%",
                }}
              >
                Standard 12 Months (January — December, G.C.)
              </span>
            </button>
          </div>
        </div>

        {/* 4. Time Format Selection */}
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              marginBottom: "8px",
            }}
          >
            4. Time Format & Daily Cycle
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => setTimeFormat("ETHIOPIAN_12H")}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: timeFormat === "ETHIOPIAN_12H" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: timeFormat === "ETHIOPIAN_12H" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div style={{ fontWeight: "800", fontSize: "0.88rem", color: "var(--color-dark)" }}>
                🇪🇹 Ethiopian 12-Hour
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-muted)",
                  marginTop: "4px",
                  overflowWrap: "break-word",
                }}
              >
                e.g. 2:30 ጠዋት, 8:00 ከሰዓት
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTimeFormat("STANDARD_12H")}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: timeFormat === "STANDARD_12H" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: timeFormat === "STANDARD_12H" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div style={{ fontWeight: "800", fontSize: "0.88rem", color: "var(--color-dark)" }}>
                ⏰ Standard 12-Hour
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-muted)",
                  marginTop: "4px",
                  overflowWrap: "break-word",
                }}
              >
                e.g. 8:30 AM, 2:00 PM
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTimeFormat("STANDARD_24H")}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: timeFormat === "STANDARD_24H" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: timeFormat === "STANDARD_24H" ? "var(--color-primary-light)" : "var(--color-card)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div style={{ fontWeight: "800", fontSize: "0.88rem", color: "var(--color-dark)" }}>
                ⏱️ Standard 24-Hour
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-muted)",
                  marginTop: "4px",
                  overflowWrap: "break-word",
                }}
              >
                e.g. 08:30, 14:00
              </div>
            </button>
          </div>
        </div>

        {/* 5. Ethiopian Month Label Script */}
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "800",
              color: "var(--color-dark)",
              marginBottom: "8px",
            }}
          >
            5. Ethiopian Month Script
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              onClick={() => setLanguage("AMHARIC")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: language === "AMHARIC" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: language === "AMHARIC" ? "var(--color-primary-light)" : "var(--color-card)",
                fontWeight: "700",
                fontSize: "0.82rem",
                color: language === "AMHARIC" ? "var(--color-primary)" : "var(--color-dark)",
                cursor: "pointer",
                boxSizing: "border-box",
                overflowWrap: "break-word",
              }}
            >
              🇪🇹 አማርኛ (መስከረም፣ ጥቅምት...)
            </button>

            <button
              type="button"
              onClick={() => setLanguage("ENGLISH")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: language === "ENGLISH" ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                backgroundColor: language === "ENGLISH" ? "var(--color-primary-light)" : "var(--color-card)",
                fontWeight: "700",
                fontSize: "0.82rem",
                color: language === "ENGLISH" ? "var(--color-primary)" : "var(--color-dark)",
                cursor: "pointer",
                boxSizing: "border-box",
                overflowWrap: "break-word",
              }}
            >
              🇬🇧 English (Meskerem, Tikimt...)
            </button>
          </div>
        </div>
      </div>
    </Card>

    <TelegramSettingsCard />
    </>
  );
};

export default DateTimeSettingsCard;
