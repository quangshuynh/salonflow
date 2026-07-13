import { ServicesView } from "@/components/services/services-view";
import { getServices } from "@/features/services/queries";

export default async function ServicesPage() {
  const services = await getServices();

  return <ServicesView services={services} />;
}
