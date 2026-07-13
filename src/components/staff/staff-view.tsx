"use client";

import { UserCog } from "lucide-react";

import { StaffDialog } from "@/components/staff/staff-dialog";
import { StaffCard } from "@/components/staff/staff-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import type { StaffWithTodaysLoad } from "@/features/staff/queries";

type StaffViewProps = {
  staff: StaffWithTodaysLoad[];
};

export function StaffView({ staff }: StaffViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description={`${staff.length} ${staff.length === 1 ? "team member" : "team members"}.`}
      >
        <StaffDialog />
      </PageHeader>

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No staff yet"
          description="Add your first team member to start assigning appointments."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <StaffCard key={member.id} staff={member} />
          ))}
        </div>
      )}
    </div>
  );
}
