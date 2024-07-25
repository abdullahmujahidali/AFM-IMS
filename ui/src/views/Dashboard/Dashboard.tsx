import { DataTableDemo } from "@/components/ui/DataTable";
import useSWR from "swr";

function Dashboard() {
  const { data, error, isLoading } = useSWR("/api/v1/sales/customers/");
  console.log("data: ", data);

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone_number", header: "Phone Number" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "modified_at", header: "Modified At" },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <section className=" ">
      <h1 className="font-bold">Dashboard</h1>
      {data && <DataTableDemo data={data.results} columns={columns} />}
    </section>
  );
}

export default Dashboard;
