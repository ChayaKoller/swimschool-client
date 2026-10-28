import { Outlet } from "react-router";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/typesDtos";
import ForbiddenPage from "../pages/ForbiddenPage";

type RequireRoleProps = {
  role: UserRole;
};

export default function RequireRole({ role }: RequireRoleProps) {
  const { user } = useAuth();
  if (user?.role !== role) {
    return <ForbiddenPage />;
  }
  return <Outlet />;
}