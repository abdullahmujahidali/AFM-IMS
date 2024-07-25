import { useEffect } from "react";

import axiosInstance from "@/axiosInstance";
import { useLocalStorage } from "@mantine/hooks";
import type { AxiosResponse } from "axios";
import { setHeaders } from "./utils";

export enum AuthStatus {
  LOGGED_OUT = "LOGGED_OUT",
  VALIDATING = "VALIDATING",
  LOGGED_IN = "LOGGED_IN",
}

let verificationRequest: Promise<AxiosResponse> | undefined;

export default function useAuth() {
  // eslint-disable-next-line no-undef
  const [accessToken, setAccessToken, removeToken] = useLocalStorage<string>({
    key: "access",
    serialize: (value) => value,
    getInitialValueInEffect: false,
  });
  const [refreshToken, setRefreshToken, removeRefreshToken] =
    useLocalStorage<string>({
      key: "refresh",
      serialize: (value) => value,
      getInitialValueInEffect: false,
    });
  const [authStatus, setAuthStatus] = useLocalStorage<AuthStatus>({
    key: "authStatus",
    serialize: (value) => value,
    defaultValue: localStorage.getItem("access")
      ? AuthStatus.VALIDATING
      : AuthStatus.LOGGED_OUT,
    deserialize: (value: string): AuthStatus => {
      if (value in AuthStatus) {
        return value as AuthStatus;
      }
      return AuthStatus.VALIDATING;
    },
    getInitialValueInEffect: false,
  });

  function logout() {
    removeToken();
    removeRefreshToken();
    setHeaders();
    setAuthStatus(AuthStatus.LOGGED_OUT);
    window.location.href = "/login";
  }

  useEffect(() => {
    if (authStatus === AuthStatus.VALIDATING) {
      const request =
        verificationRequest ||
        axiosInstance.post("/api/v1/users/", {
          token: localStorage.getItem("access"),
        });
      if (!verificationRequest) {
        verificationRequest = request;
      }

      request
        .then(() => setAuthStatus(AuthStatus.LOGGED_IN))
        .catch(logout)
        .finally(() => {
          verificationRequest = undefined;
        });
    }

    function onAuthStatusChange(event: CustomEvent<{ status: AuthStatus }>) {
      setAuthStatus(event.detail.status);
    }

    window.addEventListener("authStatusChanged", onAuthStatusChange as any);
    return () =>
      window.removeEventListener(
        "authStatusChanged",
        onAuthStatusChange as any
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status: authStatus,
    token: { access: accessToken, refresh: refreshToken },
    setToken: ({ access, refresh } = { access: "", refresh: "" }) => {
      setHeaders(access);
      setAccessToken(access);
      setRefreshToken(refresh);
      if (access && refresh) {
        setAuthStatus(AuthStatus.LOGGED_IN);
      } else {
        setAuthStatus(AuthStatus.LOGGED_OUT);
      }
    },
    logout: () => logout(),
  };
}
