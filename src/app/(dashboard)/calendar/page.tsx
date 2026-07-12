import { CalendarView } from "@/components/calendar/calendar-view";
import { getAppointmentsWithRelations } from "@/features/appointments/queries";
import { getCustomers } from "@/features/customers/queries";
import { getServices } from "@/features/services/queries";
import { MOCK_STAFF } from "@/lib/mock-data";

export default function CalendarPage() {
  return (
    <CalendarView
      initialAppointments={getAppointmentsWithRelations()}
      customers={getCustomers()}
      services={getServices()}
      staff={MOCK_STAFF}
    />
  );
}
