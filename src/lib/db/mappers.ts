import type {
  Appointment,
  AppointmentStatus,
  AppointmentWithRelations,
  Customer,
  Service,
  ServiceCategory,
  StaffMember,
  StaffRole,
} from "@/types";

/**
 * Maps snake_case database rows to the camelCase domain types the UI was
 * built against. Money crosses this boundary too: the database stores
 * integer cents, the domain uses dollars.
 */

export type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type CustomerStatsRow = {
  customer_id: string;
  total_visits: number;
  total_spent_cents: number;
  last_visit: string | null;
};

export function mapCustomer(
  row: CustomerRow,
  stats?: CustomerStatsRow
): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    createdAt: row.created_at,
    lastVisit: stats?.last_visit ?? null,
    totalVisits: stats?.total_visits ?? 0,
    totalSpent: (stats?.total_spent_cents ?? 0) / 100,
  };
}

export type StaffRow = {
  id: string;
  name: string;
  role: StaffRole;
  created_at: string;
};

export function mapStaff(row: StaffRow): StaffMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    initials: row.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };
}

export type ServiceRow = {
  id: string;
  name: string;
  category: ServiceCategory;
  duration_min: number;
  price_cents: number;
  created_at: string;
};

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    durationMin: row.duration_min,
    price: row.price_cents / 100,
  };
}

export type AppointmentRow = {
  id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
};

export type AppointmentJoinedRow = AppointmentRow & {
  customer: CustomerRow;
  staff: StaffRow;
  service: ServiceRow;
};

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    customerId: row.customer_id,
    staffId: row.staff_id,
    serviceId: row.service_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
  };
}

export function mapAppointmentWithRelations(
  row: AppointmentJoinedRow
): AppointmentWithRelations {
  return {
    ...mapAppointment(row),
    customer: mapCustomer(row.customer),
    staff: mapStaff(row.staff),
    service: mapService(row.service),
  };
}
