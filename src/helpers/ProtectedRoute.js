import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userType } = useAuthContext();
  const [isAllowed, setIsAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only perform the check if the user is logged in
    if (user) {
      setIsAllowed(allowedRoles.includes(userType));
    } else {
      setIsAllowed(false);
    }
  }, [user, userType, allowedRoles]);

  if (!user) {
    // If user is not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  } else if (!isAllowed) {
    // If user's role is not in the allowed roles, redirect to the default route
    // The check is delayed until userType is confirmed
    return <Navigate to="/" replace />;
  }

  // If user is logged in and has the right role, render the children components
  return children;
};

export default ProtectedRoute;
