import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [defaultMapping, setDefaultMapping] = useState({ drive_url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [activeTab, setActiveTab] = useState("users");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Domain mapping form fields
  const [domain, setDomain] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [editingDomainId, setEditingDomainId] = useState(null);
  
  // Default mapping form field
  const [defaultDriveUrl, setDefaultDriveUrl] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Debug check for admin status
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Current user role:", userData.role);
          
          if (userData.role !== "admin") {
            setError("You need admin privileges to access this page.");
            setTimeout(() => {
              navigate("/");
            }, 1500); // Reduced time for faster redirect
            return; // Exit early to avoid other API calls
          }
          
          // Only proceed to load data if the user is an admin
          if (activeTab === "users") {
            fetchUsers();
          } else if (activeTab === "domains") {
            fetchDomains();
          } else if (activeTab === "default") {
            fetchDefaultMapping();
          }
        } else {
          // If the user endpoint fails, redirect to login
          setError("Please log in to access this page.");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [activeTab, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching users as admin - checking credentials");
      const response = await fetch(`http://localhost:8000/api/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("Admin API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received users data:", data);
        setUsers(data);
      } else {
        const errorData = await response.json();
        console.error("Admin API error:", errorData);
        setError(errorData.error || "You don't have permission to view this page");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDomains = async () => {
    setLoading(true);
    try {
      console.log("Fetching domains - checking credentials");
      const response = await fetch(`http://localhost:8000/api/admin/domains`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
      });

      console.log("Admin domains API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received domains data:", data);
        setDomains(data);
      } else {
        const errorData = await response.json();
        console.error("Admin domains API error:", errorData);
        setError(errorData.error || "Failed to fetch domain mappings");
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      setError("Error fetching domains: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDefaultMapping = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/default-mapping`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDefaultMapping(data);
        setDefaultDriveUrl(data.drive_url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch default mapping");
      }
    } catch (error) {
      setError("Error fetching default mapping: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/api/admin/update-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`User ${email} role updated to ${role} successfully!`);
        setEmail("");
        fetchUsers(); // Refresh the user list
      } else {
        setError(data.error || "Failed to update user role");
      }
    } catch (error) {
      setError("Error updating user role: " + error.message);
    }
  };
  
  const handleDomainSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");
    
    const domainData = {
      domain: domain.trim(),  // Remove any whitespace
      drive_url: driveUrl.trim(),
      description: description.trim(),
      is_active: true  // Add this field
    };
  
    try {
      console.log("Submitting domain mapping:", domainData); // Debug log
      let response;
      
      if (editingDomainId) {
        response = await fetch(`http://localhost:8000/api/admin/domains/${editingDomainId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(domainData),
        });
      } else {
        response = await fetch(`http://localhost:8000/api/admin/domains`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(domainData),
        });
      }
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccessMessage(
          editingDomainId
            ? `Domain mapping for ${domain} updated successfully!`
            : `Domain mapping for ${domain} created successfully!`
        );
        
        // Reset form fields
        setDomain("");
        setDriveUrl("");
        setDescription("");
        setEditingDomainId(null);
        
        fetchDomains(); // Refresh the domain list
      } else {
        setError(data.error || "Failed to save domain mapping");
      }
    } catch (error) {
      console.error("Error saving domain mapping:", error);
      setError("Error saving domain mapping: " + error.message);
    }
  };
  
  const handleDefaultMappingSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/default-mapping`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          drive_url: defaultDriveUrl
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Default mapping updated successfully!");
        fetchDefaultMapping(); // Refresh the default mapping
      } else {
        setError(data.error || "Failed to update default mapping");
      }
    } catch (error) {
      setError("Error updating default mapping: " + error.message);
    }
  };
  
  const handleEditDomain = (domainMapping) => {
    setDomain(domainMapping.domain);
    setDriveUrl(domainMapping.drive_url);
    setDescription(domainMapping.description || "");
    setEditingDomainId(domainMapping.id);
    
    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  const handleDeleteDomain = async (id, domainName) => {
    if (!window.confirm(`Are you sure you want to delete the mapping for ${domainName}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/domains/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setSuccessMessage(`Domain mapping for ${domainName} deleted successfully!`);
        fetchDomains(); // Refresh the domain list
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete domain mapping");
      }
    } catch (error) {
      setError("Error deleting domain mapping: " + error.message);
    }
  };
  
  const handleCancelEdit = () => {
    setDomain("");
    setDriveUrl("");
    setDescription("");
    setEditingDomainId(null);
  };

  if (loading && activeTab !== "domains" && activeTab !== "default") {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <h1 className="mb-4">Admin Management</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "users" ? "active" : ""}`} 
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "domains" ? "active" : ""}`} 
            onClick={() => setActiveTab("domains")}
          >
            Domain Mappings
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === "default" ? "active" : ""}`} 
            onClick={() => setActiveTab("default")}
          >
            Default Mapping
          </button>
        </li>
      </ul>
      
      {activeTab === "users" && (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <h3>Create Admin User</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleUserRoleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    User Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="form-text">
                    Enter the email of an existing user to update their role.
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Update Role
                </button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>User List</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.department || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
      
      {activeTab === "domains" && (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <h3>{editingDomainId ? "Edit Domain Mapping" : "Add Domain Mapping"}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleDomainSubmit}>
                <div className="mb-3">
                  <label htmlFor="domain" className="form-label">
                    Email Domain
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                  <div className="form-text">
                    Enter the email domain without @ (e.g., "example.com")
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="driveUrl" className="form-label">
                    Google Drive URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="driveUrl"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    required
                  />
                  <div className="form-text">
                    Enter the full Google Drive folder URL
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="description"
                    placeholder="Description of this mapping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingDomainId ? "Update Mapping" : "Add Mapping"}
                  </button>
                  
                  {editingDomainId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Domain Mappings List</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : domains.length === 0 ? (
                <div className="alert alert-info">
                  No domain mappings found. Add your first domain mapping using the form above.
                </div>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Drive URL</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((domainMapping) => (
                      <tr key={domainMapping.id}>
                        <td>{domainMapping.domain}</td>
                        <td>
                          <a href={domainMapping.drive_url} target="_blank" rel="noopener noreferrer">
                            {domainMapping.drive_url.length > 40 
                              ? domainMapping.drive_url.substring(0, 40) + "..." 
                              : domainMapping.drive_url}
                          </a>
                        </td>
                        <td>{domainMapping.description || "-"}</td>
                        <td>
                          <span className={`badge ${domainMapping.is_active ? "bg-success" : "bg-secondary"}`}>
                            {domainMapping.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditDomain(domainMapping)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteDomain(domainMapping.id, domainMapping.domain)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
      
      {activeTab === "default" && (
        <div className="card">
          <div className="card-header">
            <h3>Default Mapping</h3>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              The default mapping is used when a user's email domain doesn't match any of the configured domain mappings.
            </div>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDefaultMappingSubmit}>
                <div className="mb-3">
                  <label htmlFor="defaultDriveUrl" className="form-label">
                    Default Google Drive URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="defaultDriveUrl"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={defaultDriveUrl}
                    onChange={(e) => setDefaultDriveUrl(e.target.value)}
                    required
                  />
                  <div className="form-text">
                    Enter the full Google Drive folder URL to use as the default
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Update Default Mapping
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;