// SignIn.js

import React, { useState } from "react";
import "./sign-in.css"; // Import custom styles
import "../styles/brand-colors.css"; // Import brand colors

const SignIn = ({ onSubmit, responseMessage, setResponseMessage, isLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear response message when user starts typing
    if (responseMessage) {
      setResponseMessage("");
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear response message when user starts typing
    if (responseMessage) {
      setResponseMessage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      email: email,
      password: password,
    };
    onSubmit(userData); // Pass user data to onSubmit function
  };

  return (
    <main className="form-signin w-100 m-auto">
      <form onSubmit={handleSubmit} className="p-4 rounded shadow">
        <h1 className="h3 mb-4 fw-bold text-center">Login</h1>
        
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="floatingInput"
            placeholder="name@example.com"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={isLoading}
          />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        
        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            disabled={isLoading}
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        
        <button 
          className="btn btn-primary w-100 py-2 mb-3" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Signing in...
            </>
          ) : (
            "Sign in"
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

export default SignIn;
