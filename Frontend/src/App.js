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
import { checkBackendStatus, startBackend, showMessage, tryMultiplePorts } from "./tauri-integration";

// Base URL for API requests - will be updated dynamically if needed
const DEFAULT_API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";
let API_BASE_URL = DEFAULT_API_URL;

// Export API_BASE_URL for use in other components
export { API_BASE_URL };

// Wrapper component to use location
function AppContent() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [backendReady, setBackendReady] = useState(false);
  const location = useLocation();

  // Initialize backend connection
  useEffect(() => {
    const initBackend = async () => {
      const isRunning = await checkBackendStatus();
      if (!isRunning) {
        try {
          await startBackend();
          setBackendReady(true);
        } catch (error) {
          console.error("Failed to start backend:", error);
          showMessage("Error", "Failed to start the backend server. Please restart the application.", "error");
        }
      } else {
        setBackendReady(true);
      }
    };

    initBackend();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!backendReady) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const responseData = await response.json();
        if (response.ok) {
          console.log("Received User Data", responseData);
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
  }, [location.pathname, backendReady]); // Re-fetch when route changes or backend becomes ready

  return (
    <div>
      <Navbar userName={userName} userRole={userRole} />
      {!backendReady ? (
        <div className="container mt-5 text-center">
          <h2>Starting application...</h2>
          <p>Please wait while the application initializes.</p>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<HomePage userName={userName} userRole={userRole} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/admin" element={<AdminDashboard userName={userName} />} />
        </Routes>
      )}
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
