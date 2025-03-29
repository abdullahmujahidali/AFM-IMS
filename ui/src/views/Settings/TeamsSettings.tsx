import axiosInstance from "@/axiosInstance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronDown,
  CirclePlus,
  Crown,
  Edit,
  MoreHorizontal,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const RoleIcon = ({ roleName }) => {
  const IconComponent = ROLE_ICONS[roleName];
  return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null;
};

const inviteFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  first_name: z.string().min(2, "Name must be at least 2 characters").max(50),
  password: z.string().min(7, "Password must be at least 7 characters"),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15),
});

const permissionsOptions = [
  {
    label: "Access Control",
    options: [
      { value: "view_all", label: "View all content" },
      { value: "edit_all", label: "Edit all content" },
      { value: "delete_all", label: "Delete content" },
    ],
  },
  {
    label: "User Management",
    options: [
      { value: "invite_users", label: "Invite team members" },
      { value: "manage_roles", label: "Manage roles & permissions" },
    ],
  },
  {
    label: "Financial",
    options: [
      { value: "view_finances", label: "View financial data" },
      { value: "manage_billing", label: "Manage billing & subscriptions" },
    ],
  },
];

const ROLE_COLORS = {
  Owner: "bg-amber-100 text-amber-800 border-amber-200",
  Admin: "bg-purple-100 text-purple-800 border-purple-200",
  Member: "bg-blue-100 text-blue-800 border-blue-200",
  Finance: "bg-green-100 text-green-800 border-green-200",
};

const ROLE_ICONS = {
  Owner: Crown,
  Admin: Shield,
  Member: Users,
  Finance: CirclePlus,
};

export default function TeamSettings() {
  const [selectedTab, setSelectedTab] = useState("members");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");

  const { data: userData } = useSWR("/api/v1/users/me/");
  const {
    data: teamData,
    isLoading,
    error,
    mutate,
  } = useSWR(`/api/v1/users/?company=${userData?.company?.id}`);

  const ROLE_CHOICES = [
    {
      value: "Owner",
      label: "Owner",
      description: "Full access to all resources, can't be changed.",
      icon: Crown,
    },
    {
      value: "Admin",
      label: "Admin",
      description: "Can manage most settings and content.",
      icon: Shield,
    },
    {
      value: "Member",
      label: "Member",
      description: "Can view and edit most content.",
      icon: Users,
    },
    {
      value: "Finance",
      label: "Finance",
      description: "Can view and manage financial data.",
      icon: CirclePlus,
    },
  ];

  const inviteForm = useForm({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      first_name: "",
      password: "",
      phone_number: "",
    },
  });

  const handleRoleChange = async (newRole, userId) => {
    try {
      await axiosInstance.patch(`/api/v1/users/${userId}/update_role/`, {
        role: newRole,
      });
      mutate();
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    }
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;

    axiosInstance
      .delete(`/api/v1/users/${selectedMember.id}/`)
      .then(() => {
        toast.success(`Team member removed successfully`);
        setIsDeleteDialogOpen(false);
        setSelectedMember(null);
        setConfirmationText("");
        mutate();
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.detail || "Failed to remove team member"
        );
      });
  };

  const onInviteSubmit = (values) => {
    const bodyData = {
      ...values,
      company: userData?.company?.id,
    };

    axiosInstance
      .post(`/api/v1/users/invite_user/`, bodyData)
      .then((response) => {
        toast.success(
          `${response.data?.message || "User invited successfully"}`
        );
        setIsInviteDialogOpen(false);
        inviteForm.reset();
        mutate();
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.email?.[0] || "Failed to invite user"
        );
      });
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-800">
        <h3 className="font-medium">Error loading team members</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const isCurrentUserOwner = userData?.role === "Owner";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Settings</h2>
          <p className="text-muted-foreground">
            Manage your team members and their access permissions
          </p>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team. They will receive an email
                invitation.
              </DialogDescription>
            </DialogHeader>
            <Form {...inviteForm}>
              <form
                onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={inviteForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inviteForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inviteForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit">Send Invitation</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6 grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="members" className="flex gap-2 items-center">
            <Users className="h-4 w-4" />
            <span>Team Members</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex gap-2 items-center">
            <Shield className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to your workspace and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamData?.results?.length ? (
                      teamData.results.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={member.avatar}
                                  alt={member.first_name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {member.first_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.first_name}
                                </p>
                                {member.id === userData?.id && (
                                  <p className="text-xs text-muted-foreground">
                                    You
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{member.email}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {member.role === "Owner" ? (
                                <Badge className={ROLE_COLORS[member.role]}>
                                  <Crown className="h-3 w-3 mr-1" />
                                  {member.role}
                                </Badge>
                              ) : (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`${
                                        ROLE_COLORS[member.role]
                                      } border hover:bg-background/10`}
                                      disabled={
                                        member.role === "Owner" ||
                                        !isCurrentUserOwner
                                      }
                                    >
                                      {member.role && (
                                        <RoleIcon roleName={member.role} />
                                      )}
                                      {member.role}
                                      {isCurrentUserOwner &&
                                        member.role !== "Owner" && (
                                          <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                                        )}
                                    </Button>
                                  </PopoverTrigger>
                                  {isCurrentUserOwner &&
                                    member.role !== "Owner" && (
                                      <PopoverContent
                                        className="p-0 w-56"
                                        align="start"
                                      >
                                        <Command>
                                          <CommandInput placeholder="Search role..." />
                                          <CommandList>
                                            <CommandEmpty>
                                              No roles found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                              {ROLE_CHOICES.filter(
                                                (role) => role.value !== "Owner"
                                              ).map((role) => (
                                                <CommandItem
                                                  key={role.value}
                                                  onSelect={() => {
                                                    handleRoleChange(
                                                      role.value,
                                                      member.id
                                                    );
                                                  }}
                                                  className="flex flex-col items-start py-2"
                                                >
                                                  <div className="flex items-center w-full">
                                                    <role.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <span>{role.label}</span>
                                                    {member.role ===
                                                      role.value && (
                                                      <Check className="h-4 w-4 ml-auto" />
                                                    )}
                                                  </div>
                                                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                                                    {role.description}
                                                  </p>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    )}
                                </Popover>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  disabled={
                                    member.id === userData?.id ||
                                    member.role === "Owner"
                                  }
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No team members found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                {teamData?.results?.length || 0} team members
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Configure roles and their associated permissions in your
                workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ROLE_CHOICES.map((role) => (
                  <div key={role.value} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-md ${
                            role.value === "Owner"
                              ? "bg-amber-100"
                              : role.value === "Admin"
                              ? "bg-purple-100"
                              : role.value === "Finance"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          }`}
                        >
                          <role.icon
                            className={`h-5 w-5 ${
                              role.value === "Owner"
                                ? "text-amber-700"
                                : role.value === "Admin"
                                ? "text-purple-700"
                                : role.value === "Finance"
                                ? "text-green-700"
                                : "text-blue-700"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{role.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>
                      {role.value !== "Owner" && isCurrentUserOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isCurrentUserOwner}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Customize
                        </Button>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">
                        Default Permissions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissionsOptions.map((group) => (
                          <div key={group.label}>
                            <h5 className="text-xs font-medium text-muted-foreground mb-2">
                              {group.label}
                            </h5>
                            <div className="space-y-2">
                              {group.options.map((permission) => (
                                <div
                                  key={permission.value}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      // Example logic for which roles have which permissions
                                      role.value === "Owner" ||
                                      (role.value === "Admin" &&
                                        !permission.value.includes(
                                          "billing"
                                        )) ||
                                      (role.value === "Finance" &&
                                        permission.value.includes(
                                          "finances"
                                        )) ||
                                      (role.value === "Member" &&
                                        permission.value === "view_all")
                                        ? "bg-green-500"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                  <span className="text-sm">
                                    {permission.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.first_name} from
              your team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">
              Type <span className="font-bold">{selectedMember?.email}</span> to
              confirm
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={selectedMember?.email}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedMember(null);
                setConfirmationText("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={confirmationText !== selectedMember?.email}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
