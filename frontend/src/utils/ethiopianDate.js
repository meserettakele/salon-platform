// src/utils/ethiopianDate.js

/**
 * Ethiopian Calendar (Ge'ez) and 12-Hour Time Engine
 *
 * Mathematical properties:
 * - 12 months with 30 days each.
 * - 13th month (Pagume / ጳጉሜ) has 5 days (6 in leap years).
 * - An Ethiopian year is a leap year if (year + 1) % 4 === 0.
 * - Ethiopian Era is 7 or 8 years behind Gregorian calendar.
 * - Meskerem 1 corresponds to September 11 (or September 12 in the year preceding a Gregorian leap year).
 *
 * Ethiopian Time:
 * - Ethiopian 12-hour clock starts at sunrise (6:00 AM Gregorian is 12:00 ጠዋት).
 * - 7:00 AM = 1:00 ጠዋት (Tewat)
 * - 12:00 PM = 6:00 ከሰዓት (Keser / Qen)
 * - 1:00 PM = 7:00 ከሰዓት (Keser)
 * - 6:00 PM = 12:00 ማታ / ምሽት (Meshet)
 * - 7:00 PM = 1:00 ማታ / ምሽት (Mata)
 * - 12:00 AM = 6:00 ሌሊት (Lelit)
 */

export const ETHIOPIAN_MONTHS_AMHARIC = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
];

export const ETHIOPIAN_MONTHS_ENGLISH = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yakatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

export const ETHIOPIAN_DAYS_AMHARIC = [
  "እሑድ",
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
];

export const ETHIOPIAN_DAYS_ENGLISH = [
  "Ehud (Sun)",
  "Segno (Mon)",
  "Maksegno (Tue)",
  "Rebu (Wed)",
  "Hamus (Thu)",
  "Arb (Fri)",
  "Kidame (Sat)",
];

// --- JDN (Julian Day Number) Algorithms ---

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

function jdnToEthiopian(jdn) {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const year =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  return { year, month, day };
}

function ethiopianToJDN(year, month, day) {
  return (
    1723856 +
    365 * year +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

/**
 * Checks if an Ethiopian year is a leap year (Pagume has 6 days)
 */
export function isEthiopianLeapYear(ethYear) {
  return (ethYear + 1) % 4 === 0;
}

/**
 * Gets number of days in an Ethiopian month
 */
export function getDaysInEthiopianMonth(ethYear, ethMonth) {
  if (ethMonth >= 1 && ethMonth <= 12) return 30;
  if (ethMonth === 13) return isEthiopianLeapYear(ethYear) ? 6 : 5;
  return 30;
}

/**
 * Converts a Gregorian Date object or ISO string to Ethiopian Date
 * @param {Date|string|number} date
 * @returns {{ year: number, month: number, day: number }}
 */
export function toEthiopian(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return { year: 2018, month: 1, day: 1 };
  }
  const jdn = gregorianToJDN(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return jdnToEthiopian(jdn);
}

/**
 * Converts an Ethiopian Date (year, month, day) to Gregorian Date object
 * @param {number} ethYear
 * @param {number} ethMonth (1-13)
 * @param {number} ethDay (1-30)
 * @returns {Date}
 */
export function toGregorian(ethYear, ethMonth, ethDay) {
  const jdn = ethiopianToJDN(ethYear, ethMonth, ethDay);
  const { year, month, day } = jdnToGregorian(jdn);
  return new Date(year, month - 1, day);
}

/**
 * Formats a date into Ethiopian representation
 * @param {Date|string} date
 * @param {Object} options
 * @param {'AMHARIC'|'ENGLISH'} [options.language='AMHARIC']
 * @param {boolean} [options.includeWeekday=false]
 * @param {boolean} [options.includeEra=true]
 */
export function formatEthiopianDate(date, options = {}) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);

  const { language = "AMHARIC", includeWeekday = false, includeEra = true } = options;
  const eth = toEthiopian(d);

  const monthName =
    language === "ENGLISH"
      ? ETHIOPIAN_MONTHS_ENGLISH[eth.month - 1]
      : ETHIOPIAN_MONTHS_AMHARIC[eth.month - 1];

  let formatted = `${monthName} ${eth.day}, ${eth.year}`;
  if (includeEra) {
    formatted += language === "ENGLISH" ? " E.C." : " ዓ.ም.";
  }

  if (includeWeekday) {
    const dayOfWeek = d.getDay();
    const weekdayName =
      language === "ENGLISH"
        ? ETHIOPIAN_DAYS_ENGLISH[dayOfWeek]
        : ETHIOPIAN_DAYS_AMHARIC[dayOfWeek];
    formatted = `${weekdayName}፣ ${formatted}`;
  }

  return formatted;
}

/**
 * Formats time into Ethiopian 12-Hour System
 * @param {string|Date} time - e.g. "14:30", "08:00:00", or a Date object
 * @param {'AMHARIC'|'ENGLISH'} [language='AMHARIC']
 * @returns {string} - e.g. "8:30 ከሰዓት", "2:00 ጠዋት"
 */
export function formatEthiopianTime(time, language = "AMHARIC") {
  if (!time) return "";

  let hours = 0;
  let minutes = 0;

  if (time instanceof Date) {
    hours = time.getHours();
    minutes = time.getMinutes();
  } else if (typeof time === "string") {
    if (time.includes("T") || (time.includes("-") && time.includes(":"))) {
      const parsed = new Date(time);
      if (!isNaN(parsed.getTime())) {
        hours = parsed.getHours();
        minutes = parsed.getMinutes();
      }
    } else {
      const match = time.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
    }
  }

  const ethHours = (hours + 6) % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  let periodAmharic = "ጠዋት";
  let periodEnglish = "Morning (Tewat)";

  if (hours >= 6 && hours < 12) {
    periodAmharic = "ጠዋት";
    periodEnglish = "Morning (Tewat)";
  } else if (hours >= 12 && hours < 18) {
    periodAmharic = "ከሰዓት";
    periodEnglish = "Afternoon (Keser)";
  } else if (hours >= 18 && hours < 24) {
    periodAmharic = "ምሽት";
    periodEnglish = "Evening (Meshet)";
  } else {
    periodAmharic = "ሌሊት";
    periodEnglish = "Night (Lelit)";
  }

  if (language === "ENGLISH") {
    return `${ethHours}:${formattedMinutes} ${periodEnglish}`;
  }
  return `${ethHours}:${formattedMinutes} ${periodAmharic}`;
}

/**
 * Formats time in Standard 12-Hour AM/PM
 */
export function formatStandard12H(time) {
  if (!time) return "";
  let hours = 0;
  let minutes = 0;

  if (time instanceof Date) {
    hours = time.getHours();
    minutes = time.getMinutes();
  } else if (typeof time === "string") {
    if (time.includes("T") || (time.includes("-") && time.includes(":"))) {
      const parsed = new Date(time);
      if (!isNaN(parsed.getTime())) {
        hours = parsed.getHours();
        minutes = parsed.getMinutes();
      }
    } else {
      const match = time.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
    }
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${formattedMinutes} ${ampm}`;
}

/**
 * Formats time in Standard 24-Hour
 */
export function formatStandard24H(time) {
  if (!time) return "";
  let hours = 0;
  let minutes = 0;

  if (time instanceof Date) {
    hours = time.getHours();
    minutes = time.getMinutes();
  } else if (typeof time === "string") {
    if (time.includes("T") || (time.includes("-") && time.includes(":"))) {
      const parsed = new Date(time);
      if (!isNaN(parsed.getTime())) {
        hours = parsed.getHours();
        minutes = parsed.getMinutes();
      }
    } else {
      const match = time.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }
    }
  }

  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${formattedHours}:${formattedMinutes}`;
}
