import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standard initialization from localized profile persistence engine
    const storedUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const response = await authService.login(phone, password);
      if (response.success && response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Open Google popup and get Firebase credential
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Exchange Firebase token for your app's JWT
      const response = await authService.googleLogin(idToken);

      if (response.success && response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = useCallback((updatedData) => {
    if (!updatedData) return;
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem("auth_user", JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be executed within an authorized AuthProvider enclosure",
    );
  }
  return context;
};
