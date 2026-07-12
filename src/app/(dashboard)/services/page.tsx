import { ServicesView } from "@/components/services/services-view";
import { getServices } from "@/features/services/queries";

export default function ServicesPage() {
  const services = getServices();

  return <ServicesView initialServices={services} />;
}
