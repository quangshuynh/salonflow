import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
} from "@/features/services/constants";
import { MOCK_SERVICES } from "@/lib/mock-data";
import type { Service, ServiceCategory } from "@/types";

export function getServices(): Service[] {
  return [...MOCK_SERVICES].sort((a, b) => a.name.localeCompare(b.name));
}

export type ServiceGroup = {
  category: ServiceCategory;
  label: string;
  services: Service[];
};

/**
 * Groups services into category sections in display order.
 * Pure so the client view can re-group after local inserts.
 */
export function groupServicesByCategory(services: Service[]): ServiceGroup[] {
  return SERVICE_CATEGORIES.map((category) => ({
    category,
    label: SERVICE_CATEGORY_LABELS[category],
    services: services.filter((service) => service.category === category),
  })).filter((group) => group.services.length > 0);
}
