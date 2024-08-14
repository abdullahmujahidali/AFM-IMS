import { DetailsDataTable } from "@/components/DetailsDataTable";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";

function CustomerDetailView() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const {
    data: customersData,
    error,
    isLoading,
  } = useSWR(`/api/v1/customers/${customerId}`);

  const { data: orderData } = useSWR(`/api/v1/orders/?customer=${customerId}`);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Order ID" },
      { accessorKey: "total_price", header: "Total Price" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "created_at", header: "Date" },
    ],
    []
  );

  const handleRowClick = (invoice) => {
    navigate(`invoices/${invoice.id}/`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="p-6 space-y-6 bg-white shadow-md rounded-md">
      {/* Customer Info */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{customersData.name}</h2>
        <p className="text-gray-600">Phone: {customersData.phone_number}</p>
        <p className="text-gray-600">Balance: {customersData.balance}</p>
        <p className="text-gray-600">
          Amount Owed: {customersData.amount_owed}
        </p>
      </div>
      {orderData?.results?.length > 0 ? (
        <DetailsDataTable
          data={orderData?.results} // Ensure data doesn't include items
          columns={columns}
          viewClick={handleRowClick}
        />
      ) : (
        <div className="flex flex-col items-center">
          <img src="/src/assets/space.svg" className="h-64 w-64 " />
          <h1>No invoice found</h1>
        </div>
      )}
    </div>
  );
}

export default CustomerDetailView;
