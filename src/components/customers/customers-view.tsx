"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";

import { NewCustomerDialog } from "@/components/customers/new-customer-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Customer } from "@/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type CustomersViewProps = {
  customers: Customer[];
};

export function CustomersView({ customers }: CustomersViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q)
    );
  }, [customers, query]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description={`${customers.length} ${customers.length === 1 ? "customer" : "customers"} in your directory.`}
      >
        <NewCustomerDialog />
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-8"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description={
            query
              ? `No customers match "${query}". Try a different search.`
              : "Add your first customer to get started."
          }
        />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Last visit
                  </TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead className="text-right">Total spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/customers/${customer.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {customer.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {customer.lastVisit
                        ? formatDate(customer.lastVisit)
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {customer.totalVisits}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
