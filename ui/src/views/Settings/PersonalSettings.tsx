import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  first_name: z.string().min(3).max(50),
  phone_number: z.string().min(11).max(13),
});

interface PersonalTypes {
  data: Record<string, string>;
  isLoading: boolean;
}

export default function PersonalSettings(props: PersonalTypes) {
  const { data, isLoading } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      phone_number: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        email: data.email,
        first_name: data.first_name,
        phone_number: data?.phone_number,
      });
    }
  }, [data, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values: ", values);
    axiosInstance
      .patch(`api/v1/users/${data.id}/`, values)
      .then((data) => {
        toast.success(`User ${data?.data?.first_name} updated!`);
      })
      .catch((e) => {
        toast.error(e?.response?.data?.email?.[0]);
      });
  }

  return (
    <>
      <div className="divide-y divide-white/5">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-black">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              It contains your personal information about yourself, you cannot
              edit your email however you can change your name
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full md:col-span-2"
            >
              {isLoading ? (
                <>
                  Name
                  <Skeleton className="h-4 w-full" />
                  Email
                  <Skeleton className="h-4 w-full" />
                  Password
                  <Skeleton className="h-4 w-full" />
                  Company Name
                  <Skeleton className="h-4 w-full" />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="text-left">
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
                    name="email"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            placeholder="john@doe.com"
                            {...field}
                          />
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
                          <Input placeholder="Ex. +923229437619" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="flex flex-col gap-2">
                <Toaster richColors />
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
