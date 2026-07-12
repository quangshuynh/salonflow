import { getAppointmentsWithRelations } from "@/features/appointments/queries";
import { MOCK_CUSTOMERS } from "@/lib/mock-data";
import type { AppointmentWithRelations, Customer } from "@/types";

export function getCustomers(): Customer[] {
  return [...MOCK_CUSTOMERS].sort((a, b) => a.name.localeCompare(b.name));
}

export function getCustomerById(id: string): Customer | undefined {
  return MOCK_CUSTOMERS.find((customer) => customer.id === id);
}

export function getCustomerAppointments(
  customerId: string
): AppointmentWithRelations[] {
  return getAppointmentsWithRelations()
    .filter((appointment) => appointment.customerId === customerId)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}
