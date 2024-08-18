import axiosInstance from "@/axiosInstance";
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
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Skeleton } from "@/components/ui/skeleton";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, CirclePlusIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(7).max(30),
  first_name: z.string().min(3).max(50),
  phone_number: z.string().min(11).max(13),
});

export default function TeamSettingsView() {
  const { data: userData } = useSWR("/api/v1/users/me/");
  const [open, setOpen] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    `/api/v1/users/?company=${userData?.company?.id}`
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      password: "",
      phone_number: "",
    },
  });

  const handleRoleChange = async (newRole: string, userId: string) => {
    try {
      await axiosInstance.patch(`/api/v1/users/${userId}/update_role/`, {
        role: newRole,
      });
      mutate();
      toast.success(`Role updated successfully to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    }
  };

  const ROLE_CHOICES = [
    {
      value: "Owner",
      label: "Owner",
      description: "Admin-level access to all resources.",
    },
    {
      value: "Admin",
      label: "Admin",
      description: "Can manage most settings and content.",
    },
    {
      value: "Member",
      label: "Member",
      description: "Can view and edit most content.",
    },
    {
      value: "Finance",
      label: "Finance",
      description: "Can view and manage financial data.",
    },
  ];

  function onSubmit(values: z.infer<typeof formSchema>) {
    const bodyData = {
      email: values.email,
      password: values.password,
      first_name: values.first_name,
      phone_number: values.phone_number,
      company: userData?.company?.id,
    };

    axiosInstance
      .post(`api/v1/users/invite_user/`, bodyData)
      .then((response) => {
        toast.success(`${response.data?.message}`);
        setOpen(false);
        mutate();
      })
      .catch((error) => {
        console.log({ error });
        toast.error(error?.response?.data?.email[0] || "Failed to invite user");
      });
  }

  return (
    <>
      <div className="divide-y divide-white/5">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-black">
              Roles and Permissions
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Add or remove a teammate or just update a role of a user.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full md:col-span-2"
            >
              <Card className="w-full border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Members</CardTitle>
                    <Button
                      className="flex gap-2"
                      onClick={() => {
                        setOpen(true);
                      }}
                      variant="outline"
                    >
                      <CirclePlusIcon />
                      Invite User
                    </Button>
                  </div>
                  <CardDescription>
                    Invite your team members to collaborate.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {isLoading ? (
                    <>
                      Name
                      <Skeleton className="h-4 w-full" />
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {data?.results.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between space-x-4"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src="/avatars/01.png" />
                              <AvatarFallback>AM</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {item?.first_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item?.email}
                              </p>
                            </div>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                disabled={item?.role == "Owner"}
                                variant="outline"
                                className="ml-auto"
                              >
                                {item.role}
                                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="end">
                              <Command>
                                <CommandInput placeholder="Select new role..." />
                                <CommandList>
                                  <CommandEmpty>No roles found.</CommandEmpty>
                                  <CommandGroup>
                                    {ROLE_CHOICES.map((role) => (
                                      <CommandItem
                                        key={role.value}
                                        disabled={role.value == "Owner"}
                                        onSelect={() =>
                                          handleRoleChange(role.value, item?.id)
                                        }
                                        className="space-y-1 flex flex-col items-start px-4 py-2"
                                      >
                                        <p>{role.label}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {role.description}
                                        </p>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex flex-col gap-2">
                <Toaster richColors />
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              When you invite a user it is always a member
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 md:gap-2 py-1 md:py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                        <Input
                          placeholder="********"
                          type="password"
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
                        <Input placeholder="Ex. +923214567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Invite User</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
