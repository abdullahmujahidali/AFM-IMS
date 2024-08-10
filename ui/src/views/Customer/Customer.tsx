import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { DataTableDemo } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3).max(50),
  phone_number: z.string().min(11).max(13),
  balance: z.string(),
});

function CustomerView() {
  const { data, error, mutate, isLoading } = useSWR("/api/v1/customers/");
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Selected customer

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      balance: "0",
    },
  });

  useEffect(() => {
    if (selectedCustomer) {
      const fetchCustomer = async () => {
        const response = await axiosInstance.get(
          `/api/v1/customers/${selectedCustomer.id}`
        );
        form.reset({
          name: response.data.name || "",
          phone_number: response.data.phone_number || "",
          balance: response.data.balance || 0,
        });
      };
      fetchCustomer();
    } else {
      setSelectedCustomer(null);
      form.reset(); // Reset form for new customer
    }
  }, [selectedCustomer, form]);

  useEffect(() => {
    if (!open) {
      setSelectedCustomer(null);
      form.reset();
    }
  }, [open]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const body_data = {
      ...values,
      balance: parseFloat(values.balance) || 0,
    };

    const request = selectedCustomer
      ? axiosInstance.put(
          `/api/v1/customers/${selectedCustomer.id}/`,
          body_data
        )
      : axiosInstance.post("api/v1/customers/", body_data);

    request
      .then((data) => {
        toast.success(`Customer ${data?.data?.name} saved!`);
        setOpen(false);
        mutate();
      })
      .catch(() => {
        toast.error("Something went wrong!");
      });
  }

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone_number", header: "Phone Number" },
    { accessorKey: "balance", header: "Balance" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "modified_at", header: "Modified At" },
  ];

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer); // Set the clicked customer
    setOpen(true); // Open the dialog
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DataTableDemo
        onRowClick={handleRowClick}
        data={data.results}
        columns={columns}
        type="Customer"
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedCustomer ? "Edit Customer" : "Add a Customer"}
          </DialogTitle>
          <DialogDescription>
            {selectedCustomer
              ? "Edit the details of the customer."
              : "Add a new customer."}
          </DialogDescription>
        </DialogHeader>

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
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Toaster richColors />
                <Button type="submit">
                  {selectedCustomer ? "Update Customer" : "Add a Customer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerView;
