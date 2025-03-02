import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const Auth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token found in localStorage:", token); // Debugging
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []); // Empty dependency array to run on mount

  if (!isAuthenticated) {
    console.log("Redirecting to login..."); // Debugging
    return <Navigate to="/login" />;
  }

  return children;
};

export default Auth;
