import { describe, expect, it } from "vitest";

import {
  filterAppointmentsForDay,
  isSameLocalDay,
} from "@/features/appointments/helpers";
import type { AppointmentWithRelations } from "@/types";

function appointment(id: string, startsAt: Date): AppointmentWithRelations {
  return {
    id,
    customerId: "customer-1",
    staffId: "staff-1",
    serviceId: "service-1",
    startsAt: startsAt.toISOString(),
    endsAt: new Date(startsAt.getTime() + 30 * 60_000).toISOString(),
    status: "confirmed",
    customer: {
      id: "customer-1",
      name: "Avery Lee",
      email: "avery@example.com",
      phone: "555-0100",
      createdAt: "2026-01-01T12:00:00.000Z",
      lastVisit: null,
      totalVisits: 0,
      totalSpent: 0,
    },
    staff: {
      id: "staff-1",
      name: "Jordan Kim",
      role: "stylist",
      initials: "JK",
    },
    service: {
      id: "service-1",
      name: "Haircut",
      category: "hair",
      durationMin: 30,
      price: 50,
    },
  };
}

describe("appointment date helpers", () => {
  it("matches dates that fall on the same local calendar day", () => {
    expect(
      isSameLocalDay(
        new Date(2026, 4, 12, 8, 0),
        new Date(2026, 4, 12, 17, 30)
      )
    ).toBe(true);
  });

  it("does not match adjacent local calendar days", () => {
    expect(
      isSameLocalDay(
        new Date(2026, 4, 12, 23, 59),
        new Date(2026, 4, 13, 0, 0)
      )
    ).toBe(false);
  });

  it("filters appointments to the requested local day", () => {
    const targetDay = new Date(2026, 4, 12, 12, 0);
    const matching = appointment("matching", new Date(2026, 4, 12, 10, 0));
    const other = appointment("other", new Date(2026, 4, 13, 10, 0));

    expect(filterAppointmentsForDay([matching, other], targetDay)).toEqual([
      matching,
    ]);
  });

  it("sorts the selected day's appointments chronologically", () => {
    const targetDay = new Date(2026, 4, 12, 12, 0);
    const afternoon = appointment("afternoon", new Date(2026, 4, 12, 15, 0));
    const morning = appointment("morning", new Date(2026, 4, 12, 9, 0));

    expect(
      filterAppointmentsForDay([afternoon, morning], targetDay).map(
        ({ id }) => id
      )
    ).toEqual(["morning", "afternoon"]);
  });
});
