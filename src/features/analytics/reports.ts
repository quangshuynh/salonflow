import { getAppointmentsWithRelations } from "@/features/appointments/queries";
import { MOCK_STAFF } from "@/lib/mock-data";
import type { Service, StaffMember } from "@/types";

export type DailyPerformance = {
  /** ISO date at local noon, safe to format in any timezone. */
  date: string;
  revenue: number;
  appointments: number;
};

/**
 * Deterministic pseudo-random in [0, 1) from an integer seed, so the mock
 * series is stable across renders (no SSR/client drift).
 */
function seededNoise(seed: number): number {
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
}

/** Sun..Sat demand curve — salons peak Fri/Sat, slow early week. */
const WEEKDAY_FACTOR = [0.35, 0.55, 0.7, 0.75, 0.9, 1.15, 1.3];

/**
 * Mock daily revenue/appointment series for the trailing window.
 * Becomes a SQL aggregate over real appointments in Sprint 4.
 */
export function getDailyPerformance(days = 28): DailyPerformance[] {
  const series: DailyPerformance[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() - i);

    const dayIndex = Math.floor(day.getTime() / 86_400_000);
    const demand = 0.8 + seededNoise(dayIndex) * 0.4;
    const appointments = Math.round(
      10 * WEEKDAY_FACTOR[day.getDay()] * demand
    );
    const avgTicket = 55 + seededNoise(dayIndex * 7) * 30;

    series.push({
      date: day.toISOString(),
      revenue: Math.round(appointments * avgTicket),
      appointments,
    });
  }
  return series;
}

export type ReportSummary = {
  revenue: number;
  appointments: number;
  avgTicket: number;
  /** Share of finished appointments that were completed (vs cancelled/no-show). */
  completionRate: number;
};

export function getReportSummary(days = 28): ReportSummary {
  const series = getDailyPerformance(days);
  const revenue = series.reduce((sum, day) => sum + day.revenue, 0);
  const appointments = series.reduce((sum, day) => sum + day.appointments, 0);

  const finished = getAppointmentsWithRelations().filter((a) =>
    ["completed", "cancelled", "no-show"].includes(a.status)
  );
  const completed = finished.filter((a) => a.status === "completed").length;

  return {
    revenue,
    appointments,
    avgTicket: appointments > 0 ? revenue / appointments : 0,
    completionRate: finished.length > 0 ? completed / finished.length : 1,
  };
}

export type ServicePerformanceAllTime = {
  service: Service;
  bookings: number;
  revenue: number;
};

export function getTopServices(limit = 5): ServicePerformanceAllTime[] {
  const byService = new Map<string, ServicePerformanceAllTime>();

  for (const appointment of getAppointmentsWithRelations()) {
    if (appointment.status === "cancelled" || appointment.status === "no-show") {
      continue;
    }
    const entry = byService.get(appointment.service.id) ?? {
      service: appointment.service,
      bookings: 0,
      revenue: 0,
    };
    entry.bookings += 1;
    entry.revenue += appointment.service.price;
    byService.set(appointment.service.id, entry);
  }

  return [...byService.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export type StaffPerformance = {
  staff: StaffMember;
  bookings: number;
  revenue: number;
};

export function getStaffPerformance(): StaffPerformance[] {
  const appointments = getAppointmentsWithRelations().filter(
    (a) => a.status !== "cancelled" && a.status !== "no-show"
  );

  return MOCK_STAFF.map((staff) => {
    const own = appointments.filter((a) => a.staffId === staff.id);
    return {
      staff,
      bookings: own.length,
      revenue: own.reduce((sum, a) => sum + a.service.price, 0),
    };
  }).sort((a, b) => b.revenue - a.revenue);
}
