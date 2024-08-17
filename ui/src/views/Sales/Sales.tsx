import { ListDataTable } from "@/components/ui/ListDataTable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { SalesTypes } from "@/constants/api-types";
import { formatDate } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

function SalesView() {
  const { data, error, mutate, isLoading } = useSWR("/api/v1/sales/");
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      const sales = data.results;

      // Calculate insights
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const salesThisMonth = sales.filter(
        (sale: SalesTypes) => new Date(sale.created_at) >= startOfMonth
      );
      const salesToday = sales.filter(
        (sale: SalesTypes) =>
          new Date(sale.created_at).toDateString() === now.toDateString()
      );

      const totalSalesThisMonth = salesThisMonth.reduce(
        (acc: number, sale: SalesTypes) => acc + parseFloat(sale.total_amount),
        0
      );
      const totalSalesToday = salesToday.reduce(
        (acc: number, sale: SalesTypes) => acc + parseFloat(sale.total_amount),
        0
      );

      setStats({
        totalSalesThisMonth: totalSalesThisMonth,
        totalSalesToday: totalSalesToday,
        numberOfSalesThisMonth: salesThisMonth.length,
      });
    }
  }, [data]);

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

  const handleRowClick = (sale: SalesTypes) => {
    navigate(`/dashboard/sales/edit/${sale.id}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Sheet>
      <div className="flex flex-col sm:flex-row justify-between gap-x-8 gap-y-4 px-4 py-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg">
        <div>
          <div className="flex items-center gap-x-3">
            <div className="flex-none rounded-full bg-blue-400/10 p-1 text-blue-400">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h1 className="flex gap-x-3 text-xl sm:text-2xl font-bold text-gray-900">
              <span>Sales Insights</span>
            </h1>
          </div>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Key metrics and insights from your sales data.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-start justify-center"
          >
            <p className="text-sm font-medium text-gray-600">
              {key.replace(/([A-Z])/g, " $1").toUpperCase()}
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
                {value}
              </span>
            </p>
          </div>
        ))}
      </div>
      <ListDataTable
        data={data.results}
        columns={columns}
        mutate={mutate}
        type="Sale"
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
