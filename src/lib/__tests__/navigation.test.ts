import { describe, expect, it } from "vitest";

import {
  DASHBOARD_NAV,
  MARKETING_NAV,
  getActiveNavItem,
  isNavItemActive,
} from "@/lib/constants";

describe("isNavItemActive", () => {
  it("matches the item's own route", () => {
    expect(isNavItemActive("/customers", "/customers")).toBe(true);
  });

  it("stays active on nested routes", () => {
    expect(isNavItemActive("/customers", "/customers/cus-1")).toBe(true);
  });

  it("does not match a different route that shares a prefix", () => {
    expect(isNavItemActive("/customers", "/customers-archive")).toBe(false);
  });

  it("does not match an unrelated route", () => {
    expect(isNavItemActive("/customers", "/staff")).toBe(false);
  });
});

describe("getActiveNavItem", () => {
  it("resolves the header title for a top-level route", () => {
    expect(getActiveNavItem("/reports")?.title).toBe("Reports");
  });

  it("resolves the parent item for a nested route", () => {
    expect(getActiveNavItem("/customers/cus-1")?.title).toBe("Customers");
  });

  it("includes settings, which lives outside the nav groups", () => {
    expect(getActiveNavItem("/settings")?.title).toBe("Settings");
  });

  it("returns undefined outside the dashboard", () => {
    expect(getActiveNavItem("/")).toBeUndefined();
  });
});

describe("navigation config", () => {
  it("exposes every dashboard route exactly once", () => {
    const hrefs = DASHBOARD_NAV.map((item) => item.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("points marketing links at on-page sections of the home page", () => {
    expect(MARKETING_NAV.map((item) => item.href)).toEqual([
      "/#features",
      "/#pricing",
    ]);
  });
});
