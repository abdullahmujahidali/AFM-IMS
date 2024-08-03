import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import React from "react";

import { useState } from "react";
import { NavLink } from "react-router-dom";

import { cn } from "../../lib/utils";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <section className="w-full py-4 px-6 bg-white shadow-md dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <NavLink to="#">
            <img src="/logo2.svg" alt="Logo" className="w-8 h-auto mx-auto" />
          </NavLink>
        </div>
        <div className="hidden md:flex space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Sales</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[300px] lg:w-[300px] lg:grid-rows-[.75fr_1fr]">
                    <ListItem href="/dashboard/customers" title="Customers">
                      List of all customers.
                    </ListItem>
                    <ListItem href="/dashboard/products" title="Products">
                      List of all products offered by AFM.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[300px] lg:w-[300px] lg:grid-rows-[.75fr_1fr]">
                    <ListItem href="/dashboard/customers" title="Customers">
                      Company Settings.
                    </ListItem>
                    <ListItem href="/dashboard/products" title="Membership">
                      Roles and Permissions.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem className="pl-2">
                <NavLink to="/docs">
                  <Button variant="default">Logout</Button>
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />
            ) : (
              <MenuIcon className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />
            )}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="mt-4 md:hidden" id="mobile-menu">
          <NavigationMenu>
            <NavigationMenuList className="group flex flex-col list-none space-y-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="w-full">
                  Sales
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[300px] lg:w-[300px] lg:grid-rows-[.75fr_1fr]">
                    <ListItem href="/dashboard/customers" title="Customers">
                      Company Settings.
                    </ListItem>
                    <ListItem href="/dashboard/products" title="Membership">
                      Roles and Permissions.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4 md:w-[300px] md:grid-rows-2 lg:w-[300px] ">
                    <ListItem href="/dashboard/customers" title="Settings">
                      Company Settings.
                    </ListItem>
                    <ListItem href="/dashboard/products" title="Membership">
                      Roles and Permissions.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <ul className="grid w-[300px] gap-3 p-4 md:w-[300px] md:grid-rows-2 lg:w-[300px] ">
                  <NavLink to="/docs">
                    <Button variant="default" className="w-full">
                      Logout
                    </Button>
                  </NavLink>
                </ul>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </section>
  );
}

function MenuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
