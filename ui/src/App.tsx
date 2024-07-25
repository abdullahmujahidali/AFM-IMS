import { TooltipProvider } from "@/components/ui/tooltip";
import { ComponentProps } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SWRConfig } from "swr";
import "./App.css";
import axiosInstance from "./axiosInstance";
import SignIn from "./views/Auth/Signin";
import SignUp from "./views/Auth/Signup";
import Landing from "./views/Landing/Landing";
import Dashboard from "./views/Dashboard/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "signup",
    element: <SignUp />,
  },
  {
    path: "login",
    element: <SignIn />,
  },
  {
    path: "/", //for authenticated users
    element: <Dashboard />,
  },
]);
const swrConfig = {
  fetcher: (res) => axiosInstance.get(res).then((r) => r.data),
  focusThrottleInterval: 30000,
} satisfies ComponentProps<typeof SWRConfig>["value"];

export default function App() {
  return (
    <SWRConfig value={swrConfig}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </SWRConfig>
  );
}
