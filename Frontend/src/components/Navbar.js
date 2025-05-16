import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./navbar-fixed.css";
import "../styles/brand-colors.css"; // Import brand colors
import logo from "../assets/Picasso white.png"; // Import the logo
import { API_BASE_URL } from "../App";

function Navbar({ userName, userRole }) {
  const navigate = useNavigate();
  
  // If no userName, don't render the navbar at all
  if (!userName) {
    return null;
  }
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const userInitials = getInitials(userName);
  
  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logout successful");
        navigate("/login"); // Use navigate instead of window.location
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const handleNavigation = (path, event) => {
    event.preventDefault();
    navigate(path);
  };

  const isAdmin = userRole === "admin";
  
  // Generate a random pastel color based on username
  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate pastel color
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };

  return (
    <nav className="navbar navbar-expand-md fixed-top navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Picasso Design Agency"
            height="40"
            className="d-inline-block align-top me-2"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            {/* Home and Admin Panel links removed */}
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "40px", 
                    height: "40px", 
                    backgroundColor: getAvatarColor(userName),
                    color: "#333",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}
                >
                  {userInitials}
                </div>
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li className="dropdown-header">
                  {userName}
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/change-password">
                    Change Password
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={logout}>
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
