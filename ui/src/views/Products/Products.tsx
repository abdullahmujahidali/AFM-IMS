import { DataTableDemo } from "@/components/ui/DataTable";
import useSWR from "swr";

function ProductsView() {
  const { data, error, isLoading } = useSWR("/api/v1/products/");
  console.log("data: ", data);

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "product_type", header: "Product Type" },
    { accessorKey: "dimensions", header: "Dimensions" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "description", header: "Description" },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <section>
      <h1 className="font-bold">ProductsView</h1>
      {data && <DataTableDemo data={data.results} columns={columns} />}
    </section>
  );
}

export default ProductsView;
