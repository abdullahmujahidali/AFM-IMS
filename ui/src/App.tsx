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
import NewLayout from "./components/ui/NewLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicViewLayout from "./layouts/PublicViewLayout";
import SettingsLayout from "./layouts/SettingsLayout";
import SignIn from "./views/Auth/Signin";
import SignUp from "./views/Auth/Signup";
import Dashboard from "./views/Customer/Customer";
import CustomerDetailView from "./views/Customer/CutomerDetail";
import InvoiceDetails from "./views/Invoices/InvoiceItem";
import InvoicesView from "./views/Invoices/Invoices";
import Landing from "./views/Landing/Landing";
import ProductsView from "./views/Products/Products";
import CreateSale from "./views/Sales/CreateSale/CreateSale";
import SalesView from "./views/Sales/Sales";
import SettingsView from "./views/Settings/Settings";
import StatisticsView from "./views/Statistics/Statistics";

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
          {
            path: ":customerId",
            element: <CustomerDetailView />,
          },
          {
            path: ":customerId/invoices/:invoiceId",
            element: <InvoiceDetails />,
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
      {
        path: "sales",
        children: [
          {
            path: "",
            element: <SalesView />,
          },
          {
            path: "create",
            element: <CreateSale />,
          },
          {
            path: "edit/:saleId",
            element: <CreateSale />,
          },
        ],
      },
      {
        path: "invoices",
        children: [
          {
            path: "",
            element: <InvoicesView />,
          },
          {
            path: "edit/:invoiceId",
            element: <InvoiceDetails />,
          },
        ],
      },
      {
        path: "stats",
        children: [
          {
            path: "",
            element: <StatisticsView />,
          },
        ],
      },
    ],
  },
  {
    path: "/settings",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/settings/company" replace />,
      },
      {
        path: "company",
        element: <SettingsLayout />,
        children: [
          {
            path: "",
            element: <SettingsView />,
          },
          {
            path: "accounts",
            element: <SettingsView />,
          },
          {
            path: "teams",
            element: <SettingsView />,
          },
          {
            path: "notifications",
            element: <SettingsView />,
          },
          {
            path: "billing",
            element: <SettingsView />,
          },
        ],
      },
      {
        path: "new",
        children: [
          {
            path: "",
            element: <NewLayout />,
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
