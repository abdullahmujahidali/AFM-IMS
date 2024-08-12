import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };
  return (
    <div className="relative flex items-center justify-center flex-col gap-3 min-h-screen bg-cover bg-center">
      <img src="/logo.svg" alt="Logo" className="w-32 h-auto mx-auto" />
      <h1 className="lg:text-7xl  text-4xl font-bold">
        Welcome to AFM - Inventory Management System
      </h1>
      <p className="text-lg md:text-base lg:text-xl my-4">
        This webapp is dedicated for Abubakar Frame Manufacture. You can add
        customer, add products, record orders add transactions and much more.
      </p>
      <div className="flex gap-2">
        <Button variant="default" onClick={handleSignUpClick}>
          Sign Up
        </Button>
        <Button variant="outline" onClick={handleLoginClick}>
          Login
        </Button>
      </div>
    </div>
  );
}

export default Landing;
