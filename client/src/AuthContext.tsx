import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContextData";
import { isTokenValid } from "./utils/tokenUtils";

const isDevMode = import.meta.env.DEV;
const isAuthBypassEnabled =
  isDevMode && import.meta.env.VITE_BYPASS_AUTH === "true";
const bypassRole = import.meta.env.VITE_BYPASS_AUTH_ROLE || "admin";
const bypassUserId = import.meta.env.VITE_BYPASS_AUTH_USER_ID || "test-user";
const bypassToken = "bypass-token";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const storedToken = localStorage.getItem("token");
  // Clear stale/expired tokens on initialization
  const tokenIsValid = isAuthBypassEnabled || isTokenValid(storedToken);
  const initialToken = tokenIsValid ? (storedToken || (isAuthBypassEnabled ? bypassToken : null)) : null;
  const initialRole = tokenIsValid ? (localStorage.getItem("role") || (isAuthBypassEnabled ? bypassRole : null)) : null;
  const initialUserId = tokenIsValid ? (localStorage.getItem("userId") || (isAuthBypassEnabled ? bypassUserId : null)) : null;

  // If token was invalid, clean up localStorage immediately
  if (!tokenIsValid && storedToken) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  }

  const [token, setToken] = useState<string | null>(
    initialToken,
  );
  const [role, setRole] = useState<string | null>(initialRole);
  const [userId, setUserId] = useState<string | null>(
    initialUserId,
  );

  useEffect(() => {
    if (isAuthBypassEnabled && (!token || !role || !userId)) {
      setToken(bypassToken);
      setRole(bypassRole);
      setUserId(bypassUserId);
    }
  }, [token, role, userId]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  }, [token, role, userId]);

  const login = (newToken: string, newRole: string, newUserId: string) => {
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
  };

  const logout = () => {
    if (isAuthBypassEnabled) {
      setToken(bypassToken);
      setRole(bypassRole);
      setUserId(bypassUserId);
      return;
    }

    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
