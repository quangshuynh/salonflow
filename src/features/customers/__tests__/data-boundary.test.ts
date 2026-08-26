import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_CUSTOMERS } from "@/lib/mock-data";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("@/lib/db/server", () => ({ createClient: vi.fn() }));

const { createClient } = await import("@/lib/db/server");
const { getCustomers } = await import("@/features/customers/queries");
const { createCustomer, updateCustomer, deleteCustomer } = await import(
  "@/features/customers/actions"
);

const supabase = vi.mocked(createClient);

const VALID = {
  name: "Avery Lee",
  email: "avery@example.com",
  phone: "555-0100",
};

/** A Supabase client whose every query reports a database failure. */
function failingClient() {
  const result = Promise.resolve({ data: null, error: { message: "boom" } });
  const builder = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    maybeSingle: () => result,
    then: (...args: Parameters<typeof result.then>) => result.then(...args),
  };
  return { from: () => builder } as unknown as Awaited<
    ReturnType<typeof createClient>
  >;
}

/** Supabase looks configured; only the demo flag decides the data source. */
function configureSupabase() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
}

beforeEach(() => {
  configureSupabase();
  supabase.mockReset();
});

afterEach(() => vi.unstubAllEnvs());

describe("demo mode", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true"));

  it("serves mock customers without ever constructing a Supabase client", async () => {
    const customers = await getCustomers();

    expect(customers).toHaveLength(MOCK_CUSTOMERS.length);
    expect(customers.map((c) => c.name)).toEqual(
      [...MOCK_CUSTOMERS.map((c) => c.name)].sort((a, b) => a.localeCompare(b))
    );
    expect(supabase).not.toHaveBeenCalled();
  });

  it("refuses every mutation instead of pretending to save", async () => {
    const results = await Promise.all([
      createCustomer(VALID),
      updateCustomer(MOCK_CUSTOMERS[0].id, VALID),
      deleteCustomer(MOCK_CUSTOMERS[0].id),
    ]);

    // The mock ids are not UUIDs, so update/delete stop at validation first —
    // either way nothing reaches the database.
    for (const result of results) {
      expect(result.error).toBeTruthy();
    }
    expect(results[0].error).toMatch(/demo mode/i);
    expect(supabase).not.toHaveBeenCalled();
  });
});

describe("configured mode", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false"));

  it("surfaces a failed read rather than falling back to mock data", async () => {
    supabase.mockResolvedValue(failingClient());

    await expect(getCustomers()).rejects.toMatchObject({ message: "boom" });
    expect(supabase).toHaveBeenCalled();
  });

  it("rejects a malformed customer id before opening a connection", async () => {
    const result = await updateCustomer("not-a-uuid", VALID);

    expect(result.error).toBe("Invalid customer.");
    expect(supabase).not.toHaveBeenCalled();
  });

  it("rejects invalid form values before opening a connection", async () => {
    const result = await createCustomer({ ...VALID, email: "nope" });

    expect(result.error).toBe("Check the form for errors.");
    expect(supabase).not.toHaveBeenCalled();
  });
});
