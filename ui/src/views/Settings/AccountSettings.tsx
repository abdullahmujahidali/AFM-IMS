import useSWR from "swr";
import CompanySettings from "./CompanySettings";
import PersonalSettings from "./PersonalSettings";

export default function SettingsView() {
  const { data: customerData, isLoading } = useSWR("/api/v1/users/me/");
  const { data: companyData, isLoading: companyLoading } = useSWR(
    `/api/v1/company/${customerData?.company?.id}/`
  );
  return (
    <>
      <PersonalSettings data={customerData} isLoading={isLoading} />
      <CompanySettings data={companyData} isLoading={companyLoading} />
    </>
  );
}
