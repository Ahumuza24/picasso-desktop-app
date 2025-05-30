// src/pages/LoginPage.js
import React, { useState, useEffect } from "react";
import SignIn from "../components/SignIn";
import { Navigate } from "react-router-dom";
import "../styles/no-scroll.css"; // Import no-scroll styles

const LoginPage = () => {
  const [responseMessage, setResponseMessage] = useState("");
  const [redirect, setRedirect] = useState("");
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
      // Login request
      const response = await fetch(`http://localhost:8000/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log("Login successful");
        setResponseMessage(responseData.message || "Login successful");
        
        // After successful login, fetch user data to check role
        try {
          const userResponse = await fetch(`http://localhost:8000/api/user`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("User data after login:", userData);
            
            // Redirect based on user role
            if (userData.role === "admin") {
              setRedirect("/admin");
            } else {
              setRedirect("/");
            }
          } else {
            console.error("Failed to fetch user data after login");
            setRedirect("/");
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          setRedirect("/");
        }
      } else {
        console.error("Login failed:", responseData);
        setResponseMessage(responseData.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      setResponseMessage("Error connecting to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="no-scroll-container">
      <SignIn
        onSubmit={handleSubmit}
        responseMessage={responseMessage}
        setResponseMessage={setResponseMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginPage;
