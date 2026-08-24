// src/components/common/Loader.jsx
import React from "react";

export const Loader = ({
  size = "40px",
  color = "var(--color-primary)",
  text,
  fullPage = false,
  style = {},
}) => {
  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        padding: "24px",
        ...style,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "3px solid var(--color-border)",
            borderTopColor: color,
            borderRadius: "50%",
            animation: "spin 0.9s cubic-bezier(0.6, 0.2, 0.4, 0.9) infinite",
          }}
        />
        <div
          style={{
            width: "30%",
            height: "30%",
            backgroundColor: color,
            borderRadius: "50%",
            animation: "pulseGlow 1.4s ease-in-out infinite",
            opacity: 0.7,
          }}
        />
      </div>
      {text && (
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "var(--color-muted)",
            letterSpacing: "0.01em",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(250, 248, 245, 0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;

