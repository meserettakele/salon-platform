// src/components/common/Loader.jsx
import React from "react";

export const Loader = ({ size = "40px", color = "var(--color-primary)" }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid var(--color-border)",
          borderTopColor: color,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
};
export default Loader;
