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
import { Input } from "@/components/ui/input";
import { NavLink } from "react-router-dom";
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(5).max(50),
});

function SignIn() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-cover bg-center p-6">
      <div className="w-full max-w-[350px] p-6 bg-white rounded-lg shadow-md">
        <img src="/logo2.svg" alt="Logo" className="w-24 h-auto mx-auto mb-6" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="test@gmail.com" {...field} />
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
                    <Input
                      placeholder="testpass123"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
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
