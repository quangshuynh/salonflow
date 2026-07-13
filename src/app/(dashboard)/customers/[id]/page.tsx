import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, CalendarDays, DollarSign } from "lucide-react";

import { CustomerActions } from "@/components/customers/customer-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCustomerAppointments,
  getCustomerById,
} from "@/features/customers/queries";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default async function CustomerDetailPage(
  props: PageProps<"/customers/[id]">
) {
  const { id } = await props.params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const appointments = await getCustomerAppointments(customer.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 text-muted-foreground"
          nativeButton={false}
          render={<Link href="/customers" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Customers
        </Button>
        <PageHeader title={customer.name} description={customer.email}>
          <CustomerActions customer={customer} />
        </PageHeader>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total visits"
          value={String(customer.totalVisits)}
          icon={CalendarCheck}
        />
        <StatCard
          title="Total spent"
          value={formatCurrency(customer.totalSpent)}
          icon={DollarSign}
        />
        <StatCard
          title="Last visit"
          value={customer.lastVisit ? formatDate(customer.lastVisit) : "Never"}
          icon={CalendarDays}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment history</CardTitle>
          <CardDescription>
            Past and upcoming appointments for {customer.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No appointments yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden md:table-cell">Staff</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium tabular-nums">
                      {formatDate(appointment.startsAt)}{" "}
                      <span className="text-muted-foreground">
                        {formatTime(appointment.startsAt)}
                      </span>
                    </TableCell>
                    <TableCell>{appointment.service.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {appointment.staff.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(appointment.service.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={appointment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
