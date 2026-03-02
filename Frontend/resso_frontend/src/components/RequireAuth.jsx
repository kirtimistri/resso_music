import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

const RequireAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          credentials: "include", // 🔑 important for cookies
        });

        if (res.ok) setIsAuthenticated(true);
        else setIsAuthenticated(false);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
