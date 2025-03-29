import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Banknote,
  FileText,
  Package,
  PlusCircle,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";

export default function DashboardView() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Fetch data from the backend
  const { data: customersData } = useSWR("/api/v1/customers/");
  const { data: productsData } = useSWR("/api/v1/products/");
  const { data: salesData } = useSWR("/api/v1/sales/");
  const { data: ordersData } = useSWR("/api/v1/orders/");
  const { data: userData } = useSWR("/api/v1/users/me/");

  // State for dashboard metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    revenueChange: 0,
    salesChange: 0,
  });

  // State for charts data
  const [recentSales, setRecentSales] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerBalance, setCustomerBalance] = useState([]);

  // Process data when loaded
  useEffect(() => {
    if (customersData && productsData && salesData && ordersData) {
      setIsLoading(false);
      processData();
    }
  }, [customersData, productsData, salesData, ordersData, selectedPeriod]);

  const processData = () => {
    // Process metrics
    calculateMetrics();

    // Process chart data
    prepareRecentSales();
    prepareSalesTrend();
    prepareProductCategories();
    prepareTopProducts();
    prepareCustomerBalance();
  };

  const calculateMetrics = () => {
    if (
      !salesData?.results ||
      !customersData?.results ||
      !productsData?.results ||
      !ordersData?.results
    )
      return;

    const sales = salesData.results;
    const now = new Date();

    // Calculate total revenue and sales
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount),
      0
    );
    const totalSales = sales.length;

    // Calculate period for comparison (last week, month, etc.)
    const periodDays =
      selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 90;
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - periodDays);
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);

    // Filter sales by period
    const currentPeriodSales = sales.filter(
      (sale) => new Date(sale.created_at) >= currentPeriodStart
    );
    const previousPeriodSales = sales.filter(
      (sale) =>
        new Date(sale.created_at) >= previousPeriodStart &&
        new Date(sale.created_at) < currentPeriodStart
    );

    // Calculate revenue and sales change
    const currentPeriodRevenue = currentPeriodSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount),
      0
    );
    const previousPeriodRevenue = previousPeriodSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount),
      0
    );
    const revenueChange =
      previousPeriodRevenue === 0
        ? 100
        : ((currentPeriodRevenue - previousPeriodRevenue) /
            previousPeriodRevenue) *
          100;

    const salesChange =
      previousPeriodSales.length === 0
        ? 100
        : ((currentPeriodSales.length - previousPeriodSales.length) /
            previousPeriodSales.length) *
          100;

    // Other metrics
    const lowStockProducts = productsData.results.filter(
      (product) => product.stock_quantity <= 10
    ).length;
    const pendingOrders = ordersData.results.filter(
      (order) => order.status === "PENDING"
    ).length;

    setMetrics({
      totalRevenue,
      totalSales,
      totalCustomers: customersData.results.length,
      totalProducts: productsData.results.length,
      lowStockProducts,
      pendingOrders,
      revenueChange,
      salesChange,
    });
  };

  const prepareRecentSales = () => {
    if (!salesData?.results) return;

    // Get 5 most recent sales with customer details
    const recent = [...salesData.results]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)
      .map((sale) => ({
        id: sale.id,
        customer: sale.customer.name,
        amount: parseFloat(sale.total_amount),
        date: format(new Date(sale.created_at), "MMM dd, yyyy"),
        status:
          parseFloat(sale.amount_paid) >= parseFloat(sale.total_amount)
            ? "paid"
            : "pending",
      }));

    setRecentSales(recent);
  };

  const prepareSalesTrend = () => {
    if (!salesData?.results) return;

    const sales = salesData.results;
    let periodFormat, periodUnit;

    // Determine grouping based on selected period
    if (selectedPeriod === "week") {
      periodFormat = "EEE"; // day of week (Mon, Tue, etc.)
      periodUnit = "day";
    } else if (selectedPeriod === "month") {
      periodFormat = "dd MMM"; // day of month
      periodUnit = "day";
    } else {
      periodFormat = "MMM yyyy"; // month and year
      periodUnit = "month";
    }

    // Group sales by period
    const salesByPeriod = {};
    sales.forEach((sale) => {
      const date = new Date(sale.created_at);
      const periodKey = format(date, periodFormat);

      if (!salesByPeriod[periodKey]) {
        salesByPeriod[periodKey] = {
          period: periodKey,
          revenue: 0,
          orders: 0,
        };
      }

      salesByPeriod[periodKey].revenue += parseFloat(sale.total_amount);
      salesByPeriod[periodKey].orders += 1;
    });

    // Convert to array and sort
    const trendData = Object.values(salesByPeriod);

    // Sort by date
    if (selectedPeriod === "week") {
      const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      trendData.sort(
        (a, b) => daysOrder.indexOf(a.period) - daysOrder.indexOf(b.period)
      );
    } else {
      trendData.sort((a, b) => {
        const dateA = parsePeriodKey(a.period, periodFormat);
        const dateB = parsePeriodKey(b.period, periodFormat);
        return dateA - dateB;
      });
    }

    setSalesTrend(trendData);
  };

  // Helper function to parse period keys back to dates for sorting
  const parsePeriodKey = (key, format) => {
    if (format === "EEE") {
      const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return daysOrder.indexOf(key);
    } else if (format === "dd MMM") {
      return new Date(key + " " + new Date().getFullYear()).getTime();
    } else {
      return new Date(key).getTime();
    }
  };

  const prepareProductCategories = () => {
    if (!productsData?.results) return;

    // Group products by category
    const categories = {};
    productsData.results.forEach((product) => {
      const category = product.product_type;
      if (!categories[category]) {
        categories[category] = {
          name: formatProductType(category),
          value: 0,
          count: 0,
        };
      }
      categories[category].count += 1;
      categories[category].value += 1;
    });

    setProductCategories(Object.values(categories));
  };

  const formatProductType = (type) => {
    const typeMappings = {
      TRUNK: "Trunk Frame",
      DRUM: "Drum Frame",
      COOLER: "Cooler Frame",
      RING: "Ring Frame",
      ANGLE: "Angle",
    };

    return typeMappings[type] || type;
  };

  const prepareTopProducts = () => {
    if (!salesData?.results) return;

    // Count sales for each product
    const productSales = {};

    salesData.results.forEach((sale) => {
      if (sale.items) {
        sale.items.forEach((item) => {
          const productId = item.product.id;
          const productName = item.product.name;

          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: productName,
              quantity: 0,
              revenue: 0,
              type: item.product.product_type,
            };
          }

          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        });
      }
    });

    // Convert to array and get top 5 by quantity
    const topProductsList = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setTopProducts(topProductsList);
  };

  const prepareCustomerBalance = () => {
    if (!customersData?.results) return;

    // Group customers by balance range
    const ranges = [
      { name: "Negative", min: Number.NEGATIVE_INFINITY, max: 0 },
      { name: "0 - 5,000", min: 0, max: 5000 },
      { name: "5,001 - 10,000", min: 5000, max: 10000 },
      { name: "10,001+", min: 10000, max: Number.POSITIVE_INFINITY },
    ];

    const balanceGroups = ranges.map((range) => ({
      name: range.name,
      value: customersData.results.filter(
        (customer) =>
          parseFloat(customer.balance) > range.min &&
          parseFloat(customer.balance) <= range.max
      ).length,
    }));

    setCustomerBalance(balanceGroups);
  };

  // Chart colors
  const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#0ea5e9", "#14b8a6"];
  const CUSTOMER_COLORS = ["#ef4444", "#84cc16", "#06b6d4", "#8b5cf6"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {userData?.first_name || "User"}! Here's what's
            happening with your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            Month
          </Button>
          <Button
            variant={selectedPeriod === "quarter" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("quarter")}
          >
            Quarter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(metrics.totalRevenue)}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              {metrics.revenueChange >= 0 ? (
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.revenueChange).toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 bg-red-50">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.revenueChange).toFixed(1)}%
                </Badge>
              )}
              <span className="text-xs text-gray-500 ml-2">
                vs last {selectedPeriod}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold mt-1">
                  {metrics.totalSales}
                </h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-full">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              {metrics.salesChange >= 0 ? (
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.salesChange).toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 bg-red-50">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(metrics.salesChange).toFixed(1)}%
                </Badge>
              )}
              <span className="text-xs text-gray-500 ml-2">
                vs last {selectedPeriod}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <h3 className="text-2xl font-bold mt-1">
                  {metrics.totalCustomers}
                </h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-purple-600 p-0 h-auto"
                onClick={() => navigate("/dashboard/customers")}
              >
                View all customers →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inventory Alert
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {metrics.lowStockProducts}
                </h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-full">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <Badge variant="outline" className="text-amber-600 bg-amber-50">
                {metrics.lowStockProducts} low stock items
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Revenue and orders over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip
                  formatter={(value) =>
                    isNaN(value) ? value : formatCurrency(value)
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (Rs)"
                  stroke="#4f46e5"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {productCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} products`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products by quantity sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center">
                    <div className="w-8 text-center font-medium text-gray-500">
                      #{index + 1}
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatProductType(product.type)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {product.quantity} units
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No sales data available
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/dashboard/products")}
              >
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest customer transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center">
                    <div className="mr-4 flex-shrink-0">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          sale.status === "paid"
                            ? "bg-green-100"
                            : "bg-amber-100"
                        }`}
                      >
                        {sale.status === "paid" ? (
                          <ShoppingBag className="h-5 w-5 text-green-600" />
                        ) : (
                          <Truck className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{sale.customer}</div>
                      <div className="text-sm text-gray-500">{sale.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(sale.amount)}
                      </div>
                      <Badge
                        className={
                          sale.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      >
                        {sale.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No recent sales
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/dashboard/sales")}
              >
                View All Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Balance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Balances</CardTitle>
            <CardDescription>Distribution by balance range</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerBalance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Number of Customers"
                  fill="#4f46e5"
                  radius={[0, 4, 4, 0]}
                >
                  {customerBalance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center text-left space-y-2"
                onClick={() => navigate("/dashboard/sales/create")}
              >
                <ShoppingCart className="h-6 w-6 text-indigo-600" />
                <div className="text-sm font-medium">New Sale</div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center text-left space-y-2"
                onClick={() => navigate("/dashboard/customers")}
              >
                <Users className="h-6 w-6 text-blue-600" />
                <div className="text-sm font-medium">Add Customer</div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center text-left space-y-2"
                onClick={() => navigate("/dashboard/products")}
              >
                <Package className="h-6 w-6 text-emerald-600" />
                <div className="text-sm font-medium">Manage Products</div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center text-left space-y-2"
                onClick={() => navigate("/dashboard/invoices")}
              >
                <FileText className="h-6 w-6 text-amber-600" />
                <div className="text-sm font-medium">View Invoices</div>
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Pending Orders</h4>
                  <p className="text-sm text-gray-500">
                    {metrics.pendingOrders} orders awaiting processing
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/invoices")}
                >
                  View Orders
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate("/dashboard/sales/create")}
            >
              <PlusCircle className="h-4 w-4" />
              Create New Sale
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
