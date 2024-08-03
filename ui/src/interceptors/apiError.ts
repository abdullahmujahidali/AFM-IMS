import axiosInstance from "@/axiosInstance";

const API_ERROR_MESSAGE = {
  STATUS_CODE_400: "The server could not understand your request!",
  STATUS_CODE_401: "We’re sorry, we could not authenticate your identity!",
  STATUS_CODE_403:
    "You do not have the rights to access the requested resource!",
  STATUS_CODE_404: "We’re sorry, we could not find what you requested for!",
  STATUS_CODE_413: "The file uploaded is too big!",
  STATUS_CODE_500: "We’re sorry, we could not find the server!",
  STATUS_CODE_UNKNOWN: "Oops, Something Went Wrong!",
};

async function apiErrorHandler(err: any) {
  if (err.config.skipSnackbar || err.code === "ERR_CANCELED") {
    throw err;
  }

  let errorText = API_ERROR_MESSAGE.STATUS_CODE_UNKNOWN;

  if (!err.response || !err.request) {
    errorText = "Unable to connect to server";
  } else if (err.response.status === 400) {
    errorText = API_ERROR_MESSAGE.STATUS_CODE_400;
  } else if (err.response.status === 401) {
    errorText = API_ERROR_MESSAGE.STATUS_CODE_401;
  } else if (err.response.status === 403) {
    errorText = API_ERROR_MESSAGE.STATUS_CODE_403;
  } else if (err.response.status === 404) {
    errorText = API_ERROR_MESSAGE.STATUS_CODE_404;
  } else if (err.response.status === 413) {
    errorText = API_ERROR_MESSAGE.STATUS_CODE_403;
  } else if (err.response.status >= 500) {
    errorText = API_ERROR_MESSAGE.STATUS_CODE_500;
  }

  throw err;
}

axiosInstance.interceptors.response.use((res) => res, apiErrorHandler);
