import { TooltipProvider } from "@/components/ui/tooltip";
import { ComponentProps } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { SWRConfig } from "swr";
import "./App.css";
import axiosInstance from "./axiosInstance";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicViewLayout from "./layouts/PublicViewLayout";
import SignIn from "./views/Auth/Signin";
import SignUp from "./views/Auth/Signup";
import Dashboard from "./views/Dashboard/Dashboard";
import Landing from "./views/Landing/Landing";
import ProductsView from "./views/Products/Products";

const router = createBrowserRouter([
  {
    path: "",
    element: <PublicViewLayout />,
    children: [
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
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/dashboard/customers" replace />,
      },
      {
        path: "customers",
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
        ],
      },
      {
        path: "products",
        children: [
          {
            path: "",
            element: <ProductsView />,
          },
        ],
      },
    ],
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
