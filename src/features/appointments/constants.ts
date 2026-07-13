import type { AppointmentStatus } from "@/types";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

/** Display order for status filters. */
export const APPOINTMENT_STATUSES = Object.keys(
  APPOINTMENT_STATUS_LABELS
) as AppointmentStatus[];
