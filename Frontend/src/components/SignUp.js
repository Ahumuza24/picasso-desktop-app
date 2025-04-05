import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./sign-in.css"; // Import custom styles
import "../styles/brand-colors.css"; // Import brand colors

const SignUp = ({ onSubmit, responseMessage, setResponseMessage, isLoading }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (responseMessage) setResponseMessage("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (responseMessage) setResponseMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (responseMessage) setResponseMessage("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (responseMessage) setResponseMessage("");
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    if (responseMessage) setResponseMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setResponseMessage("Password and Confirm Password do not match");
      return;
    }
    if (!isValidEmail(email)) {
      setResponseMessage("Invalid Email Address");
      return;
    }
    // Send data to register page
    const userData = {
      name: name,
      email: email,
      password: password,
      department: department,
    };
    onSubmit(userData); // Pass user data to onSubmit function
    // You can perform further actions like sending data to the server here
  };

  const isValidEmail = (email) => {
    // Email validation logic here (e.g., regex)
    // Return true if valid, false otherwise
    return /\S+@\S+\.\S+/.test(email);
  };

  return (
    <main className="form-signin w-100 m-auto">
      <form onSubmit={handleSubmit} className="p-4 rounded shadow">
        <h1 className="h3 mb-4 fw-bold text-center">Create Account</h1>

        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="Your Name"
            value={name}
            onChange={handleNameChange}
            required
            disabled={isLoading}
          />
          <label htmlFor="name">Name</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="name@example.com"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={isLoading}
          />
          <label htmlFor="email">Email address</label>
        </div>
        
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="department"
            placeholder="Your Department"
            value={department}
            onChange={handleDepartmentChange}
            disabled={isLoading}
          />
          <label htmlFor="department">Department (Optional)</label>
        </div>
        
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            disabled={isLoading}
          />
          <label htmlFor="password">Password</label>
        </div>
        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            disabled={isLoading}
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
        </div>
        <button className="btn btn-primary w-100 py-2 mb-3" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Registering...
            </>
          ) : (
            "Register"
          )}
        </button>
        
        {responseMessage && (
          <div className={`alert mt-3 ${responseMessage.includes("success") ? "alert-success" : "alert-danger"}`} role="alert">
            {responseMessage}
          </div>
        )}
      </form>
    </main>
  );
};

export default SignUp;
