import useAuth, { AuthStatus } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicViewLayout() {
  const { status } = useAuth();

  if (status === AuthStatus.LOGGED_IN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
