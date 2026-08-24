// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("veloura_theme") || "light";
  });

  const [actualTheme, setActualTheme] = useState("light");

  useEffect(() => {
    const updateAppliedTheme = () => {
      let resolved = theme;
      if (theme === "system") {
        const isSystemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolved = isSystemDark ? "dark" : "light";
      }

      setActualTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
      document.body.setAttribute("data-theme", resolved);
    };

    updateAppliedTheme();
    localStorage.setItem("veloura_theme", theme);

    if (theme === "system" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateAppliedTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = actualTheme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        actualTheme,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "light",
      actualTheme: "light",
      isDark: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};

export default ThemeContext;
