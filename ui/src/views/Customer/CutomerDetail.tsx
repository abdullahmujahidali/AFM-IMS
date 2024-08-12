import { DetailsDataTable } from "@/components/DetailsDataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import useSWR from "swr";

function CustomerDetailView() {
  const { customerId } = useParams();
  const {
    data: customersData,
    error,
    isLoading,
  } = useSWR(`/api/v1/customers/${customerId}`);

  const { data: salesData } = useSWR(`/api/v1/sales/?id=${customerId}`);

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

      <DetailsDataTable
        data={orderData?.results} // Ensure data doesn't include items
        columns={columns}
      />

      {/* Orders Accordion */}
      <Accordion type="single" collapsible>
        <h3 className="text-xl font-semibold">Orders</h3>
        {orderData?.results?.map((order) => (
          <AccordionItem key={order.id} value={order.id}>
            <AccordionTrigger>
              <div className="flex justify-between">
                <span>Order #{order.id}</span>
                <span>{order.total_price}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Status: {order.status}</p>
              <p>Date: {order.created_at}</p>
              {/* Optionally include items in the accordion if needed */}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Sales Accordion */}
      <Accordion type="single" collapsible>
        <h3 className="text-xl font-semibold">Sales</h3>
        {salesData?.results?.map((sale) => (
          <AccordionItem key={sale.id} value={sale.id}>
            <AccordionTrigger>
              <div className="flex justify-between">
                <span>Sale #{sale.id}</span>
                <span>{sale.total_amount}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Date: {sale.created_at}</p>
              <p>Balance: {sale.balance}</p>
              <p>Comments: {sale.comments || "No comments"}</p>
              <ul className="pl-4 list-disc">
                {sale.items.map((item, idx) => (
                  <li key={idx}>
                    {item.product.name} - Quantity: {item.quantity} - Price:{" "}
                    {item.price}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default CustomerDetailView;
