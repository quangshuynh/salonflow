import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StaffPerformance } from "@/features/analytics/reports";
import { STAFF_ROLE_LABELS } from "@/features/staff/constants";
import { formatCurrency } from "@/lib/utils";

export function StaffPerformanceTable({ data }: { data: StaffPerformance[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff member</TableHead>
          <TableHead className="hidden sm:table-cell">Role</TableHead>
          <TableHead className="text-right">Bookings</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(({ staff, bookings, revenue }) => (
          <TableRow key={staff.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {staff.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{staff.name}</span>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {STAFF_ROLE_LABELS[staff.role]}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {bookings}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCurrency(revenue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
