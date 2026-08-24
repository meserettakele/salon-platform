// src/components/common/AdaptiveDatePicker.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDateTime } from "../../context/DateTimeContext";
import {
  ETHIOPIAN_MONTHS_AMHARIC,
  ETHIOPIAN_MONTHS_ENGLISH,
  ETHIOPIAN_DAYS_AMHARIC,
  ETHIOPIAN_DAYS_ENGLISH,
  getDaysInEthiopianMonth,
  toEthiopian,
  toGregorian,
  formatEthiopianDate,
} from "../../utils/ethiopianDate";

const GREGORIAN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const GREGORIAN_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Adaptive Date Picker supporting Ethiopian (Ge'ez) and Gregorian Calendars
 * @param {string} value - ISO Gregorian Date string 'YYYY-MM-DD'
 * @param {function} onChange - Callback receiving 'YYYY-MM-DD'
 * @param {string} [minDate] - Minimum selectable Gregorian Date string 'YYYY-MM-DD'
 * @param {Array} [closedDays] - Array of day names/indexes that are closed
 */
const AdaptiveDatePicker = ({
  value,
  onChange,
  minDate,
  closedDays = [],
  label = "Select Appointment Date",
}) => {
  const { calendarType, setCalendarType, language } = useDateTime();

  // Current viewed calendar page
  const selectedDateObj = useMemo(() => {
    if (value) {
      const parts = value.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  }, [value]);

  // Active Ethiopian state
  const selectedEth = useMemo(() => toEthiopian(selectedDateObj), [selectedDateObj]);
  const [viewEthYear, setViewEthYear] = useState(selectedEth.year);
  const [viewEthMonth, setViewEthMonth] = useState(selectedEth.month);

  // Active Gregorian state
  const [viewGregYear, setViewGregYear] = useState(selectedDateObj.getFullYear());
  const [viewGregMonth, setViewGregMonth] = useState(selectedDateObj.getMonth() + 1);

  // Sync viewed month when value changes
  useEffect(() => {
    const eth = toEthiopian(selectedDateObj);
    setViewEthYear(eth.year);
    setViewEthMonth(eth.month);
    setViewGregYear(selectedDateObj.getFullYear());
    setViewGregMonth(selectedDateObj.getMonth() + 1);
  }, [value]);

  const minDateObj = useMemo(() => {
    if (minDate) {
      const parts = minDate.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
  }, [minDate]);

  // --- ETHIOPIAN CALENDAR NAVIGATION ---
  const handlePrevEthMonth = () => {
    if (viewEthMonth === 1) {
      setViewEthMonth(13);
      setViewEthYear((prev) => prev - 1);
    } else {
      setViewEthMonth((prev) => prev - 1);
    }
  };

  const handleNextEthMonth = () => {
    if (viewEthMonth === 13) {
      setViewEthMonth(1);
      setViewEthYear((prev) => prev + 1);
    } else {
      setViewEthMonth((prev) => prev + 1);
    }
  };

  // --- GREGORIAN CALENDAR NAVIGATION ---
  const handlePrevGregMonth = () => {
    if (viewGregMonth === 1) {
      setViewGregMonth(12);
      setViewGregYear((prev) => prev - 1);
    } else {
      setViewGregMonth((prev) => prev - 1);
    }
  };

  const handleNextGregMonth = () => {
    if (viewGregMonth === 12) {
      setViewGregMonth(1);
      setViewGregYear((prev) => prev + 1);
    } else {
      setViewGregMonth((prev) => prev + 1);
    }
  };

  // --- SELECTION HANDLER ---
  const handleSelectEthDay = (day) => {
    const greg = toGregorian(viewEthYear, viewEthMonth, day);
    const yyyy = greg.getFullYear();
    const mm = String(greg.getMonth() + 1).padStart(2, "0");
    const dd = String(greg.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleSelectGregDay = (day) => {
    const yyyy = viewGregYear;
    const mm = String(viewGregMonth).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  // --- ETHIOPIAN GRID CALCULATION ---
  const ethDaysCount = getDaysInEthiopianMonth(viewEthYear, viewEthMonth);
  const ethFirstDayGreg = toGregorian(viewEthYear, viewEthMonth, 1);
  const ethStartWeekday = ethFirstDayGreg.getDay();

  // --- GREGORIAN GRID CALCULATION ---
  const gregDaysCount = new Date(viewGregYear, viewGregMonth, 0).getDate();
  const gregStartWeekday = new Date(viewGregYear, viewGregMonth - 1, 1).getDay();

  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const isEthDayDisabled = (day) => {
    const gregEquivalent = toGregorian(viewEthYear, viewEthMonth, day);
    gregEquivalent.setHours(0, 0, 0, 0);

    if (minDateObj) {
      const checkMin = new Date(minDateObj);
      checkMin.setHours(0, 0, 0, 0);
      if (gregEquivalent < checkMin) return true;
    }

    if (closedDays && closedDays.length > 0) {
      const dayIdx = gregEquivalent.getDay();
      const dayName = DAY_NAMES[dayIdx];
      if (
        closedDays.some(
          (cd) =>
            cd === dayIdx ||
            String(cd).toUpperCase() === dayName.toUpperCase(),
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const isGregDayDisabled = (day) => {
    const checkDate = new Date(viewGregYear, viewGregMonth - 1, day);
    checkDate.setHours(0, 0, 0, 0);

    if (minDateObj) {
      const checkMin = new Date(minDateObj);
      checkMin.setHours(0, 0, 0, 0);
      if (checkDate < checkMin) return true;
    }

    if (closedDays && closedDays.length > 0) {
      const dayIdx = checkDate.getDay();
      const dayName = DAY_NAMES[dayIdx];
      if (
        closedDays.some(
          (cd) =>
            cd === dayIdx ||
            String(cd).toUpperCase() === dayName.toUpperCase(),
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const ethMonthNames = language === "ENGLISH" ? ETHIOPIAN_MONTHS_ENGLISH : ETHIOPIAN_MONTHS_AMHARIC;
  const ethDayHeaders = language === "ENGLISH" ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] : ["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"];

  return (
    <div
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "16px",
        border: "1.5px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        padding: "16px 18px",
        maxWidth: "380px",
        width: "100%",
        boxSizing: "border-box",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Label and Mode Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--color-dark)" }}>
          {label}
        </span>

        {/* Toggle Mode */}
        <div
          style={{
            display: "flex",
            backgroundColor: "var(--color-card-subtle)",
            borderRadius: "8px",
            padding: "2px",
            border: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={() => setCalendarType("ETHIOPIAN")}
            style={{
              padding: "4px 8px",
              fontSize: "0.74rem",
              fontWeight: "700",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              backgroundColor: calendarType === "ETHIOPIAN" ? "var(--color-primary)" : "transparent",
              color: calendarType === "ETHIOPIAN" ? "#FFFFFF" : "var(--color-muted)",
              transition: "all 0.15s ease",
            }}
          >
            🇪🇹 Ethiopian
          </button>
          <button
            type="button"
            onClick={() => setCalendarType("GREGORIAN")}
            style={{
              padding: "4px 8px",
              fontSize: "0.74rem",
              fontWeight: "700",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              backgroundColor: calendarType === "GREGORIAN" ? "var(--color-primary)" : "transparent",
              color: calendarType === "GREGORIAN" ? "#FFFFFF" : "var(--color-muted)",
              transition: "all 0.15s ease",
            }}
          >
            🌍 European
          </button>
        </div>
      </div>

      {/* Selected Date Summary Badge */}
      <div
        style={{
          backgroundColor: "var(--color-primary-light)",
          border: "1px solid rgba(216, 69, 112, 0.2)",
          borderRadius: "10px",
          padding: "8px 12px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "0.76rem", fontWeight: "600", color: "var(--color-muted)" }}>
          Selected:
        </span>
        <span
          style={{
            fontSize: "0.88rem",
            fontWeight: "800",
            color: "var(--color-primary)",
            textAlign: "right",
            overflowWrap: "anywhere",
          }}
        >
          {calendarType === "ETHIOPIAN"
            ? formatEthiopianDate(selectedDateObj, { language, includeWeekday: true })
            : selectedDateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* ─── ETHIOPIAN CALENDAR VIEW ─── */}
      {calendarType === "ETHIOPIAN" && (
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          {/* Header Month/Year Selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <button
              type="button"
              onClick={handlePrevEthMonth}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-dark)",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              ←
            </button>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-dark)" }}>
                {ethMonthNames[viewEthMonth - 1]} {viewEthYear} ዓ.ም.
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextEthMonth}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-dark)",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              →
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              textAlign: "center",
              marginBottom: "6px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {ethDayHeaders.map((dh, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  color: "var(--color-muted)",
                  padding: "2px 0",
                  display: "block",
                  textAlign: "center",
                }}
              >
                {dh}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Blank leading days */}
            {Array.from({ length: ethStartWeekday }).map((_, i) => (
              <div key={`blank-${i}`} style={{ width: "100%", minWidth: 0 }} />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: ethDaysCount }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedEth.year === viewEthYear &&
                selectedEth.month === viewEthMonth &&
                selectedEth.day === day;
              const disabled = isEthDayDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectEthDay(day)}
                  style={{
                    width: "100%",
                    minWidth: "0",
                    height: "34px",
                    padding: 0,
                    margin: 0,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: isSelected ? "none" : "1px solid var(--color-border)",
                    backgroundColor: isSelected
                      ? "var(--color-primary)"
                      : disabled
                      ? "var(--color-card-subtle)"
                      : "var(--color-card)",
                    color: isSelected
                      ? "#FFFFFF"
                      : disabled
                      ? "var(--color-muted-light)"
                      : "var(--color-dark)",
                    fontWeight: isSelected ? "800" : "600",
                    fontSize: "0.82rem",
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 3px 8px rgba(216, 69, 112, 0.3)" : "none",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── GREGORIAN CALENDAR VIEW ─── */}
      {calendarType === "GREGORIAN" && (
        <div style={{ width: "100%", boxSizing: "border-box" }}>
          {/* Header Month/Year Selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <button
              type="button"
              onClick={handlePrevGregMonth}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-dark)",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              ←
            </button>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-dark)" }}>
                {GREGORIAN_MONTHS[viewGregMonth - 1]} {viewGregYear}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextGregMonth}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-dark)",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              →
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              textAlign: "center",
              marginBottom: "6px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {GREGORIAN_DAYS.map((dh, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  color: "var(--color-muted)",
                  padding: "2px 0",
                  display: "block",
                  textAlign: "center",
                }}
              >
                {dh}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "4px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Blank leading days */}
            {Array.from({ length: gregStartWeekday }).map((_, i) => (
              <div key={`blank-greg-${i}`} style={{ width: "100%", minWidth: 0 }} />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: gregDaysCount }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDateObj.getFullYear() === viewGregYear &&
                selectedDateObj.getMonth() + 1 === viewGregMonth &&
                selectedDateObj.getDate() === day;
              const disabled = isGregDayDisabled(day);

              return (
                <button
                  key={`greg-${day}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectGregDay(day)}
                  style={{
                    width: "100%",
                    minWidth: "0",
                    height: "34px",
                    padding: 0,
                    margin: 0,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: isSelected ? "none" : "1px solid var(--color-border)",
                    backgroundColor: isSelected
                      ? "var(--color-primary)"
                      : disabled
                      ? "var(--color-card-subtle)"
                      : "var(--color-card)",
                    color: isSelected
                      ? "#FFFFFF"
                      : disabled
                      ? "var(--color-muted-light)"
                      : "var(--color-dark)",
                    fontWeight: isSelected ? "800" : "600",
                    fontSize: "0.82rem",
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 3px 8px rgba(216, 69, 112, 0.3)" : "none",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveDatePicker;
