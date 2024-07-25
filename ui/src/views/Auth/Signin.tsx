import axiosInstance from "@/axiosInstance";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Anchor } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

import { Input } from "@/components/ui/input";
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(5).max(50),
});

function SignIn() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    axiosInstance
      .post("/api/token/", values)
      .then((data) => {
        toast.success(`Login Success`);
        localStorage.setItem("access", data?.data?.access);
        localStorage.setItem("refresh", data?.data?.refresh);
        navigate("/");
      })
      .catch((e) => {
        toast.error(e?.response?.data?.detail);
      });
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-cover bg-center p-6">
      <div className="w-full max-w-[350px] p-6 bg-white rounded-lg shadow-md">
        <img src="/logo2.svg" alt="Logo" className="w-24 h-auto mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@doe.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel className="text-left">Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*********" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <Toaster richColors />
              <Button type="submit">Login</Button>
              <NavLink to="/signup/">
                <Anchor fw={500} fz="sm">
                  Don't have an account?
                </Anchor>
              </NavLink>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default SignIn;
