//App.js
import { useEffect } from "react";
import { useAuthContext } from "./contexts/AuthContext";
import { Routes, Route } from "react-router-dom";
import './App.css';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import ProtectedRoute from "./helpers/ProtectedRoute";

//pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  const { user, userType, logout } = useAuthContext();

  useEffect(() => {
    console.log(user)
    console.log(userType)
    // logout()
  }, [])

  return (
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute allowedRoles={['Student', 'Admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        <ToastContainer />
      </>
  );
}


export default App;
