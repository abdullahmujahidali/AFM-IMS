import { CalendarDaysIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import { format, parseISO } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { Newspaper } from "lucide-react";
export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  const { data: transactionDetails } = useSWR(
    `/api/v1/transactions/?order=${invoiceId}`
  );

  const { data: invoiceDetails } = useSWR(`/api/v1/orders/${invoiceId}`);
  const { data } = useSWR("/api/v1/users/me/");

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM dd, yyyy");
  };

  const handleDownload = async (format) => {
    setIsDownloading(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element);
      const data = canvas.toDataURL("image/png");

      if (format === "pdf") {
        const pdf = new jsPDF();
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoiceDetails?.id || "unknown"}.pdf`);
      } else if (format === "png") {
        const link = document.createElement("a");
        link.href = data;
        link.download = `invoice-${invoiceDetails?.id || "unknown"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error generating download:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsDownloading(false);
    }
  };

  if (!invoiceDetails) {
    return <div>Loading...</div>;
  }
  return (
    <div ref={invoiceRef}>
      <header className="relative isolate">
        {/* Header content */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
            <div className="flex items-center gap-x-6">
              <Newspaper className="w-12 h-12" />
              <h1>
                <div className="text-xs leading-6 text-gray-500">
                  Invoice:
                  <span className="text-gray-700">{invoiceDetails.id}</span>
                </div>
                <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                  {invoiceDetails.customer.name}
                </div>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl py-4 lg:px-4">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Invoice summary */}
          <div className="lg:col-start-3 lg:row-end-1">
            <h2 className="sr-only">Summary</h2>
            <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
              <dl className="flex flex-wrap flex-col">
                <div className="flex-auto pl-6 pt-6">
                  <dt className="text-sm font-semibold leading-6 text-gray-900">
                    Amount
                  </dt>
                  <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
                    Rs. {invoiceDetails.total_price}
                  </dd>
                </div>
                <div className="flex gap-3 px-6 pt-4">
                  <dt className="text-sm font-bold">Status:</dt>
                  <div className="rounded-md py-1 bg-green-50 px-2 text-center text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                    {invoiceDetails.status}
                  </div>
                </div>
                <div className="flex gap-3 px-6 pt-4">
                  <dt className="text-xs font-bold">Payment:</dt>
                  <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                    {transactionDetails?.results?.[0].status}
                  </dd>
                </div>
                <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                  <dt className="flex-none">
                    <span className="sr-only">Client</span>
                    <UserCircleIcon
                      aria-hidden="true"
                      className="h-6 w-5 text-gray-400"
                    />
                  </dt>
                  <dd className="text-sm font-medium leading-6 text-gray-900">
                    {invoiceDetails.customer.name}
                  </dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                  <dt className="flex-none">
                    <span className="sr-only">Due date</span>
                    <CalendarDaysIcon
                      aria-hidden="true"
                      className="h-6 w-5 text-gray-400"
                    />
                  </dt>
                  <dd className="text-sm leading-6 text-gray-500">
                    <time dateTime="2024-01-31">
                      {formatDate(invoiceDetails?.created_at)}
                    </time>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={isDownloading}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {isDownloading ? "Generating Invoice..." : "Download Invoice"}{" "}
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          {/* Invoice items */}
          <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Invoice
            </h2>
            <dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
              <div className="sm:pr-4">
                <dt className="inline text-gray-500">Issued on</dt>{" "}
                <dd className="inline text-gray-700">
                  <time dateTime={invoiceDetails.created_at}>
                    {invoiceDetails && formatDate(invoiceDetails.created_at)}
                  </time>
                </dd>
              </div>
              <div className="mt-2 sm:mt-0 sm:pl-4">
                <dt className="inline text-gray-500">Due on</dt>{" "}
                <dd className="inline text-gray-700">
                  <time dateTime="2024-01-31">January 31, 2024</time>
                </dd>
              </div>
              <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
                <dt className="font-semibold text-gray-900">From</dt>
                <dd className="mt-2 text-gray-500">
                  <span className="font-medium text-gray-900">
                    {data?.first_name}
                  </span>
                  <br />
                  {data?.company?.name}
                  <br />
                  {data?.phone_number}
                </dd>
              </div>
              <div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
                <dt className="font-semibold text-gray-900">To</dt>
                <dd className="mt-2 text-gray-500">
                  <span className="font-medium text-gray-900">
                    {invoiceDetails.customer.name}
                  </span>
                  <br />
                  {invoiceDetails.customer.phone_number}
                </dd>
              </div>
            </dl>
            <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
              <colgroup>
                <col className="w-full" />
                <col />
                <col />
                <col />
              </colgroup>
              <thead className="border-b border-gray-200 text-gray-900">
                <tr>
                  <th scope="col" className="px-0 py-3 font-semibold">
                    Products
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                  >
                    Rate
                  </th>
                  <th
                    scope="col"
                    className="py-3 pl-8 pr-0 text-right font-semibold"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.items?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="max-w-0 px-0 py-5 align-top">
                      <div className="truncate font-medium text-gray-900">
                        {item.product.name}
                      </div>
                      <div className="truncate text-gray-500">
                        {item.product.description}
                      </div>
                    </td>
                    <td className="hidden py-5 pl-8 pr-0 text-right align-top text-gray-500 sm:table-cell">
                      {item.quantity}
                    </td>
                    <td className="hidden py-5 pl-8 pr-0 text-right align-top text-gray-500 sm:table-cell">
                      Rs. {item.price}
                    </td>
                    <td className="py-5 pl-8 pr-0 text-right align-top text-gray-900">
                      Rs. {item.total_price}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pt-6 pl-0 pr-0 text-right font-normal sm:table-cell"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="row"
                    className="pt-6 pl-0 pr-0 text-left font-normal sm:hidden"
                  >
                    Subtotal
                  </th>
                  <td className="pt-6 pl-8 pr-0 text-right font-semibold text-gray-900">
                    Rs. {invoiceDetails.total_price}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
