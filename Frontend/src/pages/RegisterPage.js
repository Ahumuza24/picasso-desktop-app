import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import SignUp from "../components/SignUp";
import "../styles/no-scroll.css"; // Import no-scroll styles
import { API_BASE_URL } from "../App";

const RegisterPage = () => {
  const [responseMessage, setResponseMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Apply no-scroll classes
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    document.getElementById('root').classList.add('no-scroll');
    
    // Cleanup function
    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      if (document.getElementById('root')) {
        document.getElementById('root').classList.remove('no-scroll');
      }
    };
  }, []);

  const handleSubmit = async (userData) => {
    console.log("Submitting user data:", userData);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          department: userData.department,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        console.log("Registration successful");
        setResponseMessage(responseData.message);
        setRedirect(true); // Set redirect state to true upon successful registration
      } else {
        console.error("Registration failed");
        setResponseMessage(responseData.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setResponseMessage("Error registering user");
    } finally {
      setIsLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="no-scroll-container">
      <SignUp
        onSubmit={handleSubmit}
        responseMessage={responseMessage}
        setResponseMessage={setResponseMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RegisterPage;
