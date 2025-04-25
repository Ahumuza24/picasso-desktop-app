import React, { useState, useEffect } from "react";
import UserDashboard from "../components/UserDashboard";
import AdminDashboard from "../components/AdminDashboard";
import "../styles/brand-colors.css"; // Import brand colors
import "../styles/no-scroll.css"; // Import no-scroll styles
import logo from "../assets/Picasso Official logos-02.png"; // Import the logo

const HomePage = ({ userName, userRole }) => {
  const [driveUrl, setDriveUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch drive URL if the user is logged in and not an admin
    if (userName && userRole !== "admin") {
      fetchDriveUrl();
    }

    // Fix scrolling issues - disable scrolling on login page, enable on admin dashboard
    if (!userName) {
      // Add no-scroll classes
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
      document.getElementById('root').classList.add('no-scroll');
    } else {
      // Remove no-scroll classes for authenticated users
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      document.getElementById('root').classList.remove('no-scroll');
    }

    return () => {
      // Cleanup - remove classes when component unmounts
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      if (document.getElementById('root')) {
        document.getElementById('root').classList.remove('no-scroll');
      }
    };
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
      <div className="no-scroll-container" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="row justify-content-center w-100">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="Picasso Design Agency"
                    className="img-fluid mb-4"
                    style={{ maxWidth: "250px" }}
                  />
                  {/* <h1 className="display-6 fw-bold text-primary mb-3">Welcome to Picasso</h1> */}
                  <p className="lead mb-4">
                    Access your organization's design resources and assets
                  </p>
                </div>
                
                <div className="d-grid gap-2">
                  <a href="/login" className="btn btn-primary btn-lg py-3 shadow-sm">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                  </a>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-muted">
                    We Create Perception
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // When user is logged in, use a different layout that allows scrolling
  return (
    <div className="overflow-auto" style={{ paddingTop: "60px" }}>
      <div className="container-fluid pb-5">
        {userRole === "admin" ? (
          <AdminDashboard userName={userName} />
        ) : loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <UserDashboard userName={userName} driveUrl={driveUrl} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
