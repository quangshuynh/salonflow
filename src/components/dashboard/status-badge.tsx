import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  pending: { label: "Pending", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  "no-show": { label: "No-show", variant: "destructive" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
