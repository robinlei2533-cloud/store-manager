import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile) {
    const roleHierarchy = { admin: 4, manager: 3, rep: 2, fan: 1 };
    if ((roleHierarchy[profile.role] || 0) < (roleHierarchy[requiredRole] || 0)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
