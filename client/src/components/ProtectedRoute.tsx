import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, role } = useAuth();

  if (!token) {
    // Not authenticated, redirect to login page
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
