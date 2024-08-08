import { DataTableDemo } from "@/components/ui/DataTable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import "react-quill/dist/quill.snow.css";
import useSWR from "swr";

function SalesView() {
  const { data, error, isLoading } = useSWR("/api/v1/sales/");
  const { data: customers } = useSWR("/api/v1/customers/");
  const { data: products } = useSWR("/api/v1/products/");

  console.log("customers: ", customers);
  console.log("products: ", products);

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
    <Sheet>
      <DataTableDemo
        data={data.results}
        hidden={true}
        columns={columns}
        type="Sale"
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a new Sale</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 md:gap-4 py-1 md:py-4"></div>
      </SheetContent>
    </Sheet>
  );
}

export default SalesView;
