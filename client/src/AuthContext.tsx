import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContextData";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem("userId"),
  );

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
