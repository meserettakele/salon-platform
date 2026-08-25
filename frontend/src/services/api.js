// src/services/api.js
import axios from "axios";

// Base API URL with fallback
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://salon-platform-13xi.onrender.com/api/v1";

export const BACKEND_SERVER_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const pathStr =
    typeof imagePath === "string"
      ? imagePath
      : imagePath.imageUrl || imagePath.url || "";
  if (!pathStr) return "";
  if (pathStr.startsWith("http://") || pathStr.startsWith("https://")) return pathStr;
  const cleanPath = pathStr.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_SERVER_URL}/${cleanPath}`;
};

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Outbound request interception for authorization token attachment
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response layer interceptor verifying structural integrity response payload format
API.interceptors.response.use(
  (response) => {
    // Normalizes expected backend contract structure directly { success, message, data }
    return response.data;
  },
  (error) => {
    const fallbackResponse = {
      success: false,
      message:
        "A network disruption or server verification exception occurred.",
      data: null,
    };

    if (error.response) {
      fallbackResponse.message =
        error.response.data?.message || fallbackResponse.message;

      if (error.response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }

    return Promise.reject(fallbackResponse);
  },
);

export default API;
