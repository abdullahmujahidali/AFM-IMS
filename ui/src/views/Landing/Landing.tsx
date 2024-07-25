import { Button } from "@mantine/core";

function Landing() {
  return (
    <div className="relative flex items-center justify-center flex-col gap-3 min-h-screen bg-cover bg-center">
      <img src="/logo2.svg" alt="Logo" className="w-32 h-auto mx-auto" />
      <h1 className="lg:text-7xl  text-4xl font-bold">
        Welcome to AFM - Inventory Management System
      </h1>
      <p className="text-lg md:text-base lg:text-xl my-4">
        This webapp is dedicated for Abubakar Frame Manufacture. You can add
        customer, add products, record orders add transactions and much more.
      </p>
      <div className="flex gap-2">
        <Button color="primary">Sign Up</Button>
        <Button color="success" className="">
          Login
        </Button>
      </div>
    </div>
  );
}

export default Landing;
