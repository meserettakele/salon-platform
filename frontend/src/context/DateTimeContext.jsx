// src/context/DateTimeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  formatEthiopianDate,
  formatEthiopianTime,
  formatStandard12H,
  formatStandard24H,
  toEthiopian,
  toGregorian,
} from "../utils/ethiopianDate";

const DateTimeContext = createContext(null);

export const DateTimeProvider = ({ children }) => {
  // Default to Ethiopian Calendar & Ethiopian 12-Hour Time for fresh users
  const [calendarType, setCalendarTypeState] = useState(() => {
    return localStorage.getItem("veloura_calendar_pref") || "ETHIOPIAN";
  });

  const [timeFormat, setTimeFormatState] = useState(() => {
    return localStorage.getItem("veloura_time_pref") || "ETHIOPIAN_12H";
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("veloura_lang_pref") || "AMHARIC";
  });

  const setCalendarType = (type) => {
    setCalendarTypeState(type);
    localStorage.setItem("veloura_calendar_pref", type);
  };

  const setTimeFormat = (fmt) => {
    setTimeFormatState(fmt);
    localStorage.setItem("veloura_time_pref", fmt);
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("veloura_lang_pref", lang);
  };

  /**
   * Adaptive Date Formatter based on active user preference
   */
  const formatDate = (date, options = {}) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return String(date);

    if (calendarType === "ETHIOPIAN") {
      return formatEthiopianDate(d, {
        language: options.language || language,
        includeWeekday: options.includeWeekday ?? false,
        includeEra: options.includeEra ?? true,
      });
    }

    // Gregorian / European Formatter - Always in standard English
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: options.monthFormat || "short",
      day: "numeric",
      weekday: options.includeWeekday ? "short" : undefined,
    });
  };

  /**
   * Adaptive Time Formatter based on active user preference
   */
  const formatTime = (time) => {
    if (!time) return "";
    if (timeFormat === "ETHIOPIAN_12H") {
      return formatEthiopianTime(time, language);
    }
    if (timeFormat === "STANDARD_24H") {
      return formatStandard24H(time);
    }
    return formatStandard12H(time);
  };

  /**
   * Formats both Date and Time into a clean string
   */
  const formatDateTime = (date, time) => {
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(time || date);
    return `${formattedDate} · ${formattedTime}`;
  };

  return (
    <DateTimeContext.Provider
      value={{
        calendarType,
        timeFormat,
        language,
        setCalendarType,
        setTimeFormat,
        setLanguage,
        formatDate,
        formatTime,
        formatDateTime,
        toEthiopian,
        toGregorian,
      }}
    >
      {children}
    </DateTimeContext.Provider>
  );
};

export const useDateTime = () => {
  const context = useContext(DateTimeContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      calendarType: "ETHIOPIAN",
      timeFormat: "ETHIOPIAN_12H",
      language: "AMHARIC",
      setCalendarType: () => {},
      setTimeFormat: () => {},
      setLanguage: () => {},
      formatDate: (d) => formatEthiopianDate(d),
      formatTime: (t) => formatEthiopianTime(t),
      formatDateTime: (d, t) => `${formatEthiopianDate(d)} · ${formatEthiopianTime(t || d)}`,
      toEthiopian,
      toGregorian,
    };
  }
  return context;
};

export default DateTimeContext;
