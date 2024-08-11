import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { ComboboxDemo } from "@/components/ui/ComboBox";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const formSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  products: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.string().min(1, "Quantity must be at least 1"),
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
  const { saleId } = useParams();
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
  const { data: saleObject } = useSWR(
    saleId ? `/api/v1/sales/${saleId}` : null
  );
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
    if (saleObject) {
      form.setValue("customer", saleObject.customer.id);
      setSelectedCustomer({
        name: saleObject.customer.name,
        balance: parseFloat(saleObject.customer.balance),
      });

      saleObject.products.forEach((product, index: number) => {
        if (index === 0) {
          form.setValue(`products.${index}.product`, product.product.id);
          form.setValue(`products.${index}.quantity`, product.quantity);
          form.setValue(`products.${index}.price`, product.price);
        } else {
          append({
            product: product.product.id,
            quantity: product.quantity,
            price: product.price,
          });
        }
      });

      form.setValue("total_amount", saleObject.total_amount);
      form.setValue("comments", saleObject.comments || "");
      setCalculatedBalance(saleObject.balance);
    }
  }, [saleObject, append, form]);

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
      if (saleId) {
        await axiosInstance.put(`/api/v1/sales/${saleId}/`, body_data);
        toast.success(`Sale updated!`);
      } else {
        await axiosInstance.post("/api/v1/sales/", body_data);
        toast.success(`Sale created!`);
      }
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6">
        <h1 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {saleId ? "Edit Sale" : "Create a new sale!"}
        </h1>
        <div className="mt-2 sm:mt-0">
          <p className="text-sm sm:text-base text-gray-500">
            {currentDateTime}
          </p>
        </div>
      </div>

      {selectedCustomer && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-md font-bold tracking-tight text-gray-800 sm:text-2xl">
            Customer: {selectedCustomer.name}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Initial Balance:{" "}
            <span className="font-medium">
              {selectedCustomer.balance.toFixed(2)}
            </span>
          </p>
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

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
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
                    <FormItem className="w-24">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input min={2} max={10} type="number" {...field} />
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
                    <FormItem className="w-24">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remove button */}
                <div className="flex items-center justify-center mt-auto">
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="ghost"
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ product: "", quantity: "1", price: "" })}
          >
            Add another product
          </Button>
          <div className="flex flex-col md:flex-row w-full gap-2">
            {/* Total Amount field */}
            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} readOnly />
                  </FormControl>
                  <FormDescription>
                    Total amount of the products being purchased.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paying Amount field */}
            <FormField
              control={form.control}
              name="paying_amount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Paying Amount</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Amount being payed by the user
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Comments field */}
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <RichTextEditorField
                    value={descriptionValue}
                    onChange={setDescriptionValue}
                    placeholder="Add comments here"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {calculatedBalance !== null && (
            <p>New Balance: {calculatedBalance.toFixed(2)}</p>
          )}
          <Button type="submit">
            {saleId ? "Update Sale" : "Create Sale"}
          </Button>
        </form>
      </Form>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default CreateSale;
