import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { useLocation } from "react-router-dom";

export default function SettingsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  console.log(":::: ", currentPath);

  const secondaryNavigation = [
    {
      name: "Account",
      href: "/settings/accounts/",
      current: currentPath.startsWith("/settings/accounts"),
    },
    {
      name: "Teams",
      href: "/settings/teams/",
      current: currentPath.startsWith("/settings/teams"),
    },
    {
      name: "Notifications",
      href: "/settings/notifications/",
      current: currentPath.startsWith("/settings/notifications"),
    },
    {
      name: "Billing",
      href: "/settings/billing/",
      current: currentPath.startsWith("/settings/billing"),
    },
  ];

  return (
    <div>
      <header className="border-b border-white/5">
        <nav className="flex overflow-x-auto py-4">
          <ul
            role="list"
            className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
          >
            {secondaryNavigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={item.current ? "text-indigo-400" : ""}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <Suspense fallback={<span />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
