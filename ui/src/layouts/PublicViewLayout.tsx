import { ReactElement, useRef } from "react";
import { Navigate } from "react-router-dom";

import useAuth, { AuthStatus } from "@/hooks/useAuth";

export default function PublicViewLayout({
  children,
}: {
  children: ReactElement;
}) {
  const { status } = useAuth();
  const isLoggedOut = useRef(false);

  if (status === AuthStatus.LOGGED_IN && !isLoggedOut.current) {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === AuthStatus.LOGGED_OUT) {
    isLoggedOut.current = true;
  }

  return children;
}
