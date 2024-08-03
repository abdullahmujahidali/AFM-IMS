import Sidebar from "@/components/ui/Sidebar";
import { Bars3Icon } from "@heroicons/react/20/solid";
import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import useSWR from "swr";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading } = useSWR("/api/v1/users/me/");

  return (
    <div className="flex bg-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        data={data}
        isLoading={isLoading}
      />
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 border-b border-gray-200 bg-white">
          <button
            type="button"
            className="px-4 text-gray-500 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1"></div>
            <div className="ml-4 flex items-center lg:ml-6"></div>
          </div>
        </div>
        <main className="relative flex-1 p-4 lg:ml-64 xl:ml-72">
          <Suspense fallback={<span />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
