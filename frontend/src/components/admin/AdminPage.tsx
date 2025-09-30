import React, { useState, useEffect } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Auth check response:", userData);

          // Fix: Check userData.data.user.role instead of userData.data.role
          if (
            userData.success &&
            userData.data.user &&
            userData.data.user.role === "admin"
          ) {
            setCurrentUser(userData.data.user);
            setIsAuthenticated(true);
          } else {
            // Not an admin, clear tokens
            console.log("User is not an admin or invalid response");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
          }
        } else {
          // Invalid token, clear it
          console.log("Token validation failed");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (token: string, user: User) => {
    if (user.role !== "admin") {
      alert("Access denied. Admin privileges required.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return;
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    // Call backend logout to blacklist the token
    if (token) {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
