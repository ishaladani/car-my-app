import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if user is logged in by looking for the garage token
  const isAuthenticated = localStorage.getItem('garageToken') !== null;
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;