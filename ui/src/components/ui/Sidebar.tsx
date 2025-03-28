import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  SignalIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  isLoading,
  data,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = location.pathname;

  // Define navigation items
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Squares2X2Icon,
      current: currentPath === "/dashboard",
    },
    {
      name: "Customers",
      href: "/dashboard/customers/",
      icon: UserIcon,
      current: currentPath.startsWith("/dashboard/customers"),
      badge: "3",
      badgeColor: "bg-blue-500",
    },
    {
      name: "Products",
      href: "/dashboard/products/",
      icon: FolderIcon,
      current: currentPath.startsWith("/dashboard/products"),
    },
    {
      name: "Sales",
      href: "/dashboard/sales/",
      icon: SignalIcon,
      current: currentPath.startsWith("/dashboard/sales"),
      badge: "New",
      badgeColor: "bg-green-500",
    },
    {
      name: "Invoices",
      href: "/dashboard/invoices/",
      icon: GlobeAltIcon,
      current: currentPath.startsWith("/dashboard/invoices"),
    },
    {
      name: "Statistics",
      href: "/dashboard/stats/",
      icon: ChartBarSquareIcon,
      current: currentPath.startsWith("/dashboard/stats"),
    },
    {
      name: "Team",
      href: "/dashboard/customers/",
      icon: UsersIcon,
      current: currentPath.startsWith("/dashboard/team"),
    },
  ];

  // Settings is a separate category
  const settingsItem = {
    name: "Settings",
    href: "/settings/accounts/",
    icon: Cog6ToothIcon,
    current: currentPath.startsWith("/settings/"),
  };

  // Toggle collapsed state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col">
      <div
        className={`flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2">
            <img alt="AFM Logo" src="/logo.svg" className="h-8 w-8" />
            {!collapsed && (
              <span className="text-xl font-bold text-white">منشی</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          <nav className="flex-1 space-y-1">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <a
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-slate-700 text-white"
                          : "text-gray-300 hover:bg-slate-700 hover:text-white",
                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-white"
                            : "text-gray-400 group-hover:text-white",
                          "mr-3 h-6 w-6 flex-shrink-0 transition-colors"
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <span className="flex-1 whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <Badge
                          className={`${item.badgeColor} text-white ml-auto`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={settingsItem.href}
                    className={classNames(
                      settingsItem.current
                        ? "bg-slate-700 text-white"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white",
                      "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                    )}
                  >
                    <settingsItem.icon
                      className={classNames(
                        settingsItem.current
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white",
                        "mr-3 h-6 w-6 flex-shrink-0 transition-colors"
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className="flex-1">{settingsItem.name}</span>
                    )}
                  </a>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {settingsItem.name}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </nav>
        </div>

        {/* User Profile */}
        <div
          className={`border-t border-slate-700 px-3 py-3 ${
            collapsed ? "text-center" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "flex-col" : "space-x-3"
            }`}
          >
            <Avatar className="h-10 w-10 border-2 border-slate-600">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              <AvatarFallback className="bg-slate-700 text-slate-200">
                {isLoading ? "" : data?.first_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <Skeleton className="h-4 w-24 mb-1" />
                ) : (
                  <p className="text-sm font-medium text-white truncate">
                    {data?.first_name || "User"}
                  </p>
                )}
                {isLoading ? (
                  <Skeleton className="h-3 w-16" />
                ) : (
                  <p className="text-xs text-gray-400 truncate">
                    {data?.email || "user@example.com"}
                  </p>
                )}
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={handleLogout}
              >
                <LogoutIcon className="h-5 w-5" />
              </Button>
            )}
          </div>

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white mt-2"
              onClick={handleLogout}
            >
              <LogoutIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Icons
function ChevronLeftIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function Squares2X2Icon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
