import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Protected Route Component
 * Redirects to home if user is not authenticated
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.requireOwner] - If true, requires user to be an owner
 */
export function ProtectedRoute({ children, requireOwner = false }) {
  const { isLoggedIn, isOwner, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div className="spin" style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--green)',
          borderRadius: '50%'
        }} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
