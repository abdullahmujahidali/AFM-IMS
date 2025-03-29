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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  BellOff,
  BellRing,
  CheckCheck,
  Clock,
  Mail,
  MessageSquare,
  Save,
  ShoppingCart,
  Smartphone,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import useSWR from "swr";
import { z } from "zod";

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  notifyOnSales: z.boolean().default(true),
  notifyOnCustomers: z.boolean().default(true),
  notifyOnTeamChanges: z.boolean().default(true),
  notifyOnProducts: z.boolean().default(false),
  emailDigestFrequency: z
    .enum(["never", "daily", "weekly"], {
      required_error: "Please select a notification frequency.",
    })
    .default("daily"),
});

export default function NotificationsSettings() {
  const [selectedTab, setSelectedTab] = useState("channels");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // In a real application, you would fetch the user's notification preferences
  // This is mock data but would be replaced with a real API call
  const { data: userData } = useSWR("/api/v1/users/me/");

  // Placeholder for notification settings API endpoint
  const { data: notificationSettings, mutate } = useSWR(
    "/api/v1/users/notification-settings",
    // Fallback to mock data since this endpoint likely doesn't exist
    () =>
      Promise.resolve({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        notifyOnSales: true,
        notifyOnCustomers: true,
        notifyOnTeamChanges: true,
        notifyOnProducts: false,
        emailDigestFrequency: "daily",
      })
  );

  const form = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      notifyOnSales: true,
      notifyOnCustomers: true,
      notifyOnTeamChanges: true,
      notifyOnProducts: false,
      emailDigestFrequency: "daily",
    },
  });

  // Update form with fetched settings
  useEffect(() => {
    if (notificationSettings) {
      form.reset(notificationSettings);
    }
  }, [notificationSettings, form]);

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      // Mock API call since this endpoint likely doesn't exist yet
      // In a real app you would save to your API
      // await axiosInstance.patch("/api/v1/users/notification-settings", values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Notification settings updated");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Update local data
      mutate(values, false);
    } catch (error) {
      toast.error("Failed to update notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const activityItems = [
    {
      icon: ShoppingCart,
      content: "New sale was recorded",
      timestamp: "Just now",
      type: "sale",
    },
    {
      icon: UserPlus,
      content: "John Doe was added to your team",
      timestamp: "2 hours ago",
      type: "team",
    },
    {
      icon: Badge,
      content: "Your monthly usage report is ready",
      timestamp: "Yesterday",
      type: "system",
    },
    {
      icon: MessageSquare,
      content: "New comment on invoice #12345",
      timestamp: "3 days ago",
      type: "invoice",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage how and when you receive notifications
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCheck className="h-4 w-4" />
            <span>Settings saved</span>
          </div>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="channels" className="flex gap-2 items-center">
            <Mail className="h-4 w-4" />
            <span>Channels</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex gap-2 items-center">
            <BellRing className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="channels">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications from the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Email Notifications
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Receive notifications to your email address:{" "}
                              {userData?.email}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Push Notifications
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Receive notifications on your devices when logged
                              in
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Marketing & Promotional Emails
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Receive emails about new features, tips, and
                              product updates
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Email Digest Frequency
                    </h3>
                    <FormField
                      control={form.control}
                      name="emailDigestFrequency"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="daily" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Daily digest (recommended)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="weekly" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Weekly digest (every Monday)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="never" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Never (only individual notifications)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose which types of notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifyOnSales"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Sales & Invoices
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Get notified about new sales, invoices, and
                              payments
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnCustomers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Customer Activity
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Get notified about new customers and customer
                              updates
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnTeamChanges"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Team Changes
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Get notified when team members are added, removed,
                              or roles change
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnProducts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-primary" />
                              <FormLabel className="font-medium">
                                Inventory & Products
                              </FormLabel>
                            </div>
                            <FormDescription>
                              Get notified about inventory changes and product
                              updates
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                View your recent notifications and activity updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityItems.length > 0 ? (
                <div className="space-y-5">
                  {activityItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full 
                        ${
                          item.type === "sale"
                            ? "bg-green-100"
                            : item.type === "team"
                            ? "bg-blue-100"
                            : item.type === "invoice"
                            ? "bg-purple-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 
                          ${
                            item.type === "sale"
                              ? "text-green-600"
                              : item.type === "team"
                              ? "text-blue-600"
                              : item.type === "invoice"
                              ? "text-purple-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.timestamp}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                        <span className="sr-only">Dismiss</span>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <BellOff className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">
                    No recent notifications
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're all caught up! Check back later for new updates.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-center">
              <Button variant="outline">View All Activity</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
