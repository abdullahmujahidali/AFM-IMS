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
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(5).max(50),
  first_name: z.string().min(3).max(50),
  company_name: z.string().min(3).max(50),
});

const secondaryNavigation = [
  { name: "Account", href: "#", current: true },
  { name: "Notifications", href: "#", current: false },
  { name: "Billing", href: "#", current: false },
  { name: "Teams", href: "#", current: false },
  { name: "Integrations", href: "#", current: false },
];

export default function SettingsView() {
  const { data, error, isLoading } = useSWR("/api/v1/users/me/");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      company_name: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        email: data.email,
        password: "",
        first_name: data.first_name,
        company_name: data?.company?.name,
      });
    }
  }, [data, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values: ", values);
    axiosInstance
      .post("api/v1/users/", values)
      .then((data) => {
        toast.success(`User ${data?.data?.first_name} registered!`);
        navigate("/login/");
      })
      .catch((e) => {
        toast.error(e?.response?.data?.email?.[0]);
      });
  }

  return (
    <>
      <div>
        <div>
          <main>
            <h1 className="sr-only">Account Settings</h1>

            <header className="border-b border-white/5">
              {/* Secondary navigation */}
              <nav className="flex overflow-x-auto py-4">
                <ul
                  role="list"
                  className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
                >
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={item.current ? "text-indigo-400" : ""}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </header>

            {/* Settings forms */}
            <div className="divide-y divide-white/5">
              <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-black">
                    Personal Information
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
          </main>
        </div>
      </div>
    </>
  );
}
