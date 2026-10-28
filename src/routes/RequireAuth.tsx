import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/useAuth";
export default function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div>טוען...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}