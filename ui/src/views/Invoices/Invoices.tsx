import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoicesView() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders data
  const {
    data: ordersData,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/v1/orders/");

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!ordersData?.results)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        pendingRevenue: 0,
      };

    const results = ordersData.results;
    return {
      totalOrders: results.length,
      totalRevenue: results.reduce(
        (sum, order) => sum + parseFloat(order.total_price),
        0
      ),
      pendingOrders: results.filter((order) => order.status === "PENDING")
        .length,
      pendingRevenue: results
        .filter((order) => order.status === "PENDING")
        .reduce((sum, order) => sum + parseFloat(order.total_price), 0),
      completedOrders: results.filter((order) =>
        ["DELIVERED", "SHIPPED"].includes(order.status)
      ).length,
    };
  }, [ordersData]);

  // Filter and sort the orders
  const filteredOrders = useMemo(() => {
    if (!ordersData?.results) return [];

    return ordersData.results
      .filter((order) => {
        // Apply status filter
        if (statusFilter !== "all" && order.status !== statusFilter) {
          return false;
        }

        // Apply search filter (search by customer name or order ID)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            order.id.toLowerCase().includes(query) ||
            order.customer.name.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [ordersData, statusFilter, searchQuery]);

  // Paginate the orders
  const displayedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  // Handle view details click
  const handleViewDetails = (order) => {
    navigate(`/dashboard/invoices/edit/${order.id}`);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case "PROCESSING":
        return (
          <Badge className="bg-purple-100 text-purple-800">Processing</Badge>
        );
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 flex items-center space-x-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <div>
          <h3 className="text-lg font-medium text-red-800">
            Error loading invoices
          </h3>
          <p className="text-red-600">
            Please check if the backend API is working correctly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between gap-x-8 gap-y-4 px-4 py-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg">
        <div>
          <div className="flex items-center gap-x-3">
            <div className="flex-none rounded-full bg-indigo-400/10 p-1 text-indigo-400">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h1 className="flex gap-x-3 text-xl sm:text-2xl font-bold text-gray-900">
              <span>Invoices</span>
            </h1>
          </div>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Manage and track all your customer invoices in one place
          </p>
        </div>

        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/dashboard/sales/create")}
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Invoices
                </p>
                <p className="text-2xl font-bold mt-1">
                  {summaryMetrics.totalOrders}
                </p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-full">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(summaryMetrics.totalRevenue)}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-full">
                <Download className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Invoices
                </p>
                <p className="text-2xl font-bold mt-1">
                  {summaryMetrics.pendingOrders}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-full">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(summaryMetrics.pendingRevenue)} pending payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold mt-1">
                  {summaryMetrics.completedOrders}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by invoice ID or customer..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(val) => setPageSize(Number(val))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedOrders.length > 0 ? (
                displayedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetails(order)}
                  >
                    <TableCell className="font-medium">
                      {order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.customer.phone_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        {formatDate(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `/dashboard/invoices/edit/${order.id}`,
                                "_blank"
                              );
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-10 w-10 mb-2" />
                      <p>No invoices found</p>
                      {searchQuery && (
                        <p className="text-sm mt-1">
                          Try changing your search or filter
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {displayedOrders.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredOrders.length)} of{" "}
              {filteredOrders.length} invoices
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((curr) => Math.max(curr - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((curr) => Math.min(curr + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
