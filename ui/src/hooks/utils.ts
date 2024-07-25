import axiosInstance from "@/axiosInstance";

export const setHeaders = (token?: string) => {
  const accessToken = token ?? localStorage.getItem("access");
  if (accessToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

setHeaders();
