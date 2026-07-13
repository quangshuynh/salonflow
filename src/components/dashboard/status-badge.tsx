import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABELS } from "@/features/appointments/constants";
import type { AppointmentStatus } from "@/types";

const STATUS_VARIANTS: Record<
  AppointmentStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pending: "outline",
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  "no-show": "destructive",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
