import { Bell, ChevronRight, CreditCard, Settings, Users } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useSWR from "swr";

export default function SettingsLayout() {
  // Use React Router hooks to get location and navigate
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { data: userData } = useSWR("/api/v1/users/me/");

  const navigation = [
    {
      name: "Account",
      href: "/settings/accounts/",
      icon: Settings,
      current: currentPath.startsWith("/settings/accounts"),
      description: "Manage your personal information and preferences",
    },
    {
      name: "Team Members",
      href: "/settings/teams/",
      icon: Users,
      current: currentPath.startsWith("/settings/teams"),
      description: "Invite and manage team members and their permissions",
    },
    {
      name: "Notifications",
      href: "/settings/notifications/",
      icon: Bell,
      current: currentPath.startsWith("/settings/notifications"),
      description: "Configure your notification preferences",
    },
    {
      name: "Billing",
      href: "/settings/billing/",
      icon: CreditCard,
      current: currentPath.startsWith("/settings/billing"),
      description: "Manage your subscription and payment methods",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <Card className="p-2">
                <nav className="flex flex-col space-y-1">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        item.current
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {item.current && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </button>
                  ))}
                </nav>
              </Card>

              {/* User info card */}
              {userData && (
                <Card className="mt-6 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <span className="text-lg font-medium text-gray-500">
                          {userData.first_name?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {userData.first_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Your plan
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          Professional
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1">
              <Card className="p-6">
                <Outlet />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
