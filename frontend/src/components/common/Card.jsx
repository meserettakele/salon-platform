// src/components/common/Card.jsx
import React from "react";

export const Card = ({ children, style = {}, onClick }) => {
  return (
    <div
      className="glass-panel"
      onClick={onClick}
      style={{
        padding: "28px",
        borderRadius: "var(--radius-ios)",
        backgroundColor: "var(--color-card)",
        transition: "var(--transition-premium)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
export default Card;
