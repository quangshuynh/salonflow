import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { appointmentSchema } from "@/lib/validations/appointment";
import { customerSchema } from "@/lib/validations/customer";
import { serviceSchema } from "@/lib/validations/service";

describe("appointmentSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 12, 12, 0));
  });

  afterEach(() => vi.useRealTimers());

  it("accepts a complete appointment scheduled in the future", () => {
    expect(
      appointmentSchema.safeParse({
        customerId: "customer-1",
        serviceId: "service-1",
        staffId: "staff-1",
        date: "2026-05-13",
        time: "09:30",
      }).success
    ).toBe(true);
  });

  it("rejects missing customer, service, and staff references", () => {
    const result = appointmentSchema.safeParse({
      customerId: "",
      serviceId: "",
      staffId: "",
      date: "2026-05-13",
      time: "09:30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path[0])).toEqual([
        "customerId",
        "serviceId",
        "staffId",
      ]);
    }
  });

  it("rejects an appointment time in the past", () => {
    const result = appointmentSchema.safeParse({
      customerId: "customer-1",
      serviceId: "service-1",
      staffId: "staff-1",
      date: "2026-05-12",
      time: "11:59",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ["time"],
        message: "Appointment time must be in the future",
      });
    }
  });
});

describe("customerSchema", () => {
  it("rejects malformed email addresses and phone characters", () => {
    const result = customerSchema.safeParse({
      name: "Avery Lee",
      email: "not-an-email",
      phone: "555-FLOW",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path[0])).toEqual([
        "email",
        "phone",
      ]);
    }
  });

  it("accepts supported phone punctuation", () => {
    expect(
      customerSchema.safeParse({
        name: "Avery Lee",
        email: "avery@example.com",
        phone: "+1 (555) 010-2030",
      }).success
    ).toBe(true);
  });
});

describe("serviceSchema", () => {
  it("rejects negative prices, non-whole durations, and unknown categories", () => {
    const result = serviceSchema.safeParse({
      name: "Haircut",
      category: "massage",
      durationMin: 45.5,
      price: -1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path[0])).toEqual([
        "category",
        "durationMin",
        "price",
      ]);
    }
  });

  it("accepts valid zero-priced services at the minimum duration", () => {
    expect(
      serviceSchema.safeParse({
        name: "Consultation",
        category: "hair",
        durationMin: 5,
        price: 0,
      }).success
    ).toBe(true);
  });
});
