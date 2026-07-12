"use client";

import { useState } from "react";

import { NewStaffDialog } from "@/components/staff/new-staff-dialog";
import { StaffCard } from "@/components/staff/staff-card";
import { PageHeader } from "@/components/shared/page-header";
import type { StaffWithTodaysLoad } from "@/features/staff/queries";
import type { StaffFormValues } from "@/lib/validations/staff";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type StaffViewProps = {
  initialStaff: StaffWithTodaysLoad[];
};

export function StaffView({ initialStaff }: StaffViewProps) {
  const [staff, setStaff] = useState(initialStaff);

  function handleCreate(values: StaffFormValues) {
    // Mock-data stage: append locally. Becomes a Supabase insert in Sprint 4.
    const member: StaffWithTodaysLoad = {
      id: `stf-local-${Date.now()}`,
      ...values,
      initials: initials(values.name),
      bookingsToday: 0,
      revenueToday: 0,
      nextAppointment: null,
    };
    setStaff((current) => [...current, member]);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description={`${staff.length} team members.`}
      >
        <NewStaffDialog onCreate={handleCreate} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {staff.map((member) => (
          <StaffCard key={member.id} staff={member} />
        ))}
      </div>
    </div>
  );
}
