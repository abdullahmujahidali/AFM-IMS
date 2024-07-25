import { setLocalStorage } from "@/lib/localStorage";
import axios from "axios";

import axiosInstance from "@/axiosInstance";
import { setHeaders } from "@/hooks/utils";

let refreshTokenRequest: Promise<any> | undefined;

async function errorInterceptor(err: any) {
  if (err.response?.status === 401) {
    let tokenRes;

    if (!refreshTokenRequest) {
      refreshTokenRequest = axios
        .post(
          "/api/token/refresh/",
          {
            user_type: "recruiter",
            refresh: localStorage.getItem("refresh"),
          },
          {
            baseURL: import.meta.env.VITE_API_BASE_URL.replace(
              "TENANT",
              "common"
            ),
          }
        )
        .catch((error) => {
          if (
            error?.config?.url === "api/token/refresh/" &&
            (error?.response?.status === 401 || error?.response?.status === 400)
          ) {
            localStorage.clear();
            setHeaders();
            window.location.href = "/login";
          }
        });
    }

    try {
      tokenRes = await refreshTokenRequest;
    } catch (_) {
      throw err;
    } finally {
      refreshTokenRequest = undefined;
    }

    setLocalStorage("access", tokenRes.data.access);
    setLocalStorage("refresh", tokenRes.data.refresh);
    setHeaders();

    err.config.headers.Authorization = `Bearer ${tokenRes.data.access}`;
    return axios.request(err.config);
  }
  throw err;
}

axiosInstance.interceptors.response.use((res) => res, errorInterceptor);
