import { Button } from "@/components/ui/button";
import { DataTableDemo } from "@/components/ui/DataTable";
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
import useSWR from "swr";

function CustomerView() {
  const { data, error, isLoading } = useSWR("/api/v1/sales/customers/");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone_number", header: "Phone Number" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "modified_at", header: "Modified At" },
  ];

  return (
    <div className="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
      <div className="flex-1">
        <Dialog>
          <DataTableDemo
            data={data.results}
            columns={columns}
            type="Customer"
          />
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
      </div>
    </div>
  );
}

export default CustomerView;
