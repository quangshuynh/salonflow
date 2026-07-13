"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  Check,
  CircleCheck,
  EllipsisVertical,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateAppointmentStatus } from "@/features/appointments/actions";
import { APPOINTMENT_STATUS_TRANSITIONS } from "@/features/appointments/constants";
import type { AppointmentStatus } from "@/types";

const TRANSITION_ACTIONS: Partial<
  Record<AppointmentStatus, { label: string; icon: LucideIcon }>
> = {
  confirmed: { label: "Confirm", icon: Check },
  completed: { label: "Mark completed", icon: CircleCheck },
  cancelled: { label: "Cancel appointment", icon: Ban },
  "no-show": { label: "Mark as no-show", icon: UserX },
};

type StatusMenuProps = {
  appointmentId: string;
  status: AppointmentStatus;
};

export function StatusMenu({ appointmentId, status }: StatusMenuProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const transitions = APPOINTMENT_STATUS_TRANSITIONS[status];

  if (transitions.length === 0) return null;

  function apply(next: AppointmentStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, next);
      if (result.error) setError(result.error);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label="Appointment actions"
            />
          }
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {transitions.map((next) => {
            const action = TRANSITION_ACTIONS[next];
            if (!action) return null;
            return (
              <DropdownMenuItem key={next} onClick={() => apply(next)}>
                <action.icon />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
