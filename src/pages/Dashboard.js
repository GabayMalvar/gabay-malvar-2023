import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

const Menu = () => {
  const { user, userType, logout } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on userType when the component mounts and when userType changes
    console.log(user)
    if (user) {
      switch (userType) {
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        case 'Student':
          navigate('/student-dashboard');
          break;
        default:
          // Handle any other user types or if userType is not set
          toast.warn('User type is not recognized or not set');
          logout(); // optional: log the user out if userType is unknown
          navigate('/login'); // redirect to login page or a default route
      }
    }
  }, [user, userType, navigate, logout]);

  // If still determining the user type, show a loading indicator
  if (!userType) {
    return <Loading />;
  }

  // No need to display buttons for navigation since useEffect will handle it
  return null;
};

export default Menu;
