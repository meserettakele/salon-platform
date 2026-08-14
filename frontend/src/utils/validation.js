// src/utils/validation.js

/**
 * Validates Ethiopian phone numbers
 * Formats: 09xxxxxxxx, 07xxxxxxxx, +2519xxxxxxxx, +2517xxxxxxxx
 */
export const validatePhone = (phone) => {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return "Phone number is required";

  const phoneRegex = /^(?:\+251|0)?[79]\d{8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Please enter a valid Ethiopian phone number (e.g., 09xxxxxxxx or 07xxxxxxxx)";
  }
  return "";
};

/**
 * Validates standard email address format
 */
export const validateEmail = (email) => {
  const cleanEmail = email.trim();
  if (!cleanEmail) return "Email address is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return "Please enter a valid email address";
  }
  return "";
};

/**
 * Validates password length
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return "";
};

/**
 * Validates registration profile inputs matching backend payload fields
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = "Full name is required";
  }

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};
