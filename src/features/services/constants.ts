import type { ServiceCategory } from "@/types";

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  hair: "Hair",
  nails: "Nails",
  spa: "Spa",
  lashes: "Lashes",
  barber: "Barber",
};

/** Display order for category groups. */
export const SERVICE_CATEGORIES = Object.keys(
  SERVICE_CATEGORY_LABELS
) as ServiceCategory[];
