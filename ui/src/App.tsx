import { Button } from "@mantine/core";
import "./App.css";

function App() {
  return (
    <div className="relative flex items-center justify-center flex-col gap-3 min-h-screen bg-cover bg-center">
      <h1 className="lg:text-7xl  text-4xl font-bold">
        Welcome to AIM - Inventory Management System
      </h1>
      <p className="text-lg md:text-base lg:text-xl my-4">
        Manage your business with AIM - IMS
      </p>
      <div className="flex gap-2">
        <Button className="">Sign Up</Button>
        <Button color="success" className="">
          Login
        </Button>
      </div>
    </div>
  );
}

export default App;
