import Sidebar from "@/components/ui/Sidebar";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useSWR from "swr";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data, isLoading } = useSWR("/api/v1/users/me/");

  // Add effect to handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return <div />;
  }

  return data && data?.company?.status ? (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        data={data}
        isLoading={isLoading}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <main className="relative flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  ) : (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <img src="/src/assets/space.svg" className="h-48 w-48 items-center" />
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">Oops!</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Your company is not activated yet!
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Contact support to solve your issue.
        </p>
        <div className="mt-4 flex items-center justify-center gap-x-6">
          <a
            href="logout"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Logout
          </a>
          <a href="#" className="text-sm font-semibold text-gray-900">
            Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
