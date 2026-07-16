// frontend/src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user || !localStorage.getItem('access_token')) return <Navigate to="/login" replace />;

  if (!user.is_verified && user.role !== 'admin') {
    const email = user.email ? `?email=${encodeURIComponent(user.email)}` : '';
    return <Navigate to={`/verify-email${email}`} replace />;
  }

  return children;
}

export default ProtectedRoute;
