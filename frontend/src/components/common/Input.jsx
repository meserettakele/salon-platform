// src/components/common/Input.jsx
import React from "react";

export const Input = ({
  label,
  error,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  disabled = false,
  ...props
}) => {
  return (
    <div style={{ marginBottom: "20px", width: "100%" }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: "600",
            marginBottom: "8px",
            color: "var(--color-dark)",
          }}
        >
          {label}
        </label>
      )}
      <input
        className="input-base"
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          borderColor: error ? "var(--color-error)" : "var(--color-border)",
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            color: "var(--color-error)",
            fontSize: "0.8rem",
            marginTop: "6px",
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
export default Input;
