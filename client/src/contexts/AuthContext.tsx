import React, { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./AuthContextData";

interface User {
  id: string;
  username?: string;
  fullName?: string;
  role: string;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user object from localStorage
    if (token && role && userId) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Create basic user object
          setUser({
            id: userId,
            role: role,
            username: localStorage.getItem("username") || undefined,
            fullName: localStorage.getItem("fullName") || undefined,
          });
        }
      } else {
        // Create basic user object
        setUser({
          id: userId,
          role: role,
          username: localStorage.getItem("username") || undefined,
          fullName: localStorage.getItem("fullName") || undefined,
        });
      }
    }
    setLoading(false);
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
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, [token, role, userId, user]);

  const login = (newToken: string, newRole: string, newUserId: string, userData?: Partial<User>) => {
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
    
    const newUser: User = {
      id: newUserId,
      role: newRole,
      username: userData?.username,
      fullName: userData?.fullName,
    };
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
