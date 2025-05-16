import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/brand-colors.css";
import "./admin-dashboard.css";
import { API_BASE_URL } from "../App";

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
  
  // Domain edit states
  const [showDomainEditModal, setShowDomainEditModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [editDomain, setEditDomain] = useState("");
  const [editDriveUrl, setEditDriveUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  // User edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editRole, setEditRole] = useState("");
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
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
    const response = await fetch(`${API_BASE_URL}/api/admin/domains`, {
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
    const response = await fetch(`${API_BASE_URL}/api/admin/default-mapping`, {
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
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
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
      const response = await fetch(`${API_BASE_URL}/api/admin/domains`, {
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
      const response = await fetch(`${API_BASE_URL}/api/admin/default-mapping`, {
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
      const response = await fetch(`${API_BASE_URL}/api/admin/domains/${id}`, {
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

  // Function to open edit domain modal
  const handleEditDomain = (domain) => {
    setEditingDomain(domain);
    setEditDomain(domain.domain);
    setEditDriveUrl(domain.drive_url);
    setEditDescription(domain.description || "");
    setShowDomainEditModal(true);
  };

  // Function to close domain edit modal
  const handleCloseDomainModal = () => {
    setShowDomainEditModal(false);
    setEditingDomain(null);
  };

  // Function to save domain changes
  const handleSaveDomain = async (e) => {
    e.preventDefault();
    
    if (!editingDomain) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/domains/${editingDomain.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          domain: editDomain,
          drive_url: editDriveUrl,
          description: editDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update domain mapping");
      }

      // Close modal and refresh domains
      setShowDomainEditModal(false);
      await fetchDomains();
      setError("");
    } catch (err) {
      console.error("Error updating domain mapping:", err);
      setError(err.message || "Failed to update domain mapping");
    } finally {
      setLoading(false);
    }
  };

  // Function to open edit user modal
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditDepartment(user.department || "");
    setEditRole(user.role || "user");
    setShowEditModal(true);
  };

  // Function to save user changes
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          department: editDepartment,
          role: editRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      // Refresh users
      await fetchUsers();
      setError("");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };
  
  // Function to show delete confirmation
  const handleShowDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };
  
  // Function to cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };
  
  // Function to confirm and delete user
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Refresh users
      await fetchUsers();
      setError("");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message || "Failed to delete user");
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
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => handleEditDomain(domain)}
                                disabled={loading}
                              >
                                Edit
                              </button>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">No users found</td>
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
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-info me-2"
                                  onClick={() => handleEditUser(user)}
                                  disabled={loading}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleShowDeleteUser(user)}
                                  disabled={loading || user.email === userName}
                                >
                                  Delete
                                </button>
                              </div>
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
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveUser}>
                  <div className="mb-3">
                    <label htmlFor="editName" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="editEmail"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editDepartment" className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editDepartment"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editRole" className="form-label">Role</label>
                    <select
                      className="form-select"
                      id="editRole"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={handleCancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the user: <strong>{userToDelete.name}</strong> ({userToDelete.email})?</p>
                <p className="text-danger"><strong>This action cannot be undone.</strong></p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleConfirmDeleteUser}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain Edit Modal */}
      {showDomainEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Domain Mapping</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseDomainModal}
                  disabled={loading}
                ></button>
              </div>
              <form onSubmit={handleSaveDomain}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editDomain" className="form-label">Domain</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editDomain"
                      value={editDomain}
                      onChange={(e) => setEditDomain(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editDriveUrl" className="form-label">Drive URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="editDriveUrl"
                      value={editDriveUrl}
                      onChange={(e) => setEditDriveUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editDescription" className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editDescription"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseDomainModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 