import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminLogin } from "../../components/admin/AdminLogin";
import { useAuth } from "../../contexts/AuthContext";

function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (token: string, user: any) => {
    console.log("handleLoginSuccess called", { token, user });
    console.log("Calling login context", { token, user });
    login(token, user);

    console.log("Attempting navigation to /admin/dashboard");
    // Force navigation to dashboard - try both methods
    try {
      navigate({ to: "/admin/dashboard" });
    } catch (error) {
      // Fallback to window.location if navigate fails
      console.log("Navigate failed, using window.location", error);
      window.location.href = "/admin/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLogin onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});
