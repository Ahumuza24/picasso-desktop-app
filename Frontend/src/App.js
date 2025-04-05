// App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/brand-colors.css"; // Import brand colors

// Wrapper component to use location
function AppContent() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const responseData = await response.json();
        if (response.ok) {
          console.log(
            "Received User Data",
            responseData,
            "name",
            responseData.name,
            "role",
            responseData.role
          );
          setUserName(responseData.name);
          setUserRole(responseData.role || "user");
        } else {
          console.error("User Data not received");
          setUserName("");
          setUserRole("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName("");
        setUserRole("");
      }
    };

    fetchUserData();
  }, [location.pathname]); // Re-fetch when route changes

  return (
    <div>
      <Navbar userName={userName} userRole={userRole} />
      <Routes>
        <Route path="/" element={<HomePage userName={userName} userRole={userRole} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/admin" element={<AdminDashboard userName={userName} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
