import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "../../components/admin/AdminDashboard";
import { useAuth } from "../../contexts/AuthContext";

function AdminDashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    // This will be handled by the beforeLoad guard, but as a fallback
    window.location.href = "/admin/login";
    return null;
  }

  return <AdminDashboard />;
}

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    // Additional auth check at route level
    const token = localStorage.getItem("authToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");

    if (!token && !refreshToken) {
      throw redirect({
        to: "/admin/login",
      });
    }

    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== "admin") {
        throw redirect({
          to: "/admin/login",
        });
      }
    }
  },
  component: AdminDashboardPage,
});
