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
import { CompanyType } from "@/constants/api-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  owner_name: z.string().min(3).max(50),
  slug: z.string(),
  company_name: z.string(),
});

interface PersonalTypes {
  data: CompanyType;
  isLoading: boolean;
}

export default function CompanySettings(props: PersonalTypes) {
  const { data, isLoading } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner_name: "",
      slug: "",
      company_name: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        company_name: data?.name,
        slug: data?.slug,
        owner_name: data?.owner?.first_name,
      });
    }
  }, [data, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values: ", values);
    axiosInstance
      .patch(`/api/v1/company/${data?.id}/`, values)
      .then(() => {
        toast.success(`Company ${data?.name} updated!`);
      })
      .catch((e) => {
        toast.error(e?.response?.data?.name?.[0]);
      });
  }

  return (
    <>
      <div className="divide-y divide-white/5 border-t border-gray-100">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-black">
              Company Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Use a permanent address where you can receive mail.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full md:col-span-2"
            >
              {isLoading ? (
                <>
                  Owner
                  <Skeleton className="h-4 w-full" />
                  Slug
                  <Skeleton className="h-4 w-full" />
                  Company Name
                  <Skeleton className="h-4 w-full" />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex. Microsoft" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    disabled
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Unique Name</FormLabel>
                        <FormControl>
                          <Input placeholder="microsoft-1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="owner_name"
                    disabled
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <div className="flex flex-col gap-2">
                <Toaster richColors />
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
