"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";

import { CustomerDialog } from "@/components/customers/customer-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Customer } from "@/types";

type CustomersViewProps = {
  customers: Customer[];
};

export function CustomersView({ customers }: CustomersViewProps) {
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
        <CustomerDialog />
      </PageHeader>

      <div className="relative max-w-sm">
        <Label htmlFor="customer-search" className="sr-only">
          Search customers
        </Label>
        <Search
          aria-hidden
          className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="customer-search"
          type="search"
          placeholder="Search by name or email..."
          className="pl-8"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        query ? (
          <EmptyState
            icon={Search}
            title="No matching customers"
            description={`Nothing matches “${query}”. Try a different name or email.`}
          >
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start booking appointments."
          >
            <div className="mt-2">
              <CustomerDialog />
            </div>
          </EmptyState>
        )
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
                  // The name is a real link; its overlay makes the whole row
                  // clickable without losing keyboard access.
                  <TableRow
                    key={customer.id}
                    className="relative cursor-pointer focus-within:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs" aria-hidden>
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-md focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                            >
                              {customer.name}
                            </Link>
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
