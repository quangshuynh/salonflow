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

/**
 * Which statuses an appointment may move to from its current one.
 * Completed/cancelled/no-show are terminal — reopening a finished
 * appointment would silently rewrite revenue history.
 */
export const APPOINTMENT_STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  pending: ["confirmed", "completed", "cancelled", "no-show"],
  confirmed: ["completed", "cancelled", "no-show"],
  completed: [],
  cancelled: [],
  "no-show": [],
};
