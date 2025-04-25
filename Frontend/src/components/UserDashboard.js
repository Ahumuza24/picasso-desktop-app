import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/brand-colors.css";

const UserDashboard = ({ userName }) => {
  const [driveUrl, setDriveUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch drive URL");
        }

        const data = await response.json();
        setDriveUrl(data.drive_url);
        setDomain(data.domain);
        setError("");
      } catch (err) {
        console.error("Error fetching drive URL:", err);
        setError("Unable to load your drive folder. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userName) {
      fetchDriveUrl();
    } else {
      setLoading(false);
    }
  }, [userName, navigate]);

  const handleOpenDrive = () => {
    if (driveUrl) {
      window.open(driveUrl, "_blank");
    }
  };

  if (!userName) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please log in to access your drive folder.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card shadow mb-4">
            <div className="card-body text-center p-5">
              <h2 className="card-title mb-4">Welcome, {userName}!</h2>

              {loading ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <>
                  
                  <p className="mb-4">Your Brand Collateral is ready for access.</p>
                  <button
                    className="btn btn-primary btn-lg px-5 py-3"
                    onClick={handleOpenDrive}
                    disabled={!driveUrl}
                  >
                    Open My Folder
                  </button>
                </>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 