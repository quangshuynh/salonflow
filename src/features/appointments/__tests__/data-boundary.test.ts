import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppointmentJoinedRow } from "@/lib/db/mappers";
import { MOCK_APPOINTMENTS, MOCK_CUSTOMERS, MOCK_SERVICES, MOCK_STAFF } from "@/lib/mock-data";

/**
 * How the appointment data path interprets the database's answers. That RLS
 * and the composite foreign keys actually produce those answers — zero rows
 * for another tenant's appointment, 23503 for another tenant's customer — is
 * proven against real PostgreSQL in supabase/tests/20_appointments_test.sql.
 */

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db/server", () => ({ createClient: vi.fn() }));

const { revalidatePath } = await import("next/cache");
const { createClient } = await import("@/lib/db/server");
const { getAppointmentsWithRelations, getTodaysAppointments } = await import(
  "@/features/appointments/queries"
);
const { createAppointment, updateAppointmentStatus } = await import(
  "@/features/appointments/actions"
);

const supabase = vi.mocked(createClient);
const revalidate = vi.mocked(revalidatePath);

const OWN_BUSINESS = "11111111-1111-4111-8111-111111111111";
const OTHER_BUSINESS = "22222222-2222-4222-8222-222222222222";
const CUSTOMER = "c1111111-1111-4111-8111-111111111111";
const STAFF = "d1111111-1111-4111-8111-111111111111";
const SERVICE = "e1111111-1111-4111-8111-111111111111";
const APPOINTMENT = "a1111111-1111-4111-8111-111111111111";

function futureDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

const BOOKING = {
  customerId: CUSTOMER,
  staffId: STAFF,
  serviceId: SERVICE,
  date: futureDate(),
  time: "10:00",
};

type Result = { data: unknown; error: unknown };
type Call = { table: string; method: string; args: unknown[] };

/**
 * A client that answers per table in PostgREST's `{ data, error }` shape and
 * records every builder call, so a test can assert what was actually sent.
 * An array answers successive statements against the same table in order.
 */
function recordingClient(perTable: Record<string, Result | Result[]>) {
  const calls: Call[] = [];
  const queues = new Map(
    Object.entries(perTable).map(([table, entry]) => [
      table,
      Array.isArray(entry) ? [...entry] : null,
    ])
  );

  const from = (table: string) => {
    const queued = queues.get(table);
    const answer =
      (queued ? queued.shift() : (perTable[table] as Result | undefined)) ?? {
        data: null,
        error: null,
      };
    const result = Promise.resolve(answer);
    const chain: Record<string, unknown> = {};
    for (const method of ["select", "insert", "update", "delete", "eq", "order"]) {
      chain[method] = (...args: unknown[]) => {
        calls.push({ table, method, args });
        return chain;
      };
    }
    chain.maybeSingle = () => result;
    chain.single = () => result;
    chain.then = (...args: Parameters<typeof result.then>) => result.then(...args);
    return chain;
  };

  const client = { from } as unknown as Awaited<ReturnType<typeof createClient>>;
  return { client, calls };
}

const ownProfile = { data: { business_id: OWN_BUSINESS }, error: null };
const ownService = { data: { duration_min: 45 }, error: null };
const inserted = { data: null, error: null };

function inserts(calls: Call[]) {
  return calls.filter((c) => c.table === "appointments" && c.method === "insert");
}

beforeEach(() => {
  supabase.mockReset();
  revalidate.mockReset();
  // Raw database errors are logged server-side by design; keep output quiet.
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// ── Demo mode ───────────────────────────────────────────────────────────

describe("demo mode", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true"));

  it("serves the joined mock appointments without constructing a client", async () => {
    const appointments = await getAppointmentsWithRelations();

    expect(appointments).toHaveLength(MOCK_APPOINTMENTS.length);
    expect(appointments[0].customer.id).toBe(appointments[0].customerId);
    expect(supabase).not.toHaveBeenCalled();
  });

  it("refuses to book or update rather than pretending to save", async () => {
    const results = [
      await createAppointment({
        ...BOOKING,
        customerId: MOCK_CUSTOMERS[0].id,
        staffId: MOCK_STAFF[0].id,
        serviceId: MOCK_SERVICES[0].id,
      }),
      await updateAppointmentStatus(APPOINTMENT, "completed"),
    ];

    for (const result of results) expect(result.error).toMatch(/demo mode/i);
    expect(supabase).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });
});

// ── Authenticated reads ─────────────────────────────────────────────────

describe("reads in configured mode", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false"));

  const row: AppointmentJoinedRow = {
    id: APPOINTMENT,
    customer_id: CUSTOMER,
    staff_id: STAFF,
    service_id: SERVICE,
    starts_at: "2026-01-05T10:00:00+00:00",
    ends_at: "2026-01-05T10:45:00+00:00",
    status: "confirmed",
    customer: {
      id: CUSTOMER,
      name: "Alice Anders",
      email: null,
      phone: null,
      created_at: "2026-01-01T00:00:00+00:00",
    },
    staff: { id: STAFF, name: "Stylist A", role: "stylist", created_at: "2026-01-01T00:00:00+00:00" },
    service: {
      id: SERVICE,
      name: "Cut",
      category: "hair",
      duration_min: 45,
      price_cents: 5500,
      created_at: "2026-01-01T00:00:00+00:00",
    },
  };

  it("maps the database's rows and leaves tenant scoping to RLS", async () => {
    const { client, calls } = recordingClient({
      appointments: { data: [row], error: null },
    });
    supabase.mockResolvedValue(client);

    const [appointment] = await getAppointmentsWithRelations();

    expect(appointment).toMatchObject({
      id: APPOINTMENT,
      customer: { name: "Alice Anders" },
      staff: { initials: "SA" },
      service: { price: 55 },
    });
    // No application-side business filter: the query returns whatever the
    // caller's policies allow, so a forged filter could never widen it.
    expect(calls.some((c) => c.method === "eq")).toBe(false);
  });

  it("surfaces a failed read rather than falling back to mock data", async () => {
    const { client } = recordingClient({
      appointments: { data: null, error: { message: "boom" } },
    });
    supabase.mockResolvedValue(client);

    await expect(getAppointmentsWithRelations()).rejects.toMatchObject({
      message: "boom",
    });
    await expect(getTodaysAppointments()).rejects.toMatchObject({
      message: "boom",
    });
  });
});

// ── Booking ─────────────────────────────────────────────────────────────

describe("createAppointment in configured mode", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false"));

  it("writes the tenant from the caller's profile, never from the request", async () => {
    const { client, calls } = recordingClient({
      services: ownService,
      profiles: ownProfile,
      appointments: inserted,
    });
    supabase.mockResolvedValue(client);

    const forged = { ...BOOKING, businessId: OTHER_BUSINESS, business_id: OTHER_BUSINESS };
    const result = await createAppointment(forged);

    expect(result).toEqual({});
    const [insert] = inserts(calls);
    const payload = insert.args[0] as Record<string, unknown>;
    expect(payload.business_id).toBe(OWN_BUSINESS);
    expect(Object.values(payload)).not.toContain(OTHER_BUSINESS);
    // End time is derived from the service, not supplied by the client.
    expect(
      Date.parse(payload.ends_at as string) - Date.parse(payload.starts_at as string)
    ).toBe(45 * 60_000);
    expect(revalidate).toHaveBeenCalledWith("/appointments");
  });

  it("refuses a service it cannot see without attempting the insert", async () => {
    // Another tenant's service is filtered out by RLS: the lookup returns
    // nothing, exactly as for a service that was deleted.
    const { client, calls } = recordingClient({
      services: { data: null, error: null },
      profiles: ownProfile,
    });
    supabase.mockResolvedValue(client);

    const result = await createAppointment(BOOKING);

    expect(result.error).toBe("Selected service no longer exists.");
    expect(inserts(calls)).toHaveLength(0);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("reports a cross-tenant customer or staff reference without leaking schema details", async () => {
    // What the composite foreign key raises for a customer or staff member
    // outside the caller's business — or one that doesn't exist at all.
    const { client } = recordingClient({
      services: ownService,
      profiles: ownProfile,
      appointments: {
        data: null,
        error: {
          code: "23503",
          message:
            'insert or update on table "appointments" violates foreign key constraint "appointments_customer_fkey"',
        },
      },
    });
    supabase.mockResolvedValue(client);

    const result = await createAppointment(BOOKING);

    expect(result.error).toMatch(/no longer available/i);
    expect(result.error).not.toMatch(/foreign key|constraint|appointments_|tenant|business/i);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("reports an RLS refusal as a failure, not a success", async () => {
    const { client } = recordingClient({
      services: ownService,
      profiles: ownProfile,
      appointments: {
        data: null,
        error: {
          code: "42501",
          message: 'new row violates row-level security policy for table "appointments"',
        },
      },
    });
    supabase.mockResolvedValue(client);

    const result = await createAppointment(BOOKING);

    expect(result.error).toBeTruthy();
    expect(result.error).not.toMatch(/row-level|policy|appointments/i);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("hides an unexpected database error behind an actionable message", async () => {
    const { client } = recordingClient({
      services: { data: null, error: { code: "08006", message: "connection to 10.0.0.5 lost" } },
    });
    supabase.mockResolvedValue(client);

    const result = await createAppointment(BOOKING);

    expect(result.error).toMatch(/try again/i);
    expect(result.error).not.toMatch(/10\.0\.0\.5|connection/);
  });

  it("returns an error, rather than throwing, when the caller has no tenant", async () => {
    // Signed in, but no profile row — e.g. onboarding never completed.
    const { client, calls } = recordingClient({
      services: ownService,
      profiles: { data: null, error: null },
    });
    supabase.mockResolvedValue(client);

    const result = await createAppointment(BOOKING);

    expect(result.error).toMatch(/business/i);
    expect(inserts(calls)).toHaveLength(0);
  });

  it("returns an error when the tenant lookup itself fails", async () => {
    const { client, calls } = recordingClient({
      services: ownService,
      profiles: { data: null, error: { message: "JWT expired" } },
    });
    supabase.mockResolvedValue(client);

    const result = await createAppointment(BOOKING);

    expect(result.error).toBeTruthy();
    expect(result.error).not.toMatch(/JWT/);
    expect(inserts(calls)).toHaveLength(0);
  });

  it("rejects malformed reference ids before opening a connection", async () => {
    const result = await createAppointment({ ...BOOKING, customerId: "cus_1" });

    expect(result.error).toBe("Check the form for errors.");
    expect(supabase).not.toHaveBeenCalled();
  });
});

// ── Status updates ──────────────────────────────────────────────────────

describe("updateAppointmentStatus in configured mode", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false"));

  it("only applies the transition to the status it was validated against", async () => {
    const { client, calls } = recordingClient({
      appointments: [
        { data: { status: "confirmed" }, error: null },
        { data: { id: APPOINTMENT }, error: null },
      ],
    });
    supabase.mockResolvedValue(client);

    expect(await updateAppointmentStatus(APPOINTMENT, "completed")).toEqual({});

    const updateFilters = calls
      .slice(calls.findIndex((c) => c.method === "update"))
      .filter((c) => c.method === "eq")
      .map((c) => c.args);
    expect(updateFilters).toContainEqual(["id", APPOINTMENT]);
    expect(updateFilters).toContainEqual(["status", "confirmed"]);
  });

  it("does not report success when a concurrent change wins the race", async () => {
    // Validated as confirmed, but another request cancelled it before this
    // update ran: the guarded update touches nothing.
    const { client } = recordingClient({
      appointments: [
        { data: { status: "confirmed" }, error: null },
        { data: null, error: null },
      ],
    });
    supabase.mockResolvedValue(client);

    const result = await updateAppointmentStatus(APPOINTMENT, "completed");

    expect(result.error).toMatch(/refresh/i);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("hides database errors behind an actionable message", async () => {
    const { client } = recordingClient({
      appointments: [
        { data: { status: "confirmed" }, error: null },
        {
          data: null,
          error: { code: "XX000", message: 'relation "appointments" internal failure' },
        },
      ],
    });
    supabase.mockResolvedValue(client);

    const result = await updateAppointmentStatus(APPOINTMENT, "completed");

    expect(result.error).toMatch(/try again/i);
    expect(result.error).not.toMatch(/relation|internal/);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("rejects a malformed appointment id before opening a connection", async () => {
    const result = await updateAppointmentStatus("apt_1", "completed");

    expect(result.error).toBe("Invalid status update.");
    expect(supabase).not.toHaveBeenCalled();
  });
});
