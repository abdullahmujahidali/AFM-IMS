import { Navigate } from "react-router-dom";

import useAuth, { AuthStatus } from "@/hooks/useAuth";

export default function AuthenticatedViewLayout({
  children,
}: {
  children: any;
}) {
  const { status } = useAuth();

  // todo: handle role based authorization
  if (status === AuthStatus.LOGGED_OUT) {
    return <Navigate to="/login" replace />;
  }

  if (status === AuthStatus.VALIDATING) {
    // todo: show proper loading state
    return <div />;
  }

  return children;
}
