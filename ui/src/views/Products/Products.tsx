import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ListDataTable } from "@/components/ui/ListDataTable";
import RichTextEditorField from "@/components/ui/richtexteditorfield";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductTypes } from "@/constants/api-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3).max(50),
  price: z.string(),
  product_type: z.string(),
  dimensions: z.string(),
  stock_quantity: z.string().min(1),
  size: z.string(),
  description: z.string(),
});

function ProductsView() {
  const [value, setValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<null | ProductTypes>(
    null
  );
  const navigate = useNavigate();
  const {
    data: productsData,
    mutate,
    error,
    isLoading,
  } = useSWR("/api/v1/products/");
  const { data: productObject } = useSWR(
    selectedProduct ? `/api/v1/products/${selectedProduct.id}` : null
  );

  const totalStockQuantity =
    productsData?.results.reduce(
      (acc: number, product: ProductTypes) => acc + product.stock_quantity,
      0
    ) || 0;
  const totalValue =
    productsData?.results.reduce(
      (acc: number, product: ProductTypes) =>
        acc + product.price * product.stock_quantity,
      0
    ) || 0;
  const lowStockProducts = productsData?.results.filter(
    (product: ProductTypes) => product.stock_quantity < 5
  );

  const stats = [
    { name: "Total Products", value: productsData?.results.length || 0 },
    { name: "Total Stock Quantity", value: totalStockQuantity },
    {
      name: "Total Inventory Value",
      value: totalValue.toFixed(2),
      unit: "Rs",
    },
    { name: "Low Stock Products", value: lowStockProducts?.length || 0 },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "0.0",
      product_type: "",
      stock_quantity: "",
      dimensions: "",
      size: "",
      description: "",
    },
  });

  useEffect(() => {
    if (productObject) {
      form.reset({
        name: productObject.name || "",
        price: productObject.price || "0.0",
        product_type: productObject.product_type || "",
        dimensions: productObject.dimensions || "",
        size: productObject.size || "",
        stock_quantity: productObject.stock_quantity || "",
        description: productObject.description || "",
      });
      setValue(productObject.description || "");
    }
  }, [productObject, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const body_data = {
      ...values,
      description: value,
    };

    const request = selectedProduct
      ? axiosInstance.put(`/api/v1/products/${selectedProduct.id}/`, body_data)
      : axiosInstance.post("/api/v1/products/", body_data);

    request
      .then((data) => {
        setIsSheetOpen(false);
        toast.success(`Product ${data?.data?.name} saved!`);
        mutate();
      })
      .catch(() => {
        toast.error("Something went wrong!");
      });
  }

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "price", header: "Price" },
      { accessorKey: "product_type", header: "Product Type" },
      { accessorKey: "dimensions", header: "Dimensions" },
      { accessorKey: "size", header: "Size" },
      { accessorKey: "stock_quantity", header: "Stock" },
      { accessorKey: "description", header: "Description" },
    ],
    []
  );

  const handleRowClick = (product: ProductTypes) => {
    setSelectedProduct(product); // Set the clicked product
    setIsSheetOpen(true); // Open the sheet
  };

  const navigateToDetails = (product: ProductTypes) => {
    navigate(`/dashboard/products/${product?.id}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-x-8 gap-y-4 px-4 py-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg">
        <div>
          <div className="flex items-center gap-x-3">
            <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h1 className="flex gap-x-3 text-xl sm:text-2xl font-bold text-gray-900">
              <span>Products</span>
            </h1>
          </div>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            List of all products that are your business offers.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white shadow rounded-lg p-6 flex flex-col items-start justify-center"
          >
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-sm sm:text-base text-gray-500">
                  {stat.unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <ListDataTable
          onRowClick={handleRowClick}
          data={productsData.results}
          detailsNavigator={navigateToDetails}
          mutate={mutate}
          columns={columns}
          type="Product"
        />
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedProduct
                ? `Edit Product: ${selectedProduct.name}`
                : "Add a Product"}
            </SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 md:gap-4 py-1 md:py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="product_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a Product Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="FRAME">Trunk Frame</SelectItem>
                            <SelectItem value="DRUM">Drum Frame</SelectItem>
                            <SelectItem value="COOLER">Cooler Frame</SelectItem>
                            <SelectItem value="RING">Ring Frame</SelectItem>
                            <SelectItem value="ANGLE">Angle Frame</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Dimension</FormLabel>
                      <FormControl>
                        <Input placeholder="72 1¼ x 35" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="9.ft Height" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextEditorField
                          {...field}
                          editorHtml={value}
                          setEditorHtml={setValue}
                          placeholder={"Description of the product"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Toaster richColors />
                  <Button type="submit">
                    {selectedProduct ? "Update Product" : "Add a Product"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default ProductsView;
