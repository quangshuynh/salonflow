import { AppointmentsView } from "@/components/appointments/appointments-view";
import { getAppointmentsWithRelations } from "@/features/appointments/queries";
import { getCustomers } from "@/features/customers/queries";
import { getServices } from "@/features/services/queries";
import { MOCK_STAFF } from "@/lib/mock-data";

export default function AppointmentsPage() {
  return (
    <AppointmentsView
      initialAppointments={getAppointmentsWithRelations()}
      customers={getCustomers()}
      services={getServices()}
      staff={MOCK_STAFF}
    />
  );
}
