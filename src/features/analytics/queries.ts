import "server-only";

import { getTodaysAppointments } from "@/features/appointments/queries";
import { getCustomers } from "@/features/customers/queries";
import type { Service } from "@/types";

export type DashboardStats = {
  revenueToday: number;
  appointmentsToday: number;
  upcomingToday: number;
  newCustomersThisWeek: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [todays, customers] = await Promise.all([
    getTodaysAppointments(),
    getCustomers(),
  ]);
  const active = todays.filter(
    (a) => a.status !== "cancelled" && a.status !== "no-show"
  );

  const revenueToday = todays
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.service.price, 0);

  const now = new Date();
  const upcomingToday = active.filter(
    (a) => new Date(a.startsAt) > now && a.status !== "completed"
  ).length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newCustomersThisWeek = customers.filter(
    (c) => new Date(c.createdAt) >= weekAgo
  ).length;

  return {
    revenueToday,
    appointmentsToday: active.length,
    upcomingToday,
    newCustomersThisWeek,
  };
}

export type ServicePerformance = {
  service: Service;
  bookings: number;
  revenue: number;
};

export async function getTopServicesToday(): Promise<ServicePerformance[]> {
  const byService = new Map<string, ServicePerformance>();

  for (const appointment of await getTodaysAppointments()) {
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

  return [...byService.values()].sort((a, b) => b.revenue - a.revenue);
}
