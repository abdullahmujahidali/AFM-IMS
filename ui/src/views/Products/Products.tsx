import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { DataTableDemo } from "@/components/ui/DataTable";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useMemo } from "react";

import { Input } from "@/components/ui/input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3).max(50),
  price: z.string(),
  product_type: z.string(),
  dimension: z.string(),
  size: z.string(),
  description: z.string(),
});

function ProductsView() {
  const [value, setValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Sheet visibility
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product

  const { data, mutate, error, isLoading } = useSWR("/api/v1/products/");
  const { data: productObject } = useSWR(
    selectedProduct ? `/api/v1/products/${selectedProduct.id}` : null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "0.0",
      product_type: "",
      dimension: "",
      size: "",
      description: "",
    },
  });

  // Populate form when productObject changes
  useEffect(() => {
    if (productObject) {
      form.reset({
        name: productObject.name || "",
        price: productObject.price || "0.0",
        product_type: productObject.product_type || "",
        dimension: productObject.dimension || "",
        size: productObject.size || "",
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
        setIsSheetOpen(false); // Close the sheet after saving
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

  const handleRowClick = (product) => {
    setSelectedProduct(product); // Set the clicked product
    setIsSheetOpen(true); // Open the sheet
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <DataTableDemo
        onRowClick={handleRowClick}
        data={data.results}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                      <Input type="number" {...field} />
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
              {/* Remaining form fields go here... */}
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
  );
}

export default ProductsView;
