"use client";

import { useSyncExternalStore } from "react";

import { AppointmentBlock } from "@/components/calendar/appointment-block";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  TIMELINE_HEIGHT_PX,
  minutesIntoDay,
  minutesToOffsetPx,
} from "@/components/calendar/constants";
import { isSameLocalDay } from "@/features/appointments/helpers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AppointmentWithRelations, StaffMember } from "@/types";

const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i
);

function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

function subscribeToMinute(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}

/**
 * Current minute as a primitive so the snapshot is referentially stable.
 * The server snapshot is 0, so SSR renders no line and the client corrects
 * itself on hydration without a mismatch.
 */
function useCurrentMinute(): number {
  return useSyncExternalStore(
    subscribeToMinute,
    () => Math.floor(Date.now() / 60_000),
    () => 0
  );
}

function NowLine({ day }: { day: Date }) {
  const minute = useCurrentMinute();
  if (minute === 0) return null;

  const now = new Date(minute * 60_000);
  if (!isSameLocalDay(now, day)) return null;
  const minutes = minutesIntoDay(now);
  if (minutes < 0 || minutes > (DAY_END_HOUR - DAY_START_HOUR) * 60) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-10 border-t-2 border-destructive"
      style={{ top: minutesToOffsetPx(minutes) }}
    >
      <div className="absolute -top-[5px] -left-1 size-2 rounded-full bg-destructive" />
    </div>
  );
}

type DayTimelineProps = {
  day: Date;
  staff: StaffMember[];
  appointments: AppointmentWithRelations[];
};

export function DayTimeline({ day, staff, appointments }: DayTimelineProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <div
        className="grid min-w-fit"
        style={{
          gridTemplateColumns: `56px repeat(${staff.length}, minmax(150px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="sticky top-0 border-b bg-card" />
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 border-b border-l bg-card px-3 py-2.5"
          >
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{member.name}</span>
          </div>
        ))}

        {/* Time gutter */}
        <div className="relative" style={{ height: TIMELINE_HEIGHT_PX }}>
          {HOURS.map((hour) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
              style={{ top: minutesToOffsetPx((hour - DAY_START_HOUR) * 60) }}
            >
              {hour === DAY_START_HOUR ? "" : hourLabel(hour)}
            </span>
          ))}
        </div>

        {/* One column per staff member */}
        {staff.map((member) => (
          <div
            key={member.id}
            className="relative border-l"
            style={{ height: TIMELINE_HEIGHT_PX }}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-0 left-0 border-t border-border/60"
                style={{
                  top: minutesToOffsetPx((hour - DAY_START_HOUR) * 60),
                  height: HOUR_HEIGHT_PX,
                }}
              />
            ))}
            <NowLine day={day} />
            {appointments
              .filter((appointment) => appointment.staffId === member.id)
              .map((appointment) => (
                <AppointmentBlock
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
