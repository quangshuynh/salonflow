import { describe, expect, it } from "vitest";

import { getInitials } from "@/lib/utils";

describe("getInitials", () => {
  it("uses the first letter of the first two name parts", () => {
    expect(getInitials("Mai Tran")).toBe("MT");
  });

  it("uppercases lowercase names", () => {
    expect(getInitials("emily chen")).toBe("EC");
  });

  it("caps at two letters so long names stay legible", () => {
    expect(getInitials("Maria Del Carmen Rossi")).toBe("MD");
  });

  it("handles single-word names", () => {
    expect(getInitials("Cher")).toBe("C");
  });

  it("ignores extra whitespace between and around name parts", () => {
    expect(getInitials("  jessica   alvarez  ")).toBe("JA");
  });

  it("falls back to a placeholder for an empty name", () => {
    expect(getInitials("   ")).toBe("?");
  });
});
