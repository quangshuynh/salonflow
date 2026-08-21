import { describe, expect, it } from "vitest";

import { groupServicesByCategory } from "@/features/services/helpers";
import type { Service } from "@/types";

const services: Service[] = [
  {
    id: "nails-1",
    name: "Gel Manicure",
    category: "nails",
    durationMin: 45,
    price: 50,
  },
  {
    id: "hair-1",
    name: "Haircut",
    category: "hair",
    durationMin: 45,
    price: 55,
  },
  {
    id: "hair-2",
    name: "Blowout",
    category: "hair",
    durationMin: 30,
    price: 40,
  },
];

describe("groupServicesByCategory", () => {
  it("groups services in the configured display order", () => {
    expect(groupServicesByCategory(services).map(({ category }) => category)).toEqual([
      "hair",
      "nails",
    ]);
  });

  it("keeps services within their category and preserves their input order", () => {
    const [hair] = groupServicesByCategory(services);

    expect(hair.services.map(({ id }) => id)).toEqual(["hair-1", "hair-2"]);
  });

  it("uses display labels and omits categories with no services", () => {
    expect(groupServicesByCategory(services)).toMatchObject([
      { category: "hair", label: "Hair" },
      { category: "nails", label: "Nails" },
    ]);
  });
});
