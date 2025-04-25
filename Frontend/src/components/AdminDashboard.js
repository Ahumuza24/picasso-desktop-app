import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/brand-colors.css";
import "./admin-dashboard.css";

const AdminDashboard = ({ userName }) => {
  const [domains, setDomains] = useState([]);
  const [defaultMapping, setDefaultMapping] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("domains");
  
  // Form states
  const [newDomain, setNewDomain] = useState("");
  const [newDriveUrl, setNewDriveUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editDefaultDriveUrl, setEditDefaultDriveUrl] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all necessary data when component mounts
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchDomains();
        await fetchDefaultMapping();
        await fetchUsers();
        setError("");
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load admin data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Add a class to the body to fix scrolling issues
    document.body.classList.add('admin-page');
    
    fetchData();
    
    return () => {
      // Cleanup - remove the class when component unmounts
      document.body.classList.remove('admin-page');
    };
  }, []);

  const fetchDomains = async () => {
    const response = await fetch("http://localhost:8000/api/admin/domains", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch domains");
    }

    const data = await response.json();
    setDomains(data);
  };

  const fetchDefaultMapping = async () => {
    const response = await fetch("http://localhost:8000/api/admin/default-mapping", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch default mapping");
    }

    const data = await response.json();
    setDefaultMapping(data.drive_url);
    setEditDefaultDriveUrl(data.drive_url);
  };

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8000/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    setUsers(data);
  };

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/admin/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          domain: newDomain,
          drive_url: newDriveUrl,
          description: newDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create domain mapping");
      }

      // Reset form
      setNewDomain("");
      setNewDriveUrl("");
      setNewDescription("");
      
      // Refresh domains
      await fetchDomains();
      setError("");
    } catch (err) {
      console.error("Error creating domain mapping:", err);
      setError(err.message || "Failed to create domain mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDefaultMapping = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/admin/default-mapping", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          drive_url: editDefaultDriveUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update default mapping");
      }

      // Refresh default mapping
      await fetchDefaultMapping();
      setError("");
    } catch (err) {
      console.error("Error updating default mapping:", err);
      setError(err.message || "Failed to update default mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this domain mapping?")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/domains/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete domain mapping");
      }

      // Refresh domains
      await fetchDomains();
      setError("");
    } catch (err) {
      console.error("Error deleting domain mapping:", err);
      setError(err.message || "Failed to delete domain mapping");
    } finally {
      setLoading(false);
    }
  };

  if (!userName) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Please log in to access the admin dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-container">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'domains' ? 'active' : ''}`}
            onClick={() => setActiveTab('domains')}
          >
            Domain Mappings
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'default' ? 'active' : ''}`}
            onClick={() => setActiveTab('default')}
          >
            Default Mapping
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
      </ul>
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'domains' && (
            <div className="card shadow mb-4">
              <div className="card-header">
                <h4 className="mb-0">Domain Drive Mappings</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateDomain} className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="newDomain" className="form-label">Domain</label>
                      <input
                        type="text"
                        className="form-control"
                        id="newDomain"
                        placeholder="example.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="newDriveUrl" className="form-label">Drive URL</label>
                      <input
                        type="url"
                        className="form-control"
                        id="newDriveUrl"
                        placeholder="https://drive.google.com/..."
                        value={newDriveUrl}
                        onChange={(e) => setNewDriveUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="newDescription" className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        id="newDescription"
                        placeholder="Optional description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        Add Domain Mapping
                      </button>
                    </div>
                  </div>
                </form>

                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Drive URL</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No domain mappings found</td>
                        </tr>
                      ) : (
                        domains.map((domain) => (
                          <tr key={domain.id}>
                            <td>{domain.domain}</td>
                            <td>
                              <a href={domain.drive_url} target="_blank" rel="noreferrer">
                                {domain.drive_url.substring(0, 30)}...
                              </a>
                            </td>
                            <td>{domain.description || "—"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteDomain(domain.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'default' && (
            <div className="card shadow mb-4">
              <div className="card-header">
                <h4 className="mb-0">Default Drive Mapping</h4>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  This is the fallback drive URL for users whose email domains don't match any specific mapping.
                </p>
                <form onSubmit={handleUpdateDefaultMapping}>
                  <div className="mb-3">
                    <label htmlFor="defaultDriveUrl" className="form-label">Default Drive URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="defaultDriveUrl"
                      value={editDefaultDriveUrl}
                      onChange={(e) => setEditDefaultDriveUrl(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Update Default Mapping
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card shadow mb-4">
              <div className="card-header">
                <h4 className="mb-0">User Management</h4>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No users found</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.department || "—"}</td>
                            <td>
                              <span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                                {user.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 