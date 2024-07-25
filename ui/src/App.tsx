import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import SignIn from "./views/Auth/Signin";
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
  {
    path: "login",
    element: <SignIn />,
  },
]);

export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}
