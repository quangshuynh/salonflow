import { AppointmentsView } from "@/components/appointments/appointments-view";
import { getAppointmentsWithRelations } from "@/features/appointments/queries";
import { getCustomers } from "@/features/customers/queries";
import { getServices } from "@/features/services/queries";
import { getStaff } from "@/features/staff/queries";

export default async function AppointmentsPage() {
  const [appointments, customers, services, staff] = await Promise.all([
    getAppointmentsWithRelations(),
    getCustomers(),
    getServices(),
    getStaff(),
  ]);

  return (
    <AppointmentsView
      appointments={appointments}
      customers={customers}
      services={services}
      staff={staff}
    />
  );
}
