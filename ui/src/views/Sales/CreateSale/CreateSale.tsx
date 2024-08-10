import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { ComboboxDemo } from "@/components/ui/ComboBox";
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
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const formSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  products: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.string().min(1, "Price is required"),
      })
    )
    .min(1, "At least one product is required"),
  total_amount: z.string().min(1, "Total amount is required"),
  paying_amount: z.string().min(1, "Paying amount is required"),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function CreateSale() {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    balance: number;
  } | null>(null);
  const [descriptionValue, setDescriptionValue] = useState<string>("");
  const [calculatedBalance, setCalculatedBalance] = useState<number | null>(
    null
  );

  const { data: customers } = useSWR("/api/v1/customers/");
  const { data: products } = useSWR("/api/v1/products/");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: "",
      products: [{ product: "", quantity: 1, price: "" }],
      total_amount: "0",
      paying_amount: "",
      comments: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("products") || name === "paying_amount") {
        updateTotalAndBalance(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, selectedCustomer]);

  const updateTotalAndBalance = (formValues: Partial<FormValues>) => {
    const total =
      formValues.products?.reduce((sum, product) => {
        const quantity = product.quantity || 0;
        const price = parseFloat(product.price || "0");
        return sum + quantity * price;
      }, 0) || 0;

    form.setValue("total_amount", total.toFixed(2));

    if (selectedCustomer) {
      const payingAmount = parseFloat(formValues.paying_amount || "0");
      const newBalance = selectedCustomer.balance - total + payingAmount;
      setCalculatedBalance(newBalance);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedCustomer || calculatedBalance === null) {
      toast.error(
        "Please select a customer and calculate balance before submitting."
      );
      return;
    }

    const body_data = {
      customer_id: values.customer,
      products: values.products.map((product) => ({
        product_id: product.product,
        quantity: product.quantity,
        price: product.price,
      })),
      total_amount: values.total_amount,
      paying_amount: values.paying_amount,
      comments: values.comments,
      balance: calculatedBalance.toFixed(2),
    };

    try {
      await axiosInstance.post("api/v1/sales/", body_data);
      toast.success(`Sale saved!`);
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
        <h1 className="text-md font-bold tracking-tight text-gray-900 sm:text-2xl">
          Create a new sale!
        </h1>
        <div className="mt-2 sm:mt-0">
          <p className="text-sm text-gray-600">{currentDateTime}</p>
        </div>
      </div>
      {selectedCustomer && (
        <div>
          <h2>Customer: {selectedCustomer.name}</h2>
          <p>Initial Balance: {selectedCustomer.balance.toFixed(2)}</p>
          {calculatedBalance !== null && (
            <p>New Balance: {calculatedBalance.toFixed(2)}</p>
          )}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer field */}
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <ComboboxDemo
                    items={
                      customers?.results.map((customer) => ({
                        id: customer.id,
                        name: customer.name,
                      })) || []
                    }
                    placeholder="Search customer"
                    selectedValue={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      const customer = customers?.results.find(
                        (c) => c.id === value
                      );
                      if (customer) {
                        setSelectedCustomer({
                          name: customer.name,
                          balance: parseFloat(customer.balance),
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Products fields */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                {/* Product field */}
                <FormField
                  control={form.control}
                  name={`products.${index}.product`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Product</FormLabel>
                      <FormControl>
                        <ComboboxDemo
                          items={
                            products?.results.map((product) => ({
                              id: product.id,
                              name: product.name,
                            })) || []
                          }
                          placeholder="Search product"
                          selectedValue={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            const selectedProduct = products?.results.find(
                              (p) => p.id === value
                            );
                            if (selectedProduct) {
                              form.setValue(
                                `products.${index}.price`,
                                selectedProduct.price.toString()
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Quantity field */}
                <FormField
                  control={form.control}
                  name={`products.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          disabled={
                            !form.getValues(`products.${index}.product`)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Price field */}
                <FormField
                  control={form.control}
                  name={`products.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={
                            !form.getValues(`products.${index}.product`)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Remove button */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add Product button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ product: "", quantity: 1, price: "" })}
          >
            Add Product
          </Button>

          {/* Total Amount field */}
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    value={form.getValues("total_amount")}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Paying Amount field */}
          <FormField
            control={form.control}
            name="paying_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paying Amount</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display current balance */}
          {selectedCustomer && (
            <div className="text-bold">
              Current Balance: {selectedCustomer.balance.toFixed(2)}
            </div>
          )}

          {/* Comments field */}
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <RichTextEditorField
                  {...field}
                  value={descriptionValue}
                  onChange={(value) => {
                    setDescriptionValue(value);
                    field.onChange(value);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Save Sale</Button>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}

export default CreateSale;
