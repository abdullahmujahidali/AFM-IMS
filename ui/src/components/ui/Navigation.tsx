// import { classNames } from "@/utils/classNames"; // Assume you have a utility function for classNames
import {
  BellIcon,
  CreditCardIcon,
  CubeIcon,
  FingerPrintIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  { name: "General", href: "/dashboard/products", icon: UserCircleIcon },
  { name: "Security", href: "/dashboard/customers", icon: FingerPrintIcon },
  { name: "Notifications", href: "#", icon: BellIcon },
  { name: "Plan", href: "#", icon: CubeIcon },
  { name: "Billing", href: "#", icon: CreditCardIcon },
  { name: "Team members", href: "#", icon: UsersIcon },
];

const Navigation = () => {
  const location = useLocation();
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <aside className="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
      <nav className="flex-none px-4 sm:px-6 lg:px-0">
        <ul
          role="list"
          className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
        >
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={classNames(
                  location.pathname === item.href
                    ? "bg-gray-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                  "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6"
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={classNames(
                    location.pathname === item.href
                      ? "text-indigo-600"
                      : "text-gray-400 group-hover:text-indigo-600",
                    "h-6 w-6 shrink-0"
                  )}
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
