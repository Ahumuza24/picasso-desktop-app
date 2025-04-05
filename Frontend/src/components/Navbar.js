import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./navbar-fixed.css";
import "../styles/brand-colors.css"; // Import brand colors

function Navbar({ userName, userRole }) {
  const navigate = useNavigate();
  
  const logout = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/logout`, {
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

  return (
    <nav className="navbar navbar-expand-md fixed-top navbar-custom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Drive Mapper
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
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {userName ? (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Welcome, {userName}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
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
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
