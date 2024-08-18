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
      href: "accounts",
      current: currentPath.startsWith("/settings/company/accounts"),
    },
    {
      name: "Teams",
      href: "teams",
      current: currentPath.startsWith("/settings/company/teams"),
    },
    {
      name: "Notifications",
      href: "notifications",
      current: currentPath.startsWith("/settings/company/notifications"),
    },
    {
      name: "Billing",
      href: "billing",
      current: currentPath.startsWith("/settings/company/billing"),
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
