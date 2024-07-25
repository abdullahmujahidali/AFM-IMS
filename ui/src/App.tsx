import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import SignUp from "./views/Auth/Signup";
import Landing from "./views/Landing/Landing";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "signup",
    element: <SignUp />,
  },
]);

export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />;
    </TooltipProvider>
  );
}
