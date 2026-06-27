import React from 'react';
import { Navigate } from 'react-router';
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
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole && profile) {
    const roleHierarchy = { admin: 4, manager: 3, rep: 2, fan: 1 };
    if ((roleHierarchy[profile.role] || 0) < (roleHierarchy[requiredRole] || 0)) {
      if (profile.role === 'fan') {
        return <Navigate to="/fan-center" replace />;
      }
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
