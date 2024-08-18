/**
 * v0 by Vercel.
 * @see https://v0.dev/t/QZYN3TtzuOI
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Navigate } from "react-router-dom";

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-10">
        <div className="grid gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Your Subscription
              </CardTitle>
              <Navigate
                to="#"
                className="text-blue-600 underline"
                prefetch={false}
              >
                Manage
              </Navigate>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">Pro Plan</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Billed monthly
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$19</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      per month
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Next Billing Date</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      June 15, 2023
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Billing History
              </CardTitle>
              <Navigate
                to="#"
                className="text-blue-600 underline"
                prefetch={false}
              >
                View All
              </Navigate>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>June 15, 2023</TableCell>
                    <TableCell>$19.00</TableCell>
                    <TableCell>Visa *1234</TableCell>
                    <TableCell className="text-green-500">Paid</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>May 15, 2023</TableCell>
                    <TableCell>$19.00</TableCell>
                    <TableCell>Visa *1234</TableCell>
                    <TableCell className="text-green-500">Paid</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>April 15, 2023</TableCell>
                    <TableCell>$19.00</TableCell>
                    <TableCell>Visa *1234</TableCell>
                    <TableCell className="text-green-500">Paid</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Subscription Add-ons
              </CardTitle>
              <Navigate
                to="#"
                className="text-blue-600 underline"
                prefetch={false}
              >
                Manage
              </Navigate>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      Additional Storage
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      100GB
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$5</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      per month
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-medium">Premium Support</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      24/7 support
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$10</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      per month
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel Subscription</Button>
            <Button>Update Subscription</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
