import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import SignUp from "../components/SignUp";

const RegisterPage = () => {
  const [responseMessage, setResponseMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (userData) => {
    console.log("Submitting user data:", userData);
    try {
      const response = await fetch(`http://localhost:8000/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
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
    }
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <SignUp
        onSubmit={handleSubmit}
        responseMessage={responseMessage}
        setResponseMessage={setResponseMessage}
      />
    </div>
  );
};

export default RegisterPage;
