import { DataTableDemo } from "@/components/ui/DataTable";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Dashboard() {
  const { data, error, isLoading } = useSWR("/api/v1/sales/customers/");
  console.log("data: ", data);

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone_number", header: "Phone Number" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "modified_at", header: "Modified At" },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <section className=" ">
      <h1 className="font-bold">Dashboard</h1>
      <Dialog>
        {data && (
          <DataTableDemo
            data={data.results}
            columns={columns}
            type="Customer"
          />
        )}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                defaultValue="Pedro Duarte"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                defaultValue="@peduarte"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Dashboard;
