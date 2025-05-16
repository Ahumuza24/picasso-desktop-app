// App.js

import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/brand-colors.css";
import { checkBackendStatus, startBackend, showMessage, tryMultiplePorts, getBackendUrl, setBackendUrl } from "./tauri-integration";

// Create a context for the backend URL
export const BackendContext = createContext();

// Custom hook to use the backend context
export const useBackend = () => useContext(BackendContext);

// Base URL for API requests - will be updated dynamically if needed
const DEFAULT_API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

// Initialize the API_BASE_URL
const API_BASE_URL = getBackendUrl() || DEFAULT_API_URL;

// Export API_BASE_URL for use in other components
export { API_BASE_URL };

// Wrapper component to use location
function AppContent() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [backendReady, setBackendReady] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const location = useLocation();

  // Initialize backend connection
  useEffect(() => {
    const initBackend = async () => {
      try {
        console.log("Initializing backend connection...");
        
        // First try to check if backend is already running
        const isRunning = await checkBackendStatus();
        console.log("Backend running status:", isRunning);
        
        if (!isRunning) {
          console.log("Backend not running, attempting to start...");
          const started = await startBackend();
          if (!started) {
            throw new Error("Failed to start backend");
          }
        }
        
        // Try to connect to the backend
        console.log("Attempting to connect to backend...");
        const result = await tryMultiplePorts();
        
        if (result && result.success) {
          console.log("Successfully connected to backend at:", result.url);
          setBackendUrl(result.url);
          setBackendReady(true);
          setBackendError(null);
        } else {
          throw new Error("Could not connect to backend on any port");
        }
      } catch (error) {
        console.error("Backend initialization failed:", error);
        setBackendError("Failed to connect to backend. Please restart the application.");
        showMessage("Connection Error", "Failed to connect to the backend server. Please restart the application.", "error");
      }
    };

    initBackend();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
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

  // Show error state if backend connection failed
  if (backendError) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-danger mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Connection Error</h4>
          <p className="text-muted">{backendError}</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (!backendReady) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Starting Application</h4>
          <p className="text-muted">Please wait while we connect to the backend...</p>
        </div>
      </div>
    );
  }

  // Main app content
  return (
    <BackendContext.Provider value={{ backendUrl: getBackendUrl() }}>
      {!location.pathname.includes("/login") && !location.pathname.includes("/register") && (
        <Navbar userName={userName} userRole={userRole} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BackendContext.Provider>
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
