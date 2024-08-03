import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { DataTableDemo } from "@/components/ui/DataTable";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import useSWR from "swr";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RichTextEditorField from "@/components/ui/richtexteditorfield";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
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
  const { data, error, isLoading } = useSWR("/api/v1/products/");
  console.log("data: ", data);
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
  function onSubmit(values: z.infer<typeof formSchema>) {
    const body_data = {
      ...values,
      description: value,
    };
    console.log("body_data: ", body_data);
    axiosInstance
      .post("api/v1/products/", body_data)
      .then((data) => {
        toast.success(`Product ${data?.data?.name} saved!`);
      })
      .catch((e) => {
        toast.error("Something went wrong!");
      });
  }

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "product_type", header: "Product Type" },
    { accessorKey: "dimensions", header: "Dimensions" },
    { accessorKey: "size", header: "Size" },
    { accessorKey: "description", header: "Description" },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <section>
      <h1 className="font-bold">ProductsView</h1>
      <Sheet>
        {data && (
          <DataTableDemo data={data.results} columns={columns} type="Product" />
        )}
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add a Product</SheetTitle>
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
                    <FormItem className="">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Email</FormLabel>
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

                <FormField
                  control={form.control}
                  name="dimension"
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
                  <Button type="submit">Add a Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

export default ProductsView;
