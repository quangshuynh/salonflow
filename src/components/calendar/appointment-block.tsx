import {
  minutesIntoDay,
  minutesToOffsetPx,
} from "@/components/calendar/constants";
import { cn, formatTime } from "@/lib/utils";
import type { AppointmentStatus, AppointmentWithRelations } from "@/types";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: "border-l-primary bg-primary/10 dark:bg-primary/20",
  pending: "border-l-muted-foreground/50 border-dashed bg-muted/50",
  completed: "border-l-muted-foreground/40 bg-muted/60 opacity-70",
  cancelled: "border-l-destructive/50 bg-destructive/5 opacity-50 line-through",
  "no-show": "border-l-destructive/50 bg-destructive/5 opacity-50",
};

export function AppointmentBlock({
  appointment,
}: {
  appointment: AppointmentWithRelations;
}) {
  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);
  const top = minutesToOffsetPx(minutesIntoDay(start));
  const height = Math.max(
    minutesToOffsetPx((end.getTime() - start.getTime()) / 60000),
    28
  );

  return (
    <div
      className={cn(
        "absolute right-1 left-1 overflow-hidden rounded-md border border-l-2 px-1.5 py-1 text-xs",
        STATUS_STYLES[appointment.status]
      )}
      style={{ top, height }}
      title={`${formatTime(appointment.startsAt)} · ${appointment.service.name} · ${appointment.customer.name} (${appointment.status})`}
    >
      <p className="truncate font-medium">{appointment.service.name}</p>
      <p className="truncate text-muted-foreground">
        {formatTime(appointment.startsAt)} · {appointment.customer.name}
      </p>
    </div>
  );
}
