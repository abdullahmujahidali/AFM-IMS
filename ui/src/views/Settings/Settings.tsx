import useSWR from "swr";
import CompanySettings from "./CompanySettings";
import PersonalSettings from "./PersonalSettings";

const secondaryNavigation = [
  { name: "Account", href: "#", current: true },
  { name: "Notifications", href: "#", current: false },
  { name: "Billing", href: "#", current: false },
  { name: "Teams", href: "#", current: false },
  { name: "Integrations", href: "#", current: false },
];

export default function SettingsView() {
  const { data: customerData, isLoading } = useSWR("/api/v1/users/me/");
  const { data: companyData, isLoading: companyLoading } = useSWR(
    `/api/v1/company/${customerData?.company?.id}/`
  );
  return (
    <>
      <div>
        <div>
          <main>
            <h1 className="sr-only">Settings</h1>
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

            <PersonalSettings data={customerData} isLoading={isLoading} />
            <CompanySettings data={companyData} isLoading={companyLoading} />
          </main>
        </div>
      </div>
    </>
  );
}
