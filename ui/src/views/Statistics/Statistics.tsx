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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  DollarSignIcon,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";

export default function StatisticsView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from the backend
  const { data: customersData } = useSWR("/api/v1/customers/");
  const { data: productsData } = useSWR("/api/v1/products/");
  const { data: salesData } = useSWR("/api/v1/sales/");
  const { data: ordersData } = useSWR("/api/v1/orders/");

  // Sample data for visualizations (will be replaced by actual data once loaded)
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [customersByBalance, setCustomersByBalance] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeCustomers: 0,
    lowStockProducts: 0,
    salesGrowth: 0,
    revenueGrowth: 0,
  });

  // Process data when it's loaded
  useEffect(() => {
    if (customersData && productsData && salesData) {
      setIsLoading(false);

      // Process data for visualizations
      processSalesData();
      processProductData();
      processCustomerData();
      calculateSummaryData();
    }
  }, [customersData, productsData, salesData, ordersData]);

  const processSalesData = () => {
    if (!salesData?.results) return;

    // Process sales by month
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlySales = monthNames.map((month) => ({
      month,
      revenue: 0,
      orders: 0,
    }));

    salesData.results.forEach((sale) => {
      const date = new Date(sale.created_at);
      const monthIndex = date.getMonth();
      monthlySales[monthIndex].revenue += parseFloat(sale.total_amount);
      monthlySales[monthIndex].orders += 1;
    });

    setSalesByMonth(monthlySales);
  };

  const processProductData = () => {
    if (!productsData?.results || !salesData?.results) return;

    // Create a map of product sales
    const productSalesMap = new Map();

    // Initialize with all products
    productsData.results.forEach((product) => {
      productSalesMap.set(product.id, {
        name: product.name,
        sales: 0,
        revenue: 0,
        type: product.product_type,
      });
    });

    // Count sales for each product
    salesData.results.forEach((sale) => {
      if (sale.items) {
        sale.items.forEach((item) => {
          const productId = item.product.id;
          const productData = productSalesMap.get(productId);

          if (productData) {
            productData.sales += item.quantity;
            productData.revenue += parseFloat(item.price) * item.quantity;
            productSalesMap.set(productId, productData);
          }
        });
      }
    });

    // Convert map to array and sort by sales
    const productSalesArray = Array.from(productSalesMap.values());

    // Top selling products
    const topProducts = [...productSalesArray]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    setTopSellingProducts(topProducts);

    // Group by product type
    const salesByType = [];
    const typeMap = new Map();

    productSalesArray.forEach((product) => {
      const type = product.type;
      if (typeMap.has(type)) {
        const existing = typeMap.get(type);
        existing.value += product.sales;
        typeMap.set(type, existing);
      } else {
        typeMap.set(type, { name: type, value: product.sales });
      }
    });

    setProductSales(Array.from(typeMap.values()));

    // Inventory status
    const inventoryStatusData = [
      {
        name: "In Stock",
        value: productsData.results.filter((p) => p.stock_quantity > 10).length,
      },
      {
        name: "Low Stock",
        value: productsData.results.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity <= 10
        ).length,
      },
      {
        name: "Out of Stock",
        value: productsData.results.filter((p) => p.stock_quantity === 0)
          .length,
      },
    ];

    setInventoryStatus(inventoryStatusData);
  };

  const processCustomerData = () => {
    if (!customersData?.results) return;

    // Group customers by balance range
    const balanceGroups = [
      { range: "Negative (Owing)", customers: [] },
      { range: "0-5,000", customers: [] },
      { range: "5,001-10,000", customers: [] },
      { range: "10,001+", customers: [] },
    ];

    customersData.results.forEach((customer) => {
      const balance = parseFloat(customer.balance);

      if (balance < 0) {
        balanceGroups[0].customers.push(customer);
      } else if (balance <= 5000) {
        balanceGroups[1].customers.push(customer);
      } else if (balance <= 10000) {
        balanceGroups[2].customers.push(customer);
      } else {
        balanceGroups[3].customers.push(customer);
      }
    });

    const balanceData = balanceGroups.map((group) => ({
      name: group.range,
      value: group.customers.length,
    }));

    setCustomersByBalance(balanceData);
  };

  const calculateSummaryData = () => {
    if (
      !customersData?.results ||
      !productsData?.results ||
      !salesData?.results
    )
      return;

    // Calculate totals and growth
    const totalSales = salesData.results.length;
    const totalRevenue = salesData.results.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount),
      0
    );
    const totalCustomers = customersData.results.length;
    const totalProducts = productsData.results.length;
    const activeCustomers = new Set(
      salesData.results.map((sale) => sale.customer.id)
    ).size;
    const lowStockProducts = productsData.results.filter(
      (p) => p.stock_quantity <= 10
    ).length;

    // Calculate month-over-month growth (simplified)
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthSales = salesData.results.filter(
      (sale) => new Date(sale.created_at).getMonth() === currentMonth
    ).length;

    const previousMonthSales = salesData.results.filter(
      (sale) => new Date(sale.created_at).getMonth() === previousMonth
    ).length;

    const currentMonthRevenue = salesData.results
      .filter((sale) => new Date(sale.created_at).getMonth() === currentMonth)
      .reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    const previousMonthRevenue = salesData.results
      .filter((sale) => new Date(sale.created_at).getMonth() === previousMonth)
      .reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    const salesGrowth =
      previousMonthSales === 0
        ? 100
        : ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
    const revenueGrowth =
      previousMonthRevenue === 0
        ? 100
        : ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100;

    setSummaryData({
      totalSales,
      totalRevenue,
      totalCustomers,
      totalProducts,
      activeCustomers,
      lowStockProducts,
      salesGrowth,
      revenueGrowth,
    });
  };

  // Colors for charts
  const COLORS = ["#4f46e5", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6"];
  const STATUS_COLORS = {
    "In Stock": "#22c55e",
    "Low Stock": "#f59e0b",
    "Out of Stock": "#ef4444",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Statistics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Analytical overview of your business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            {format(new Date(), "MMMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  Rs. {summaryData.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <DollarSignIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              {summaryData.revenueGrowth >= 0 ? (
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {Math.abs(summaryData.revenueGrowth).toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 bg-red-50">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(summaryData.revenueGrowth).toFixed(1)}%
                </Badge>
              )}
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold mt-1">
                  {summaryData.totalSales}
                </h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-full">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              {summaryData.salesGrowth >= 0 ? (
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {Math.abs(summaryData.salesGrowth).toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 bg-red-50">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(summaryData.salesGrowth).toFixed(1)}%
                </Badge>
              )}
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <h3 className="text-2xl font-bold mt-1">
                  {summaryData.totalCustomers}
                </h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className="text-xs font-medium text-gray-500">
                {summaryData.activeCustomers} active customers
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Products</p>
                <h3 className="text-2xl font-bold mt-1">
                  {summaryData.totalProducts}
                </h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-full">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <Badge variant="outline" className="text-amber-600 bg-amber-50">
                {summaryData.lowStockProducts} low stock
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-neutral-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange("monthly")}
              className={
                dateRange === "monthly" ? "bg-indigo-50 text-indigo-600" : ""
              }
            >
              Monthly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange("quarterly")}
              className={
                dateRange === "quarterly" ? "bg-indigo-50 text-indigo-600" : ""
              }
            >
              Quarterly
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange("yearly")}
              className={
                dateRange === "yearly" ? "bg-indigo-50 text-indigo-600" : ""
              }
            >
              Yearly
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales & Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue and number of orders
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Revenue (Rs)"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="orders"
                      name="Number of Orders"
                      fill="#93c5fd"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
                <CardDescription>
                  Distribution of sales by product type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productSales}
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
                      {productSales.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Products with the highest sales volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellingProducts.map((product, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 text-center font-medium text-gray-500">
                        #{index + 1}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{product.sales} units</div>
                        <div className="text-sm text-gray-500">
                          Rs. {product.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>
                  Current stock levels of products
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {inventoryStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>
                  Monthly revenue with trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesByMonth}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (Rs)"
                      stroke="#4f46e5"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume</CardTitle>
                  <CardDescription>Number of orders by month</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="Number of Orders"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Order Value</CardTitle>
                  <CardDescription>Average revenue per order</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesByMonth.map((month) => ({
                        ...month,
                        avg:
                          month.orders > 0 ? month.revenue / month.orders : 0,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="avg"
                        name="Avg. Order Value (Rs)"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Sales Distribution</CardTitle>
                <CardDescription>Sales by product category</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productSales}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {productSales.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Stock level distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={inventoryStatus}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Number of Products"
                      radius={[0, 4, 4, 0]}
                    >
                      {inventoryStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products with highest revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topSellingProducts.slice(0, 5)}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue (Rs)"
                    fill="#4f46e5"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="sales"
                    name="Units Sold"
                    fill="#93c5fd"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution by Balance</CardTitle>
                <CardDescription>
                  Grouping of customers by account balance
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customersByBalance}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {customersByBalance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active vs. Inactive Customers</CardTitle>
                <CardDescription>Customer engagement analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: summaryData.activeCustomers },
                        {
                          name: "Inactive",
                          value:
                            summaryData.totalCustomers -
                            summaryData.activeCustomers,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#4f46e5" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Customer Activity</CardTitle>
              <CardDescription>
                Recent customer orders and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {salesData?.results?.slice(0, 5).map((sale, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{sale.customer.name}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        Purchased {sale.items.length} items for Rs.{" "}
                        {parseFloat(sale.total_amount).toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {format(new Date(sale.created_at), "MMMM dd, yyyy")}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant={
                          sale.amount_paid >= sale.total_amount
                            ? "success"
                            : "default"
                        }
                      >
                        {sale.amount_paid >= sale.total_amount
                          ? "Paid"
                          : "Partial Payment"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Customer Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
