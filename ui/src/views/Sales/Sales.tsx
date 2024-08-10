import { DataTableDemo } from "@/components/ui/DataTable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate } from "date-fns";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

function SalesView() {
const { data, error, isLoading } = useSWR("/api/v1/sales/");
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => formatDate(row.getValue("created_at")),
        sortingFn: "datetime",
      },
      { accessorKey: "customer.name", header: "Customer" },

      { accessorKey: "customer.phone_number", header: "Contact" },
      { accessorKey: "total_amount", header: "Amount" },
      { accessorKey: "customer.balance", header: "Customer Balance" },
      { accessorKey: "comments", header: "Comments" },
    ],
    []
  );

  const handleRowClick = (product) => {
    navigate(`/dashboard/sales/edit/${product.id}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Sheet>
      <DataTableDemo
        data={data.results}
        columns={columns}
        type="Product"
        onRowClick={handleRowClick}
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
