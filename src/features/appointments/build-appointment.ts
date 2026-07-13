import type { AppointmentFormValues } from "@/lib/validations/appointment";
import type {
  AppointmentWithRelations,
  Customer,
  Service,
  StaffMember,
} from "@/types";

type Lookups = {
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
};

/**
 * Builds a local appointment from booking-form values by resolving the
 * selected ids and deriving the end time from the service duration.
 * Mock-data stage only — becomes a Supabase insert in Sprint 4.
 */
export function buildLocalAppointment(
  values: AppointmentFormValues,
  { customers, services, staff }: Lookups
): AppointmentWithRelations | null {
  const customer = customers.find((c) => c.id === values.customerId);
  const service = services.find((s) => s.id === values.serviceId);
  const member = staff.find((s) => s.id === values.staffId);
  if (!customer || !service || !member) return null;

  const startsAt = new Date(`${values.date}T${values.time}`);
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);

  return {
    id: `apt-local-${Date.now()}`,
    customerId: customer.id,
    staffId: member.id,
    serviceId: service.id,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: "confirmed",
    customer,
    staff: member,
    service,
  };
}
