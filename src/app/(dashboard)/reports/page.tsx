import {
  CalendarCheck,
  CircleCheck,
  DollarSign,
  Receipt,
} from "lucide-react";

import { RevenueChart } from "@/components/reports/revenue-chart";
import { StaffPerformanceTable } from "@/components/reports/staff-performance-table";
import { TopServicesChart } from "@/components/reports/top-services-chart";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getDailyPerformance,
  getReportSummary,
  getStaffPerformance,
  getTopServices,
} from "@/features/analytics/reports";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const summary = getReportSummary();
  const series = getDailyPerformance();
  const topServices = getTopServices();
  const staffPerformance = getStaffPerformance();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Revenue, bookings, and performance for the last 28 days."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue"
          value={formatCurrency(summary.revenue)}
          hint="Last 28 days"
          icon={DollarSign}
        />
        <StatCard
          title="Appointments"
          value={String(summary.appointments)}
          hint="Last 28 days"
          icon={CalendarCheck}
        />
        <StatCard
          title="Average ticket"
          value={formatCurrency(summary.avgTicket)}
          hint="Revenue per appointment"
          icon={Receipt}
        />
        <StatCard
          title="Completion rate"
          value={`${Math.round(summary.completionRate * 100)}%`}
          hint="Of finished appointments"
          icon={CircleCheck}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily revenue</CardTitle>
          <CardDescription>Last 28 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={series} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top services</CardTitle>
            <CardDescription>By booked revenue, all time.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopServicesChart data={topServices} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff performance</CardTitle>
            <CardDescription>Bookings and booked revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffPerformanceTable data={staffPerformance} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
