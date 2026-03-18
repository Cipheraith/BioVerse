import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { isTokenValid } from "./utils/tokenUtils";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, role, logout } = useAuth();

  if (!token || !isTokenValid(token)) {
    // Not authenticated or token expired — clear state and redirect to login
    if (token) logout();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Authenticated but not authorized, redirect to dashboard or an unauthorized page
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
