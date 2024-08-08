import { Button } from "@/components/ui/button";
import Sidebar from "@/components/ui/Sidebar";
import { Bars3Icon } from "@heroicons/react/20/solid";
import { CirclePlusIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useSWR from "swr";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading } = useSWR("/api/v1/users/me/");
  const navigate = useNavigate();

  if (isLoading) {
    return <div />;
  }

  return data && data?.company?.status ? (
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
          <Button
            className="mx-4 my-3 flex gap-2"
            onClick={() => navigate("sales/create")}
            variant="outline"
          >
            <CirclePlusIcon />
            Add Sale
          </Button>
        </div>
        <main className="relative flex-1 p-4 lg:ml-64 xl:ml-72">
          <Suspense fallback={<span />}>
            <Outlet />
          </Suspense>
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
