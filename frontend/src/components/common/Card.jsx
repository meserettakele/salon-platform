// src/components/common/Card.jsx
import React from "react";

export const Card = ({
  children,
  variant = "default",
  padding = "md",
  hoverable = false,
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "glass":
        return {
          backgroundColor: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--shadow-sm)",
        };
      case "elevated":
        return {
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
        };
      case "outlined":
        return {
          backgroundColor: "var(--color-card)",
          border: "1.5px solid var(--color-border)",
          boxShadow: "none",
        };
      case "interactive":
        return {
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xs)",
          cursor: "pointer",
        };
      case "default":
      default:
        return {
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case "none":
        return { padding: "0" };
      case "sm":
        return { padding: "16px" };
      case "lg":
        return { padding: "32px" };
      case "md":
      default:
        return { padding: "24px" };
    }
  };

  const isInteractive = Boolean(onClick || hoverable || variant === "interactive");

  return (
    <div
      className={`${isInteractive ? "luxury-card" : ""} ${className}`}
      onClick={onClick}
      style={{
        borderRadius: "var(--radius-ios)",
        transition: "var(--transition-premium)",
        cursor: isInteractive ? "pointer" : "default",
        ...getVariantStyles(),
        ...getPaddingStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, style = {}, className = "", ...props }) => (
  <div
    className={className}
    style={{
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, style = {}, className = "", ...props }) => (
  <h3
    className={`font-display ${className}`}
    style={{
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "var(--color-dark)",
      letterSpacing: "-0.01em",
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ children, style = {}, className = "", ...props }) => (
  <p
    className={className}
    style={{
      fontSize: "0.9rem",
      color: "var(--color-muted)",
      lineHeight: "1.5",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ children, style = {}, className = "", ...props }) => (
  <div className={className} style={{ ...style }} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, style = {}, className = "", ...props }) => (
  <div
    className={className}
    style={{
      marginTop: "20px",
      paddingTop: "16px",
      borderTop: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;

