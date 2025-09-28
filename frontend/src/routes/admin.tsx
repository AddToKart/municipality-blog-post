import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    // If accessing /admin directly, redirect to login
    if (location.pathname === "/admin") {
      throw redirect({
        to: "/admin/login",
      });
    }
  },
  component: () => <Outlet />,
});
