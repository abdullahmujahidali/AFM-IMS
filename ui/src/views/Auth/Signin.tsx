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
import useAuth from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Anchor } from "@mantine/core";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(5).max(50),
});

function SignIn() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

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
      .then((res) => {
        toast.success(`Login Success`);
        setToken(res?.data);
        navigate("/dashboard");
      })
      .catch((e) => {
        console.log("e: ", e);
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
                  <FormLabel>Password</FormLabel>
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
