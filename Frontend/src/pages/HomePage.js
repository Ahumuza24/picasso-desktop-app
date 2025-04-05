import React, { useState, useEffect } from "react";
import UserDashboard from "../components/UserDashboard";
import AdminDashboard from "../components/AdminDashboard";
import "../styles/brand-colors.css"; // Import brand colors

const HomePage = ({ userName, userRole }) => {
  const [driveUrl, setDriveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Only fetch drive URL if the user is logged in and not an admin
    if (userName && userRole !== "admin") {
      fetchDriveUrl();
    }
  }, [userName, userRole]);

  const fetchDriveUrl = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/user/drive", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDriveUrl(data.drive_url);
      } else {
        console.error("Failed to get drive URL");
      }
    } catch (error) {
      console.error("Error getting drive URL:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userName) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="card shadow">
          <div className="card-body py-5">
            <h1 className="display-4 mb-4">Welcome to Picasso Design Agency</h1>
            <p className="lead">
              Please log in to access your organization's design collateral.
            </p>
            <hr className="my-4" />
            <p className="mb-4">
             We Create Perception.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <a href="/login" className="btn btn-primary btn-lg">Login</a>
              <a href="/register" className="btn btn-outline-secondary btn-lg">Register</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-4">
      {userRole === "admin" ? (
        <AdminDashboard userName={userName} />
      ) : loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <UserDashboard 
          userName={userName} 
          driveUrl={driveUrl}
        />
      )}
    </div>
  );
};

export default HomePage;
