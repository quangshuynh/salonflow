import { CalendarView } from "@/components/calendar/calendar-view";
import { getAppointmentsWithRelations } from "@/features/appointments/queries";
import { getCustomers } from "@/features/customers/queries";
import { getServices } from "@/features/services/queries";
import { getStaff } from "@/features/staff/queries";

export default async function CalendarPage() {
  const [appointments, customers, services, staff] = await Promise.all([
    getAppointmentsWithRelations(),
    getCustomers(),
    getServices(),
    getStaff(),
  ]);

  return (
    <CalendarView
      appointments={appointments}
      customers={customers}
      services={services}
      staff={staff}
    />
  );
}
