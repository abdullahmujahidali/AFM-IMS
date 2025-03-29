import axiosInstance from "@/axiosInstance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  Camera,
  CheckCircle,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const personalFormSchema = z.object({
  first_name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email({ message: "Invalid email address" }).min(5),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15),
});

const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z.string(),
});

const securityFormSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export default function AccountSettings() {
  const [selectedTab, setSelectedTab] = useState("personal");
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isCompanyEditing, setIsCompanyEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    data: userData,
    isLoading: userLoading,
    mutate: userMutate,
  } = useSWR("/api/v1/users/me/");
  const {
    data: companyData,
    isLoading: companyLoading,
    mutate: companyMutate,
  } = useSWR(
    userData?.company?.id ? `/api/v1/company/${userData.company.id}/` : null
  );

  // Personal Information Form
  const personalForm = useForm({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      first_name: "",
      email: "",
      phone_number: "",
    },
    mode: "onChange",
  });

  // Company Information Form
  const companyForm = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
    mode: "onChange",
  });

  // Security Information Form
  const securityForm = useForm({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (userData) {
      personalForm.reset({
        first_name: userData.first_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
      });
    }
  }, [userData, personalForm]);

  useEffect(() => {
    if (companyData) {
      companyForm.reset({
        name: companyData.name || "",
        slug: companyData.slug || "",
      });
    }
  }, [companyData, companyForm]);

  const onPersonalSubmit = async (values) => {
    try {
      await axiosInstance.patch(`/api/v1/users/${userData.id}/`, values);
      toast.success("Personal information updated successfully");
      setIsPersonalEditing(false);
      userMutate();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Failed to update personal information"
      );
    }
  };

  const onCompanySubmit = async (values) => {
    try {
      await axiosInstance.patch(
        `/api/v1/company/${userData.company.id}/`,
        values
      );
      toast.success("Company information updated successfully");
      setIsCompanyEditing(false);
      companyMutate();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Failed to update company information"
      );
    }
  };

  const onSecuritySubmit = async (values) => {
    try {
      await axiosInstance.post(
        `/api/v1/users/${userData.id}/change_password/`,
        {
          old_password: values.current_password,
          new_password: values.new_password,
        }
      );
      toast.success("Password changed successfully");
      securityForm.reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to change password");
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);
    setIsUploading(true);

    try {
      await axiosInstance.post(
        `/api/v1/users/${userData.id}/upload_profile_picture/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Profile picture updated successfully");
      userMutate();
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  if (userLoading || companyLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Account Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span>Changes saved</span>
          </div>
        )}
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="personal" className="flex gap-2 items-center">
            <User className="h-4 w-4" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex gap-2 items-center">
            <Building className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2 items-center">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                <Button
                  variant={isPersonalEditing ? "default" : "outline"}
                  onClick={() => setIsPersonalEditing(!isPersonalEditing)}
                >
                  {isPersonalEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={userData?.profile_picture || ""} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {userData?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <label
                        htmlFor="profile-upload"
                        className="rounded-full bg-primary text-primary-foreground p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePictureUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{userData?.first_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {userData?.email}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <Form {...personalForm}>
                    <form
                      onSubmit={personalForm.handleSubmit(onPersonalSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={personalForm.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your full name"
                                disabled={!isPersonalEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Your email address"
                                disabled={true} // Email can't be changed
                              />
                            </FormControl>
                            <FormDescription>
                              Email address cannot be changed.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your phone number"
                                disabled={!isPersonalEditing}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isPersonalEditing && (
                        <div className="flex justify-end mt-6">
                          <Button type="submit">Save Changes</Button>
                        </div>
                      )}
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Information Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Manage your company details and settings
                  </CardDescription>
                </div>
                <Button
                  variant={isCompanyEditing ? "default" : "outline"}
                  onClick={() => setIsCompanyEditing(!isCompanyEditing)}
                >
                  {isCompanyEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form
                  onSubmit={companyForm.handleSubmit(onCompanySubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <FormField
                      control={companyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Company name"
                              disabled={!isCompanyEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Company Slug
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="company-slug"
                              disabled={true} // Slug can't be changed
                            />
                          </FormControl>
                          <FormDescription>
                            This is your company's unique identifier and cannot
                            be changed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isCompanyEditing && (
                    <div className="flex justify-end mt-6">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  )}
                </form>
              </Form>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium mb-4">Company Status</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        companyData?.status ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="font-medium">
                      {companyData?.status ? "Active" : "Pending"}
                    </span>
                  </div>
                  <div>
                    {!companyData?.status && (
                      <Button variant="outline" size="sm">
                        Contact Support
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <Form {...securityForm}>
                  <form
                    onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={securityForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Your current password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Your new password"
                            />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Confirm your new password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end mt-6">
                      <Button type="submit">Change Password</Button>
                    </div>
                  </form>
                </Form>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Two-Factor Authentication
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground mr-2" />
                        <h4 className="font-medium">
                          Two-Factor Authentication
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch disabled={true} />
                  </div>
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Coming Soon</AlertTitle>
                    <AlertDescription>
                      Two-factor authentication will be available in a future
                      update.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
                <div className="rounded-md border">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Active now
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Log Out
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
