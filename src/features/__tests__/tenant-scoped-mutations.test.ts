import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * RLS removes rows the caller cannot see from an UPDATE or DELETE instead of
 * raising, so PostgREST answers `{ data: null, error: null }` — the exact
 * shape a successful mutation of nothing would take. These tests prove the
 * server actions read that shape as a miss rather than as success.
 *
 * That RLS genuinely produces zero rows for a cross-tenant target is proven
 * against real PostgreSQL in supabase/tests, not here.
 */

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("@/lib/db/server", () => ({ createClient: vi.fn() }));

const { createClient } = await import("@/lib/db/server");
const { updateStaff, deleteStaff } = await import("@/features/staff/actions");
const { updateService, deleteService } = await import(
  "@/features/services/actions"
);
const { updateBusinessProfile } = await import("@/features/settings/actions");
const { updateAppointmentStatus } = await import(
  "@/features/appointments/actions"
);

const supabase = vi.mocked(createClient);

const ID = "3f1b9c40-0000-4000-8000-000000000001";
const STAFF = { name: "Avery Lee", role: "stylist" } as const;
const SERVICE = {
  name: "Haircut",
  category: "hair",
  durationMin: 45,
  price: 55,
} as const;
const BUSINESS = {
  name: "Glow Studio",
  email: "hello@glow.example.com",
  phone: "555-0100",
  address: "123 Main St",
};

type Result = { data: unknown; error: unknown };

/**
 * A client whose queries answer per table, mimicking PostgREST's shape. An
 * array answers successive statements against the same table in order, which
 * is how an action that reads before it writes gets two different answers.
 */
function clientReturning(perTable: Record<string, Result | Result[]>) {
  const queues = new Map(
    Object.entries(perTable)
      .filter(([, entry]) => Array.isArray(entry))
      .map(([table, entry]) => [table, [...(entry as Result[])]])
  );

  const from = (table: string) => {
    const queued = queues.get(table);
    const result = Promise.resolve(
      (queued ? queued.shift() : (perTable[table] as Result)) ?? {
        data: null,
        error: null,
      }
    );
    const chain = {
      select: () => chain,
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      maybeSingle: () => result,
      then: (...args: Parameters<typeof result.then>) => result.then(...args),
    };
    return chain;
  };
  return { from } as unknown as Awaited<ReturnType<typeof createClient>>;
}

/** Every mutation returns "no row touched" — the RLS-filtered case. */
const filteredOut = { data: null, error: null };
/** getBusinessId() reads the caller's own profile before settings writes. */
const ownProfile = { data: { business_id: ID }, error: null };

beforeEach(() => {
  supabase.mockReset();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
});

describe("mutations filtered out by RLS", () => {
  it("do not report success", async () => {
    supabase.mockResolvedValue(
      clientReturning({ staff: filteredOut, services: filteredOut })
    );

    const results = await Promise.all([
      updateStaff(ID, STAFF),
      deleteStaff(ID),
      updateService(ID, SERVICE),
      deleteService(ID),
    ]);

    for (const result of results) {
      expect(result.error).toBeTruthy();
    }
  });

  it("stay ambiguous about whether the row exists in another tenant", async () => {
    supabase.mockResolvedValue(
      clientReturning({ staff: filteredOut, services: filteredOut })
    );

    const messages = [
      (await updateStaff(ID, STAFF)).error,
      (await deleteStaff(ID)).error,
      (await updateService(ID, SERVICE)).error,
      (await deleteService(ID)).error,
    ];

    for (const message of messages) {
      expect(message).toMatch(/no longer exists, or isn't yours to change/);
      expect(message).not.toMatch(/tenant|business|permission|denied/i);
    }
  });

  it("reports a failed save for the business profile, not a not-found", async () => {
    supabase.mockResolvedValue(
      clientReturning({ profiles: ownProfile, businesses: filteredOut })
    );

    const result = await updateBusinessProfile(BUSINESS);

    // The target is the caller's own business, never a client-chosen record,
    // so "not found" would misdescribe it.
    expect(result.error).toMatch(/couldn't save/i);
  });
});

describe("mutations that do touch a row", () => {
  it("still report success", async () => {
    const touched = { data: { id: ID }, error: null };
    supabase.mockResolvedValue(
      clientReturning({
        staff: touched,
        services: touched,
        profiles: ownProfile,
        businesses: touched,
      })
    );

    expect(await updateStaff(ID, STAFF)).toEqual({});
    expect(await deleteStaff(ID)).toEqual({});
    expect(await updateService(ID, SERVICE)).toEqual({});
    expect(await deleteService(ID)).toEqual({});
    expect(await updateBusinessProfile(BUSINESS)).toEqual({});
  });
});

describe("domain-specific failures", () => {
  it("still explains a service blocked by its appointment history", async () => {
    supabase.mockResolvedValue(
      clientReturning({
        services: { data: null, error: { code: "23503", message: "fk" } },
      })
    );

    const result = await deleteService(ID);

    expect(result.error).toMatch(/appointment history/);
  });

  it("reports an unseen appointment as not found", async () => {
    // The status transition check reads the appointment first, under the same
    // policy as the update, so an invisible row never reaches the mutation.
    supabase.mockResolvedValue(clientReturning({ appointments: filteredOut }));

    const result = await updateAppointmentStatus(ID, "completed");

    expect(result.error).toBe("Appointment not found.");
  });

  it("reports not found when the appointment vanishes after the pre-read", async () => {
    // The race the pre-read cannot cover: the row is visible when its status
    // is checked, then gone — a concurrent cascade delete — by the time the
    // update runs. Zero affected rows must not read as success.
    supabase.mockResolvedValue(
      clientReturning({
        appointments: [{ data: { status: "confirmed" }, error: null }, filteredOut],
      })
    );

    const result = await updateAppointmentStatus(ID, "completed");

    expect(result.error).toBe("Appointment not found.");
  });

  it("still completes an appointment that is present for both statements", async () => {
    supabase.mockResolvedValue(
      clientReturning({
        appointments: [
          { data: { status: "confirmed" }, error: null },
          { data: { id: ID }, error: null },
        ],
      })
    );

    expect(await updateAppointmentStatus(ID, "completed")).toEqual({});
  });
});
