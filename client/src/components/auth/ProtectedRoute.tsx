import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no roles are specified or user role is included in allowed roles, render child routes
  if (!allowedRoles.length || (user && allowedRoles.includes(user.role))) {
    return <Outlet />;
  }

  // If user's role is not allowed, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;
